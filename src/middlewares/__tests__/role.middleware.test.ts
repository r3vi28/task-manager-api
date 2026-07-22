// src/middlewares/__tests__/role.middleware.test.ts
import { Request, Response, NextFunction } from "express";
import { requireRole } from "../role.middleware";

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("requireRole", () => {
    it("should call next if user has required role", () => {
      const req = {
        user: { id: 1, role: "ADMIN" },
      } as unknown as Request;
      const res = mockRes();

      requireRole("ADMIN")(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 403 if user does not have required role", () => {
      const req = {
        user: { id: 1, role: "MEMBER" },
      } as unknown as Request;
      const res = mockRes();

      requireRole("ADMIN")(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    });

    it("should call next if user has one of multiple allowed roles", () => {
      const req = {
        user: { id: 1, role: "MEMBER" },
      } as unknown as Request;
      const res = mockRes();

      requireRole("ADMIN", "MEMBER")(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
});