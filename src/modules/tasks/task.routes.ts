import { Router } from 'express';
import type { Router as ExpressRouter} from 'express';
import { 
    getTaskByIdController,
    updateTaskController,
    deleteTaskController
} from './task.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const taskRouter: ExpressRouter = Router();
taskRouter.use(authMiddleware);

taskRouter.get('/:id', getTaskByIdController);
taskRouter.put('/:id', updateTaskController);
taskRouter.delete('/:id', deleteTaskController);

export default taskRouter;