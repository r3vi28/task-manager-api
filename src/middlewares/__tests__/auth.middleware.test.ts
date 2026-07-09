// src/middlewares/__tests__/auth.middleware.test.ts
import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "../auth.middleware";
import jwt from "jsonwebtoken";

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe("authMiddleware", () => {
    it("should call next with valid token", () => {
        const token = jwt.sign(
        { id: 1, role: "MEMBER" },
        "test_secret",
        { expiresIn: "1h" }
        );

        const req = {
        headers: { authorization: `Bearer ${token}` },
        } as Request;
        const res = mockRes();

        process.env["JWT_SECRET"] = "test_secret";

        authMiddleware(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect((req as any).user).toMatchObject({ id: 1, role: "MEMBER" });
    });

    it("should return 401 if no authorization header", () => {
        const req = { headers: {} } as Request;
        const res = mockRes();

        authMiddleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    });

    it("should return 401 if token is invalid", () => {
        const req = {
        headers: { authorization: "Bearer invalid.token.here" },
        } as Request;
        const res = mockRes();

        authMiddleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    });
});