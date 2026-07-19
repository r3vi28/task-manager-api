// src/modules/tasks/__tests__/task.controller.test.ts
import { Request, Response } from "express";
import {
    createTaskController,
    getTasksController,
    getTaskByIdController,
    updateTaskController,
    deleteTaskController,
} from "../task.controller";
import * as taskService from "../task.service";
import { NotFoundError } from "../../../lib/errors";

jest.mock("../task.service");

const mockCreateTask = taskService.createTask as jest.Mock;
const mockGetTasks = taskService.getTasks as jest.Mock;
const mockGetTaskById = taskService.getTaskById as jest.Mock;
const mockUpdateTask = taskService.updateTask as jest.Mock;
const mockDeleteTask = taskService.deleteTask as jest.Mock;

const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockTask = {
    id: 1,
    title: "Fix bug",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    assignedToId: null,
    projectId: 1,
    dueDate: null,
    createdAt: new Date(),
};

const mockReqWithUser = (overrides = {}) =>
    ({
        user: { id: 1, role: "MEMBER" },
        body: {},
        params: {},
        query: {},
        ...overrides,
    } as unknown as Request);

describe("createTaskController", () => {
    it("should return 201 with created task", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { title: "Fix bug" },
        });
        const res = mockRes();
        mockCreateTask.mockResolvedValue(mockTask);

        await createTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it("should return 400 on validation error", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { title: "" },
        });
        const res = mockRes();

        await createTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if project not found", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { title: "Fix bug" },
        });
        const res = mockRes();
        mockCreateTask.mockRejectedValue(new NotFoundError("Project not found"));

        await createTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("getTasksController", () => {
    it("should return 200 with list of tasks", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetTasks.mockResolvedValue([mockTask]);

        await getTasksController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([mockTask]);
    });

    it("should pass filters to service", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        query: { status: "TODO", priority: "HIGH" },
        });
        const res = mockRes();
        mockGetTasks.mockResolvedValue([mockTask]);

        await getTasksController(req, res);

        expect(mockGetTasks).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({ status: "TODO", priority: "HIGH" })
        );
    });
});

describe("getTaskByIdController", () => {
    it("should return 200 with task", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetTaskById.mockResolvedValue(mockTask);

        await getTaskByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it("should return 404 if task not found", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockGetTaskById.mockRejectedValue(new NotFoundError("Task not found"));

        await getTaskByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("updateTaskController", () => {
    it("should return 200 with updated task", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { title: "Updated" },
        });
        const res = mockRes();
        mockUpdateTask.mockResolvedValue({ ...mockTask, title: "Updated" });

        await updateTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if task not found", async () => {
        const req = mockReqWithUser({
        params: { id: "1" },
        body: { title: "Updated" },
        });
        const res = mockRes();
        mockUpdateTask.mockRejectedValue(new NotFoundError("Task not found"));

        await updateTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("deleteTaskController", () => {
    it("should return 200 with deleted task", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockDeleteTask.mockResolvedValue(mockTask);

        await deleteTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it("should return 404 if task not found", async () => {
        const req = mockReqWithUser({ params: { id: "1" } });
        const res = mockRes();
        mockDeleteTask.mockRejectedValue(new NotFoundError("Task not found"));

        await deleteTaskController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});