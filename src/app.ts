import express, { Express } from "express";
import userRouter, { userManagementRouter } from "./modules/users/user.routes";
import projectRouter from "./modules/projects/project.routes";
import taskRouter from "./modules/tasks/task.routes";

const app: Express = express();

app.use(express.json());
app.use('/api/auth', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/users', userManagementRouter);

export default app;