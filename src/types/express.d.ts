import "express";
import { Role } from "../../generated/prisma/enums";

declare module "express" {
    interface Request {
        user?: {
        id: number;
        role: string;
        };
    }
}