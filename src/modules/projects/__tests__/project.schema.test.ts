import { createProjectSchema, updateProjectSchema } from "../project.schema";

describe("createProjectSchema", () => {
    it("should pass with valid data", () => {
        const result = createProjectSchema.safeParse({
        name: "My Project",
        description: "A test project",
        });
        expect(result.success).toBe(true);
    });

    it("should pass without description", () => {
        const result = createProjectSchema.safeParse({
        name: "My Project",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with empty name", () => {
        const result = createProjectSchema.safeParse({
        name: "",
        });
        expect(result.success).toBe(false);
    });
});

describe("updateProjectSchema", () => {
    it("should pass with partial data", () => {
        const result = updateProjectSchema.safeParse({
        name: "Updated name",
        });
        expect(result.success).toBe(true);
    });

    it("should pass with empty object", () => {
        const result = updateProjectSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});