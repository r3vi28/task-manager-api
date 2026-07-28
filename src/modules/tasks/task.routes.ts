import { Router } from 'express';
import type { Router as ExpressRouter} from 'express';
import { 
    getTaskByIdController,
    updateTaskController,
    deleteTaskController
} from './task.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { Role } from '../../../generated/prisma/enums';

const taskRouter: ExpressRouter = Router();
taskRouter.use(authMiddleware);

taskRouter.get('/:id', getTaskByIdController);
taskRouter.put('/:id', updateTaskController);
taskRouter.delete('/:id',requireRole(Role.ADMIN), deleteTaskController);

export default taskRouter;