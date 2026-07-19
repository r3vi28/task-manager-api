import { Response } from "express";
import { AppError } from "./errors";
/**
 * Maps service errors to the appropriate HTTP response.
 *
 * @param err - The error thrown by the service layer.
 * @param res - Express response object.
 * @returns {Response} The HTTP response containing the error message.
 */
export function handleServiceError(
    err: unknown,
    res: Response
): Response {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: "Internal server error",
    });
}