import { Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "./project.service";
import { handleServiceError } from "../../lib/handleServiceError";

/**
 * Validates the request body, creates a new project for the authenticated user,
 * and returns the created project. Responds with appropriate HTTP status codes
 * for validation errors, known service errors, and unexpected failures.
 *
 * @param {Request} req - Express request containing the project data and authenticated user.
 * @param {Response} res - Express response used to send the HTTP response.
 * @returns {Promise<Response>} A response containing the created project or an error message.
 */
export async function createProjectController(
    req: Request,
    res: Response
) {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors,
        });
    }

    try {
        const project = await createProject(result.data, req.user!.id);

        return res.status(201).json(project);
    } catch (err) {
        return handleServiceError(err, res);
    }
}

/**
 * Retrieves all projects that belong to the authenticated user and returns
 * them as a JSON array. Uses the authenticated user's ID to fetch only
 * the projects they own.
 *
 * @param {Request} req - Express request containing the authenticated user.
 * @param {Response} res - Express response used to send the HTTP response.
 * @returns {Promise<Response>} A response containing the user's projects or an error message.
 */
export async function getProjectsController(
    req: Request,
    res: Response
) {
    try {
        const projects = await getProjects(req.user!.id);

        return res.status(200).json(projects);
    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({
                message: err.message,
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

/**
 * Retrieves a project by its ID for the authenticated user.
 * Extracts the project ID from the request parameters, delegates the lookup
 * to the service layer, and returns the project or the appropriate error response.
 *
 * @param {Request} req - Express request containing the project ID and authenticated user.
 * @param {Response} res - Express response used to send the HTTP response.
 * @returns {Promise<Response>} A response containing the requested project or an error message.
 */
export async function getProjectByIdController(
    req: Request,
    res: Response
) {
    const projectId = Number(req.params.id);

    if (Number.isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
            message: "Invalid project id",
        });
    }

    try {
        const project = await getProjectById(projectId, req.user!.id);

        return res.status(200).json(project);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Validates the request body and updates an existing project owned by the
 * authenticated user. Extracts the project ID from the request parameters,
 * delegates the update to the service layer, and returns the updated project.
 *
 * @param {Request} req - Express request containing the project ID, updated data, and authenticated user.
 * @param {Response} res - Express response used to send the HTTP response.
 * @returns {Promise<Response>} A response containing the updated project or an error message.
 */
export async function updateProjectController(
    req: Request,
    res: Response
) {
    const result = updateProjectSchema.safeParse(req.body);

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
        const project = await updateProject(projectId, req.user!.id, result.data);

        return res.status(200).json(project);
    } catch (err) {
        return handleServiceError(err, res);
    }
}

export async function deleteProjectController(
    req: Request,
    res: Response
) {
    const projectId = Number(req.params.id);

    if (Number.isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
            message: "Invalid project id",
        });
    }

    try {
        const project = await deleteProject(projectId, req.user!.id);

        return res.status(200).json(project)
    } catch(err) {
        return handleServiceError(err, res);
    }
}