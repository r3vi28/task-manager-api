import { z } from "zod";
import { registerSchema, loginSchema, updateUserSchema } from "./user.schema";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { AccessDeniedError, AppError, NotFoundError } from "../../lib/errors";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type UpdateInput = z.infer<typeof updateUserSchema>;

/**
 * Registers a new user in the system.
 * Hashes the password before storing it and returns the created user without the password field.
 *
 * @param data - Validated registration input (name, email, password)
 * @returns The created user without the password field
 * @throws {Error} If the email is already in use
 *
 * @complexity Time: O(1) — single DB lookup + single insert, bcrypt hash is O(1) relative to input size
 * @complexity Space: O(1) — no collections grown relative to input
 */

export async function register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new AppError("Email already in use", 409); //409 conflict error
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hash,
        },
    });

    const { password, ...safeUser} = user;

    return safeUser;
}

/**
 * Validates user credentials and returns a signed JWT.
 *
 * @param data - Validated login input (email, password)
 * @returns An object containing the signed JWT token
 * @throws {Error} If the user does not exist or the password does not match
 *
 * @complexity Time: O(1) — single DB lookup, bcrypt compare is O(1) relative to input size
 * @complexity Space: O(1)
 */
export async function login(data: LoginInput) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!existingUser) {
        throw new AppError("Invalid credentials", 401); //401 Unauthorized
    }

    const comparedPassword = await bcrypt.compare(data.password, existingUser.password);

    if (!comparedPassword) {
        throw new AppError("Invalid credentials", 401); //401 Unauthorized
    }
        
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
        throw new AppError("JWT_SECRET is not defined", 500);
    }

    const token = jwt.sign(
        {
            id: existingUser.id,
            role: existingUser.role,
        }, 
        jwtSecret,
        {
            expiresIn: "7d"
        }
    );

    return { token };
}

/**
 * Retrieves all users while excluding sensitive fields from the result.
 * Selects only the public user attributes required by the application.
 *
 * @returns {Promise<User[]>} A promise that resolves to the list of users with public fields.
 */
export async function getUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
}

/**
 * Retrieves a user by its identifier while exposing only public fields.
 * Throws an error if the requested user does not exist.
 *
 * @param {number} userId - The identifier of the user to retrieve.
 * @returns {Promise<User>} A promise that resolves to the user's public data.
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export async function getUserById(userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
}

/**
 * Updates a user's information after verifying their existence and authorization.
 * Hashes the password when provided before persisting the changes and returns
 * the updated user with only public fields.
 *
 * @param {number} userId - The identifier of the user to update.
 * @param {number} requesterId - The identifier of the user performing the request.
 * @param {UpdateInput} data - The user fields to update.
 * @returns {Promise<User>} A promise that resolves to the updated user's public data.
 */
export async function updateUser(
    userId: number,
    requesterId: number,
    data: UpdateInput
) {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    if (requesterId !== userId) {
        throw new AccessDeniedError("Access denied");
    }

    const updateData = {
        ...data,
        ...(data.password && {
            password: await bcrypt.hash(data.password, 10),
        }),
    };

    return await prisma.user.update({
        where: {
            id: userId,
        },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
    });
}

/**
 * Deletes a user after verifying that the user exists.
 * Removes the user from the database and returns only the user's public fields.
 *
 * @param {number} userId - The identifier of the user to delete.
 * @returns {Promise<User>} A promise that resolves to the deleted user's public data.
 */
export async function deleteUser(userId: number) {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    return prisma.user.delete({
        where: {
            id: userId,
        },
            select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
}