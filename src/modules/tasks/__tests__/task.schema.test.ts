// src/modules/tasks/__tests__/task.schema.test.ts
import { createTaskSchema, updateTaskSchema } from "../task.schema";

describe("createTaskSchema", () => {
    it("should pass with only required fields", () => {
        const result = createTaskSchema.safeParse({ title: "Fix bug" });
        expect(result.success).toBe(true);
    });

    it("should pass with all fields", () => {
        const result = createTaskSchema.safeParse({
        title: "Fix bug",
        description: "A nasty one",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignedToId: 1,
        dueDate: "2026-12-31T00:00:00.000Z",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with empty title", () => {
        const result = createTaskSchema.safeParse({ title: "" });
        expect(result.success).toBe(false);
    });

    it("should fail with invalid status", () => {
        const result = createTaskSchema.safeParse({
        title: "Fix bug",
        status: "INVALID",
        });
        expect(result.success).toBe(false);
    });

    it("should fail with invalid priority", () => {
        const result = createTaskSchema.safeParse({
        title: "Fix bug",
        priority: "URGENT",
        });
        expect(result.success).toBe(false);
    });
});

describe("updateTaskSchema", () => {
    it("should pass with empty object", () => {
        const result = updateTaskSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("should pass with partial data", () => {
        const result = updateTaskSchema.safeParse({ status: "DONE" });
        expect(result.success).toBe(true);
    });
});