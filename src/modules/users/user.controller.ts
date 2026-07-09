import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./user.schema";
import { register, login } from "./user.service";

/**
 * Handles POST /api/auth/register.
 * Validates the request body and delegates registration to the user service.
 *
 * @returns 201 with the created user on success
 * @returns 400 if validation fails or email is already in use
 * @returns 500 on unexpected errors
 *
 * @complexity Time: O(1)
 * @complexity Space: O(1)
 */
export async function registerController(
    req: Request,
    res: Response
) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors
        });
    }

    try {
        const user = await register(result.data);

        return res.status(201).json(user);
    } catch(err) {
        if (err instanceof Error) {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

/**
 * Handles POST /api/auth/login.
 * Validates the request body and delegates authentication to the user service.
 *
 * @returns 200 with a signed JWT token on success
 * @returns 400 if validation fails or credentials are invalid
 * @returns 500 on unexpected errors
 *
 * @complexity Time: O(1)
 * @complexity Space: O(1)
 */
export async function loginController(
    req: Request,
    res: Response
) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors
        });
    }

    try {
        const token = await login(result.data);

        return res.status(200).json(token);
    } catch(err) {
        if (err instanceof Error) {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}