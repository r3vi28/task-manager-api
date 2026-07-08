import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { registerController, loginController } from "./user.controller";

const router: ExpressRouter = Router();

router.post('/register', registerController);
router.post('/login', loginController);

export default router;