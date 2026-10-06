// src/modules/users/__tests__/user.controller.test.ts
import { Request, Response } from "express";
import { registerController, loginController } from "../user.controller";
import * as userService from "../user.service";
import { getUsersController, getUserByIdController, updateUserController, deleteUserController } from "../user.controller";
import { NotFoundError, AccessDeniedError, AppError } from "../../../lib/errors";

jest.mock("../user.service");

const mockRegister = userService.register as jest.Mock;
const mockLogin = userService.login as jest.Mock;
const mockGetUsers = userService.getUsers as jest.Mock;
const mockGetUserById = userService.getUserById as jest.Mock;
const mockUpdateUser = userService.updateUser as jest.Mock;
const mockDeleteUser = userService.deleteUser as jest.Mock;

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockSafeUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "MEMBER",
    createdAt: new Date(),
};

describe("registerController", () => {
    it("should return 201 with user on success", async () => {
        const req = {
        body: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
        },
        } as Request;
        const res = mockRes();

        mockRegister.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "MEMBER",
        createdAt: new Date(),
        });

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ email: "john@example.com" })
        );
    });

    it("should return 400 with validation errors on invalid body", async () => {
        const req = { body: { email: "not-an-email" } } as Request;
        const res = mockRes();

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if email already in use", async () => {
        const req = {
            body: {
                name: "John Doe",
                email: "john@example.com",
                password: "password123",
            },
        } as Request;
        const res = mockRes();

        mockRegister.mockRejectedValue(new AppError("Email already in use", 409));

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Email already in use" });
    });
});

describe("loginController", () => {
    it("should return 200 with token on success", async () => {
        const req = {
        body: {
            email: "john@example.com",
            password: "password123",
        },
        } as Request;
        const res = mockRes();

        mockLogin.mockResolvedValue({ token: "jwt.token.here", user: mockSafeUser });

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: "jwt.token.here", user: mockSafeUser });
    });

    it("should return 400 with validation errors on invalid body", async () => {
        const req = { body: { email: "not-an-email" } } as Request;
        const res = mockRes();

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 if credentials are invalid", async () => {
        const req = {
            body: {
                email: "john@example.com",
                password: "password123",
            },
        } as Request;
        const res = mockRes();

        mockLogin.mockRejectedValue(new AppError("Invalid credentials", 401));

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
});

describe("getUsersController", () => {
    it("should return 200 with list of users", async () => {
        const req = { user: { id: 1, role: "ADMIN" } } as unknown as Request;
        const res = mockRes();
        mockGetUsers.mockResolvedValue([mockSafeUser]);

        await getUsersController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([mockSafeUser]);
    });
});

describe("getUserByIdController", () => {
    it("should return 200 with user", async () => {
        const req = {
        user: { id: 1, role: "MEMBER" },
        params: { id: "1" },
        } as unknown as Request;
        const res = mockRes();
        mockGetUserById.mockResolvedValue(mockSafeUser);

        await getUserByIdController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockSafeUser);
    });

    it("should return 404 if user not found", async () => {
        const req = {
        user: { id: 1, role: "MEMBER" },
        params: { id: "1" },
        } as unknown as Request;
        const res = mockRes();
        mockGetUserById.mockRejectedValue(new NotFoundError("User not found"));

        await getUserByIdController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("updateUserController", () => {
    it("should return 200 with updated user", async () => {
        const req = {
        user: { id: 1, role: "MEMBER" },
        params: { id: "1" },
        body: { name: "Updated" },
        } as unknown as Request;
        const res = mockRes();
        mockUpdateUser.mockResolvedValue({ ...mockSafeUser, name: "Updated" });

        await updateUserController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if requester is not the user", async () => {
        const req = {
        user: { id: 2, role: "MEMBER" },
        params: { id: "1" },
        body: { name: "Updated" },
        } as unknown as Request;
        const res = mockRes();
        mockUpdateUser.mockRejectedValue(new AccessDeniedError("Access denied"));

        await updateUserController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe("deleteUserController", () => {
    it("should return 200 with deleted user", async () => {
        const req = {
        user: { id: 1, role: "ADMIN" },
        params: { id: "1" },
        } as unknown as Request;
        const res = mockRes();
        mockDeleteUser.mockResolvedValue(mockSafeUser);

        await deleteUserController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockSafeUser);
    });

    it("should return 404 if user not found", async () => {
        const req = {
        user: { id: 1, role: "ADMIN" },
        params: { id: "1" },
        } as unknown as Request;
        const res = mockRes();
        mockDeleteUser.mockRejectedValue(new NotFoundError("User not found"));

        await deleteUserController(req as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});