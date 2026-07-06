// src/modules/users/__tests__/user.controller.test.ts
import { Request, Response } from "express";
import { registerController, loginController } from "../user.controller";
import * as userService from "../user.service";

jest.mock("../user.service");

const mockRegister = userService.register as jest.Mock;
const mockLogin = userService.login as jest.Mock;

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
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

    it("should return 400 if service throws known error", async () => {
        const req = {
        body: {
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
        },
        } as Request;
        const res = mockRes();

        mockRegister.mockRejectedValue(new Error("Email already in use"));

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
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

        mockLogin.mockResolvedValue({ token: "jwt.token.here" });

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: "jwt.token.here" });
    });

    it("should return 400 with validation errors on invalid body", async () => {
        const req = { body: { email: "not-an-email" } } as Request;
        const res = mockRes();

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if service throws known error", async () => {
        const req = {
        body: {
            email: "john@example.com",
            password: "password123",
        },
        } as Request;
        const res = mockRes();

        mockLogin.mockRejectedValue(new Error("Invalid credentials"));

        await loginController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
});