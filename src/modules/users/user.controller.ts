import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./user.schema";
import { register, login } from "./user.service";

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