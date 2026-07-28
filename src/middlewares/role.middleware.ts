import { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/enums";

export function requireRole(...roles: Role[]) {
    return function(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const userRole = req.user!.role as Role;

        if (!userRole) {
            return res.status(401).json({
                message: "userRole not found",
            });
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied",
            });
        }

        next();
    }
}