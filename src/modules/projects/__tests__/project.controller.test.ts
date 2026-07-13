// src/modules/projects/__tests__/project.controller.test.ts
import { Request, Response } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../project.controller";
import * as projectService from "../project.service";

jest.mock("../project.service");

const mockCreateProject = projectService.createProject as jest.Mock;
const mockGetProjects = projectService.getProjects as jest.Mock;
const mockGetProjectById = projectService.getProjectById as jest.Mock;
const mockUpdateProject = projectService.updateProject as jest.Mock;
const mockDeleteProject = projectService.deleteProject as jest.Mock;

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockProject = {
    id: 1,
    name: "Test Project",
    description: "A test project",
    ownerId: 1,
    createdAt: new Date(),
    tasks: [],
};

const mockReqWithUser = (overrides = {}) =>
    ({
        user: { id: 1, role: "MEMBER" },
        body: {},
        params: {},
        ...overrides,
    } as unknown as Request);

describe("createProjectController", () => {
    it("should return 201 with created project", async () => {
        const req = mockReqWithUser({
        body: { name: "Test Project", description: "A test project" },
        });
        const res = mockRes();
        mockCreateProject.mockResolvedValue(mockProject);

        await createProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockProject);
    });

    it("should return 400 on validation error", async () => {
        const req = mockReqWithUser({ body: { name: "" } });
        const res = mockRes();

        await createProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("getProjectsController", () => {
    it("should return 200 with list of projects", async () => {
        const req = mockReqWithUser();
        const res = mockRes();
        mockGetProjects.mockResolvedValue([mockProject]);

        await getProjectsController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([mockProject]);
    });
});

describe("getProjectByIdController", () => {
    it("should return 200 with project", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetProjectById.mockResolvedValue(mockProject);

        await getProjectByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockProject);
    });

    it("should return 404 if project not found", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetProjectById.mockRejectedValue(new Error("Project not found"));

        await getProjectByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 403 if user is not owner", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetProjectById.mockRejectedValue(new Error("Access denied"));

        await getProjectByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe("updateProjectController", () => {
    it("should return 200 with updated project", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { name: "Updated" },
        });
        const res = mockRes();
        mockUpdateProject.mockResolvedValue({ ...mockProject, name: "Updated" });

        await updateProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ ...mockProject, name: "Updated" });
    });

    it("should return 404 if project not found", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { name: "Updated" },
        });
        const res = mockRes();
        mockUpdateProject.mockRejectedValue(new Error("Project not found"));

        await updateProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("deleteProjectController", () => {
    it("should return 200 with deleted project", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockDeleteProject.mockResolvedValue(mockProject);

        await deleteProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockProject);
    });

    it("should return 403 if user is not owner", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockDeleteProject.mockRejectedValue(new Error("Access denied"));

        await deleteProjectController(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});