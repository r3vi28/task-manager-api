import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { 
    registerController,
    loginController,
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController
} from "./user.controller";
import { requireRole } from "../../middlewares/role.middleware";
import { Role } from "../../../generated/prisma/enums";
import { authMiddleware } from "../../middlewares/auth.middleware";

const userRouter: ExpressRouter = Router();
export const userManagementRouter: ExpressRouter = Router();
userManagementRouter.use(authMiddleware);

userRouter.post('/register', registerController);
userRouter.post('/login', loginController);
userManagementRouter.get('/', requireRole(Role.ADMIN), getUsersController);
userManagementRouter.get('/:id',  getUserByIdController);
userManagementRouter.put('/:id', updateUserController);
userManagementRouter.delete('/:id', requireRole(Role.ADMIN), deleteUserController);

export default userRouter;