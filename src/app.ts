import express, { Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import userRouter, { userManagementRouter } from "./modules/users/user.routes";
import projectRouter from "./modules/projects/project.routes";
import taskRouter from "./modules/tasks/task.routes";
import { openApiSpec } from "./docs/openapi";

const app: Express = express();

// CORS_ORIGIN accepts a comma-separated list (e.g. "http://localhost:5173,https://my-app.vercel.app").
// When unset, every origin is allowed; auth uses Bearer tokens, not cookies.
const allowedOrigins = process.env["CORS_ORIGIN"]
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : "*" }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/auth', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/users', userManagementRouter);

export default app;
