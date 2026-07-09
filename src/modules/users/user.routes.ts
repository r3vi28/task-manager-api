import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { registerController, loginController } from "./user.controller";

const userRouter: ExpressRouter = Router();

userRouter.post('/register', registerController);
userRouter.post('/login', loginController);

export default userRouter;