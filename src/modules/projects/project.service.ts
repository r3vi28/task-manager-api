import prisma from "../../lib/prisma";
import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import { getOwnedProject } from "../../lib/getOwnedProject";

type createProjectInput = z.infer<typeof createProjectSchema>;
type updateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Creates a new project and assigns it to the specified owner.
 *
 * @param {createProjectInput} data - The validated project data.
 * @param {number} ownerId - The ID of the user who will own the project.
 * @returns {Promise<Project>} A promise that resolves to the newly created project.
 */
export async function createProject(
    data: createProjectInput,
    ownerId: number
) {
    return await prisma.project.create({
        data: {
            ...data,
            ownerId,
        }
    })
}

/**
 * Retrieves all projects owned by the specified user, including their associated
 * tasks. Returns an empty array if the user has no projects.
 *
 * @param {number} userId - The ID of the user whose projects should be retrieved.
 * @returns {Promise<Project[]>} A promise that resolves to the user's projects with their tasks.
 */
export async function getProjects (userId: number) {
    return await prisma.project.findMany({
        where: { ownerId: userId},
        include: { tasks: true},
    })
}

/**
 * Retrieves a project by its ID, including its tasks, and verifies that it belongs
 * to the specified user before returning it.
 *
 * @param {number} projectId - The ID of the project to retrieve.
 * @param {number} userId - The ID of the user requesting the project.
 * @returns {Promise<Project & { tasks: Task[] }>} A promise that resolves to the requested project with its associated tasks.
 * @throws {Error} If the project does not exist.
 * @throws {Error} If the user is not the owner of the project.
 */
export async function getProjectById(
    projectId: number,
    userId: number
) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { tasks: true },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    if (project.ownerId !== userId) {
        throw new Error("Access denied");
    }

    return project;
}

/**
 * Updates an existing project after verifying that it exists and that the
 * specified user is its owner.
 *
 * @param {number} projectId - The ID of the project to update.
 * @param {number} userId - The ID of the user requesting the update.
 * @param {updateProjectInput} data - The validated project data to update.
 * @returns {Promise<Project>} A promise that resolves to the updated project.
 * @throws {Error} If the project does not exist.
 * @throws {Error} If the user is not the owner of the project.
 */
export async function updateProject(
    projectId: number,
    userId: number,
    data: updateProjectInput
) {
    await getOwnedProject(projectId, userId);

    return await prisma.project.update({
        where: { id: projectId },
        data,
    });
}

/**
 * Deletes an existing project after verifying that it exists and that the
 * specified user is its owner.
 *
 * @param {number} projectId - The ID of the project to delete.
 * @param {number} userId - The ID of the user requesting the deletion.
 * @returns {Promise<Project>} A promise that resolves to the deleted project.
 * @throws {Error} If the project does not exist.
 * @throws {Error} If the user is not the owner of the project.
 */
export async function deleteProject(
    projectId: number,
    userId: number
) {
    await getOwnedProject(projectId, userId);

    return prisma.project.delete({
        where: { id: projectId},
    });
}