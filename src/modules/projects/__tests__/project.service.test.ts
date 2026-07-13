// src/modules/projects/__tests__/project.service.test.ts
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "../project.service";
import prisma from "../../../lib/prisma";

jest.mock("../../../lib/prisma", () => ({
    __esModule: true,
    default: {
        project: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        },
    },
}));

const mockCreate = prisma.project.create as jest.Mock;
const mockFindMany = prisma.project.findMany as jest.Mock;
const mockFindUnique = prisma.project.findUnique as jest.Mock;
const mockUpdate = prisma.project.update as jest.Mock;
const mockDelete = prisma.project.delete as jest.Mock;

const mockProject = {
    id: 1,
    name: "Test Project",
    description: "A test project",
    ownerId: 1,
    createdAt: new Date(),
    tasks: [],
};

describe("createProject", () => {
    it("should create and return a project", async () => {
        mockCreate.mockResolvedValue(mockProject);

        const result = await createProject(
        { name: "Test Project", description: "A test project" },
        1
        );

        expect(result).toEqual(mockProject);
        expect(mockCreate).toHaveBeenCalledWith({
        data: { name: "Test Project", description: "A test project", ownerId: 1 },
        });
    });
});

describe("getProjects", () => {
    it("should return all projects for a user", async () => {
        mockFindMany.mockResolvedValue([mockProject]);

        const result = await getProjects(1);

        expect(result).toHaveLength(1);
        expect(result[0]?.ownerId).toBe(1);
    });
});

describe("getProjectById", () => {
    it("should return project with tasks if user is owner", async () => {
        mockFindUnique.mockResolvedValue(mockProject);

        const result = await getProjectById(1, 1);

        expect(result).toEqual(mockProject);
    });

    it("should throw if project does not exist", async () => {
        mockFindUnique.mockResolvedValue(null);

        await expect(getProjectById(1, 1)).rejects.toThrow("Project not found");
    });

    it("should throw if user is not the owner", async () => {
        mockFindUnique.mockResolvedValue({ ...mockProject, ownerId: 2 });

        await expect(getProjectById(1, 1)).rejects.toThrow("Access denied");
    });
});

describe("updateProject", () => {
    it("should update and return the project", async () => {
        mockFindUnique.mockResolvedValue(mockProject);
        mockUpdate.mockResolvedValue({ ...mockProject, name: "Updated" });

        const result = await updateProject(1, 1, { name: "Updated" });

        expect(result.name).toBe("Updated");
    });

    it("should throw if project does not exist", async () => {
        mockFindUnique.mockResolvedValue(null);

        await expect(updateProject(1, 1, { name: "Updated" })).rejects.toThrow(
        "Project not found"
        );
    });

    it("should throw if user is not the owner", async () => {
        mockFindUnique.mockResolvedValue({ ...mockProject, ownerId: 2 });

        await expect(updateProject(1, 1, { name: "Updated" })).rejects.toThrow(
        "Access denied"
        );
    });
});

describe("deleteProject", () => {
    it("should delete and return the project", async () => {
        mockFindUnique.mockResolvedValue(mockProject);
        mockDelete.mockResolvedValue(mockProject);

        const result = await deleteProject(1, 1);

        expect(result).toEqual(mockProject);
    });

    it("should throw if project does not exist", async () => {
        mockFindUnique.mockResolvedValue(null);

        await expect(deleteProject(1, 1)).rejects.toThrow("Project not found");
    });

    it("should throw if user is not the owner", async () => {
        mockFindUnique.mockResolvedValue({ ...mockProject, ownerId: 2 });

        await expect(deleteProject(1, 1)).rejects.toThrow("Access denied");
    });
});