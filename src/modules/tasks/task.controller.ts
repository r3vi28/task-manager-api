import { Request, Response } from "express";
import { createTaskSchema, updateTaskSchema } from "./task.schema";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "./task.service";
import { handleServiceError } from "../../lib/handleServiceError";
import { z } from 'zod';
import { TaskStatus, TaskPriority } from "../../../generated/prisma/enums";

const getTasksFiltersSchema = z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    assignedToId: z.coerce.number().int().positive().optional(),
});

/**
 * Handles task creation requests by validating the request payload and project identifier
 * before delegating the operation to the service layer. Returns the created task or an
 * appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the task data and project identifier.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function createTaskController(
    req: Request,
    res: Response
) {
    const result = createTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors,
        });
    }
    
    const projectId = Number(req.params.id);

    if (Number.isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
            message: "Invalid project id",
        });
    }

    try {
        const task = await createTask(projectId, req.user!.id, result.data);

        return res.status(201).json(task);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles requests to retrieve project tasks by validating the project identifier and
 * query filters before delegating the operation to the service layer. Returns the
 * matching tasks or an appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the project identifier and query filters.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function getTasksController(
    req: Request,
    res: Response
) {
    const projectId = Number(req.params.id);

    if (Number.isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
            message: "Invalid project id",
        });
    }

    const result = getTasksFiltersSchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors,
        });
    }


    try {
        const tasks = await getTasks(projectId, req.user!.id, result.data);

        return res.status(200).json(tasks);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles requests to retrieve a task by its identifier after validating the task ID.
 * Delegates the retrieval to the service layer and returns the task or an appropriate
 * error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the task identifier.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function getTaskByIdController(
    req: Request,
    res: Response
) {
    const taskId = Number(req.params.id);

    if (Number.isNaN(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task id",
        });
    }

    try {
        const task = await getTaskById(taskId, req.user!.id);

        return res.status(200).json(task);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles task update requests by validating the request payload and task identifier
 * before delegating the operation to the service layer. Returns the updated task or an
 * appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the task identifier and update data.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function updateTaskController(
    req: Request,
    res: Response
) {
    const result = updateTaskSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors,
        });
    }

    const taskId = Number(req.params.id);

    if (Number.isNaN(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task id",
        });
    }

    try {
        const task = await updateTask(taskId, req.user!.id, result.data);

        return res.status(200).json(task);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles task deletion requests by validating the task identifier before delegating
 * the operation to the service layer. Returns the deleted task or an appropriate
 * error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the task identifier.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function deleteTaskController(
    req: Request,
    res: Response
) {
    const taskId = Number(req.params.id);

    if (Number.isNaN(taskId) || taskId <= 0) {
        return res.status(400).json({
            message: "Invalid task id",
        });
    }

    try {
        const task = await deleteTask(taskId, req.user!.id);

        return res.status(200).json(task);
    } catch(err) {
        return handleServiceError(err, res);
    }
}