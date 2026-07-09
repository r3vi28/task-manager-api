import { z } from "zod";
import { registerSchema, loginSchema } from "./user.schema";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import "dotenv/config";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

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
        throw new Error("Email already in use");
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
        throw new Error("Invalid credentials");
    }

    const comparedPassword = await bcrypt.compare(data.password, existingUser.password);

    if (!comparedPassword) {
        throw new Error("Invalid credentials")
    }
        
    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined");
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