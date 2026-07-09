import express, { Express } from "express";
import userRouter from "./modules/users/user.routes";

const app: Express = express();

app.use(express.json());
app.use("/api/auth", userRouter)

export default app;