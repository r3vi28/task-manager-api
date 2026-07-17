import prisma from '../../lib/prisma';
import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from './task.schema';
import { getOwnedProject } from '../../lib/getOwnedProject';
import { TaskStatus, TaskPriority } from '../../../generated/prisma/enums';

type createTaskInput = z.infer<typeof createTaskSchema>;
type updateTaskInput = z.infer<typeof updateTaskSchema>;
type getTasksFilters = {
    status?: TaskStatus,
    priority?: TaskPriority,
    assignedToId?: number
};

/**
 * Creates a new task within a project after verifying that the project
 * belongs to the specified user. The created task is assigned to the user
 * and linked to the given project.
 *
 * @param {number} projectId - ID of the project that will own the task.
 * @param {number} userId - ID of the user creating the task.
 * @param {createTaskInput} data - Validated task creation data.
 * @returns {Promise<Task>} The newly created task.
 * @throws {Error} If the project does not exist or is not owned by the user.
 */
export async function createTask(
    projectId: number,
    userId: number,
    data: createTaskInput
) {
    await getOwnedProject(projectId, userId);

    return prisma.task.create({
        data: {
            ...data,
            projectId
        }
    });
}

/**
 * Retrieves tasks from a project after verifying the requesting user's ownership.
 * Applies the provided optional filters to the database query, returning only tasks
 * that match the specified criteria.
 *
 * @param {number} projectId - The identifier of the project containing the tasks.
 * @param {number} userId - The identifier of the user requesting the tasks.
 * @param {getTasksFilters} filters - Optional filtering criteria for the task query.
 * @returns {Promise<Task[]>} A promise that resolves to the matching tasks.
 */
export async function getTasks(
    projectId: number,
    userId: number,
    filters: getTasksFilters
) {
    await getOwnedProject(projectId, userId);

    const { status, priority, assignedToId } = filters;

    return prisma.task.findMany({
        where: {
            projectId,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(assignedToId && { assignedToId }),
        }
    })
}

/**
 * Retrieves a task by its identifier and verifies that the requesting user owns its project.
 * Fetches the task with its associated project information and returns it if access is allowed.
 *
 * @param {number} taskId - The identifier of the task to retrieve.
 * @param {number} userId - The identifier of the user requesting access.
 * @returns {Promise<Task>} A promise that resolves to the requested task.
 */
export async function getTaskById(
    taskId: number,
    userId: number
) {
    const task = await getTaskWithProject(taskId);

    await getOwnedProject(task.project.id, userId);

    return task;
}

/**
 * Updates a task after verifying that the requesting user owns the associated project.
 * Retrieves the task, validates access permissions, and applies the provided updates.
 *
 * @param {number} taskId - The identifier of the task to update.
 * @param {number} userId - The identifier of the user requesting the update.
 * @param {updateTaskInput} data - The fields to update on the task.
 * @returns {Promise<Task>} A promise that resolves to the updated task.
 */
export async function updateTask(
    taskId: number,
    userId: number,
    data: updateTaskInput
) {
    const task = await getTaskWithProject(taskId);

    await getOwnedProject(task.project.id, userId);

    return prisma.task.update({
        where: {
            id: taskId
        },
        data,
    })
}

/**
 * Deletes a task after verifying that the requesting user owns the associated project.
 * Retrieves the task, validates access permissions, and removes it from the database.
 *
 * @param {number} taskId - The identifier of the task to delete.
 * @param {number} userId - The identifier of the user requesting the deletion.
 * @returns {Promise<Task>} A promise that resolves to the deleted task.
 */
export async function deleteTask(
    taskId: number,
    userId: number
) {
    const task = await getTaskWithProject(taskId);

    await getOwnedProject(task.project.id, userId);

    return prisma.task.delete({
        where: {
            id: taskId,
        }
    });
}

/**
 * Retrieves a task by its identifier along with its associated project information.
 * Throws an error if the requested task does not exist.
 *
 * @param {number} taskId - The identifier of the task to retrieve.
 * @returns {Promise<Task>} A promise that resolves to the task with project data.
 */
export async function getTaskWithProject(taskId: number) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
        include: {
            project: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!task) {
        throw new Error("Task not found");
    }

    return task;
}