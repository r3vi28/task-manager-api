import { z } from "zod";
import { registerSchema, loginSchema } from "./user.schema";
import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import "dotenv/config";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

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