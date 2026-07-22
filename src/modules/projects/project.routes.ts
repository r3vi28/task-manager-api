import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { 
    createProjectController,
    getProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController
} from "./project.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createTaskController, getTasksController } from "../tasks/task.controller";
import { requireRole } from "../../middlewares/role.middleware";
import { Role } from "../../../generated/prisma/enums";

const projectRouter: ExpressRouter = Router();
projectRouter.use(authMiddleware);

projectRouter.get('/', getProjectsController);
projectRouter.post('/', createProjectController);
projectRouter.get('/:id', getProjectByIdController);
projectRouter.put('/:id', updateProjectController);
projectRouter.delete('/:id',requireRole(Role.ADMIN), deleteProjectController);
projectRouter.get('/:id/tasks', getTasksController);
projectRouter.post('/:id/tasks', createTaskController);

export default projectRouter;