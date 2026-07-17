// src/modules/tasks/__tests__/task.service.test.ts
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from "../task.service";
import prisma from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    __esModule: true,
    default: {
        project: {
        findUnique: jest.fn(),
        },
        task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        },
    },
}));

const mockProjectFindUnique = prisma.project.findUnique as jest.Mock;
const mockTaskCreate = prisma.task.create as jest.Mock;
const mockTaskFindMany = prisma.task.findMany as jest.Mock;
const mockTaskFindUnique = prisma.task.findUnique as jest.Mock;
const mockTaskUpdate = prisma.task.update as jest.Mock;
const mockTaskDelete = prisma.task.delete as jest.Mock;

const mockProject = {
    id: 1,
    name: "Test Project",
    description: null,
    ownerId: 1,
    createdAt: new Date(),
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
    project: mockProject,
};

describe("createTask", () => {
    it("should create and return a task", async () => {
        mockProjectFindUnique.mockResolvedValue(mockProject);
        mockTaskCreate.mockResolvedValue(mockTask);

        const result = await createTask(1, 1, {
        title: "Fix bug",
        status: "TODO",
        priority: "MEDIUM",
        });

        expect(result).toEqual(mockTask);
    });

    it("should throw if project does not exist", async () => {
        mockProjectFindUnique.mockResolvedValue(null);

        await expect(createTask(1, 1, { title: "Fix bug", status: "TODO", priority: "MEDIUM" })).rejects.toThrow(
        "Project not found"
        );
    });

    it("should throw if user is not owner of the project", async () => {
        mockProjectFindUnique.mockResolvedValue({ ...mockProject, ownerId: 2 });

        await expect(createTask(1, 1, { title: "Fix bug", status: "TODO", priority: "MEDIUM" })).rejects.toThrow(
        "Access denied"
        );
    });
});

describe("getTasks", () => {
    it("should return tasks for a project", async () => {
        mockProjectFindUnique.mockResolvedValue(mockProject);
        mockTaskFindMany.mockResolvedValue([mockTask]);

        const result = await getTasks(1, 1, {});

        expect(result).toHaveLength(1);
    });

    it("should apply filters", async () => {
        mockProjectFindUnique.mockResolvedValue(mockProject);
        mockTaskFindMany.mockResolvedValue([mockTask]);

        await getTasks(1, 1, { status: "TODO" });

        expect(mockTaskFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({ status: "TODO" }),
        })
        );
    });
});

describe("getTaskById", () => {
    it("should return task if user is owner of the project", async () => {
        mockTaskFindUnique.mockResolvedValue(mockTask);
        mockProjectFindUnique.mockResolvedValue(mockProject);

        const result = await getTaskById(1, 1);

        expect(result).toEqual(mockTask);
    });

    it("should throw if task does not exist", async () => {
        mockTaskFindUnique.mockResolvedValue(null);

        await expect(getTaskById(1, 1)).rejects.toThrow("Task not found");
    });

    it("should throw if user is not owner of the project", async () => {
        mockTaskFindUnique.mockResolvedValue(mockTask);
        mockProjectFindUnique.mockResolvedValue({ ...mockProject, ownerId: 2 });

        await expect(getTaskById(1, 1)).rejects.toThrow("Access denied");
    });
});

describe("updateTask", () => {
    it("should update and return the task", async () => {
        mockTaskFindUnique.mockResolvedValue(mockTask);
        mockProjectFindUnique.mockResolvedValue(mockProject);
        mockTaskUpdate.mockResolvedValue({ ...mockTask, title: "Updated" });

        const result = await updateTask(1, 1, { title: "Updated" });

        expect(result.title).toBe("Updated");
    });

    it("should throw if task does not exist", async () => {
        mockTaskFindUnique.mockResolvedValue(null);

        await expect(updateTask(1, 1, { title: "Updated" })).rejects.toThrow(
        "Task not found"
        );
    });
});

describe("deleteTask", () => {
    it("should delete and return the task", async () => {
        mockTaskFindUnique.mockResolvedValue(mockTask);
        mockProjectFindUnique.mockResolvedValue(mockProject);
        mockTaskDelete.mockResolvedValue(mockTask);

        const result = await deleteTask(1, 1);

        expect(result).toEqual(mockTask);
    });

    it("should throw if task does not exist", async () => {
        mockTaskFindUnique.mockResolvedValue(null);

        await expect(deleteTask(1, 1)).rejects.toThrow("Task not found");
    });
});