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

const projectRouter: ExpressRouter = Router();
projectRouter.use(authMiddleware);

projectRouter.get('/', getProjectsController);
projectRouter.post('/', createProjectController);
projectRouter.get('/:id', getProjectByIdController);
projectRouter.put('/:id', updateProjectController);
projectRouter.delete('/:id', deleteProjectController);

export default projectRouter;