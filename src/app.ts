import express, { Express } from "express";
import userRouter from "./modules/users/user.routes";
import projectRouter from "./modules/projects/project.routes";

const app: Express = express();

app.use(express.json());
app.use("/api/auth", userRouter);
app.use('/api/projects', projectRouter);

export default app;