import { Request, Response } from "express";
import { loginSchema, registerSchema, updateUserSchema } from "./user.schema";
import { register, login, getUsers, getUserById, updateUser, deleteUser} from "./user.service";
import { handleServiceError } from "../../lib/handleServiceError";

/**
 * Handles POST /api/auth/register.
 * Validates the request body and delegates registration to the user service.
 *
 * @returns 201 with the created user on success
 * @returns 400 if validation fails or email is already in use
 * @returns 500 on unexpected errors
 *
 * @complexity Time: O(1)
 * @complexity Space: O(1)
 */
export async function registerController(
    req: Request,
    res: Response
) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors
        });
    }

    try {
        const user = await register(result.data);

        return res.status(201).json(user);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles POST /api/auth/login.
 * Validates the request body and delegates authentication to the user service.
 *
 * @returns 200 with a signed JWT token on success
 * @returns 400 if validation fails or credentials are invalid
 * @returns 500 on unexpected errors
 *
 * @complexity Time: O(1)
 * @complexity Space: O(1)
 */
export async function loginController(
    req: Request,
    res: Response
) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors
        });
    }

    try {
        const token = await login(result.data);

        return res.status(200).json(token);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles requests to retrieve all users.
 * Delegates the operation to the service layer and returns the list of users
 * or an appropriate error response if execution fails.
 *
 * @param {Request} req - The Express request.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function getUsersController(
    req: Request,
    res: Response
) {
    try {
        const users = await getUsers();

        return res.status(200).json(users);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles requests to retrieve a user by its identifier after validating the user ID.
 * Delegates the retrieval to the service layer and returns the user or an
 * appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the user identifier.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function getUserByIdController(
    req: Request,
    res: Response
) {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Invalid user id",
        });
    }

    try {
        const user = await getUserById(userId);

        return res.status(200).json(user);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles user update requests by validating the request payload and user identifier
 * before delegating the operation to the service layer. Returns the updated user or
 * an appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the user identifier and update data.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function updateUserController(
    req: Request,
    res: Response
) {
    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: result.error.flatten().fieldErrors
        });
    }

    const userId = Number(req.params.id);

    if (Number.isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Invalid user id",
        });
    }

    try {
        const user = await updateUser(userId, req.user!.id, result.data);

        return res.status(200).json(user);
    } catch(err) {
        return handleServiceError(err, res);
    }
}

/**
 * Handles user deletion requests by validating the user identifier before
 * delegating the operation to the service layer. Returns the deleted user or
 * an appropriate error response if validation or execution fails.
 *
 * @param {Request} req - The Express request containing the user identifier.
 * @param {Response} res - The Express response used to send the result.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export async function deleteUserController(
    req: Request,
    res: Response
) {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            message: "Invalid user id",
        });
    }

    try {
        const user = await deleteUser(userId);

        return res.status(200).json(user);
    } catch(err) {
        return handleServiceError(err, res);
    }
}