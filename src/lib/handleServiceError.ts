import { Response } from "express";
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
    if (err instanceof Error) {
        switch (err.message) {
            case "Project not found":
                return res.status(404).json({
                    message: err.message,
                });

            case "Task not found":
                return res.status(404).json({
                    message: err.message,
                });

            case "Access denied":
                return res.status(403).json({
                    message: err.message,
                });

            default:
                return res.status(400).json({
                    message: err.message,
                });
        }
    }

    return res.status(500).json({
        message: "Internal server error",
    });
}