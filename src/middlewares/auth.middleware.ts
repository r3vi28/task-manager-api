import { Request, Response, NextFunction } from "express";
import 'dotenv/config';
import jwt, { JwtPayload } from 'jsonwebtoken';

type AuthPayload = JwtPayload & {
    id: number;
    role: string;
};

/**
 * Express middleware that protects routes requiring authentication.
 * Extracts and verifies the Bearer JWT from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 *
 * @returns 401 if the token is missing, malformed, or invalid
 * @returns 500 if JWT_SECRET is not configured
 *
 * @complexity Time: O(1)
 * @complexity Space: O(1)
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    // Split only on the first space to safely extract the token
    // regardless of whether the payload itself contains spaces
    const [, token] = authHeader.split(" ");

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(500).json({
            message: "JWT secret not configured"
        });
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as AuthPayload;

        req.user = payload;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}