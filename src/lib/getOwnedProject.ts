import { AccessDeniedError, NotFoundError } from "./errors";
import prisma from "./prisma";

/**
 * Retrieves a project by its ID and verifies that it exists and is owned by
 * the specified user.
 *
 * @param {number} projectId - The ID of the project to retrieve.
 * @param {number} userId - The ID of the user requesting access to the project.
 * @returns {Promise<Project>} A promise that resolves to the owned project.
 * @throws {Error} If the project does not exist.
 * @throws {Error} If the user is not the owner of the project.
 */
export async function getOwnedProject(
    projectId: number,
    userId: number
) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new NotFoundError("Project not found");
    }

    if (project.ownerId !== userId) {
        throw new AccessDeniedError("Access denied");
    }

    return project;
}