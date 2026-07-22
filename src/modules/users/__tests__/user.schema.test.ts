// src/modules/users/__tests__/user.schema.test.ts

import { registerSchema, loginSchema, updateUserSchema } from "../user.schema";

describe("registerSchema", () => {
    it("should pass with valid data", () => {
        const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
        const result = registerSchema.safeParse({
        name: "John Doe",
        email: "not-an-email",
        password: "password123",
        });
        expect(result.success).toBe(false);
    });

    it("should fail with password shorter than 8 characters", () => {
        const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "123",
        });
        expect(result.success).toBe(false);
    });
});

describe("loginSchema", () => {
    it("should pass with valid data", () => {
        const result = loginSchema.safeParse({
        email: "john@example.com",
        password: "password123",
        });
        expect(result.success).toBe(true);
    });

    it("should fail with empty password", () => {
        const result = loginSchema.safeParse({
        email: "john@example.com",
        password: "",
        });
        expect(result.success).toBe(false);
    });
});

describe("updateUserSchema", () => {
    it("should pass with partial data", () => {
        const result = updateUserSchema.safeParse({ name: "New Name" });
        expect(result.success).toBe(true);
    });

    it("should pass with empty object", () => {
        const result = updateUserSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
        const result = updateUserSchema.safeParse({ email: "not-an-email" });
        expect(result.success).toBe(false);
    });
});