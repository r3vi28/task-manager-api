// src/modules/users/__tests__/user.service.test.ts
import { register, login } from "../user.service";
import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt";

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;

describe("register", () => {
  it("should create a user and return it without password", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "hashed",
      role: "MEMBER",
      createdAt: new Date(),
    });

    const result = await register({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("john@example.com");
  });

  it("should throw if email already exists", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "hashed",
      role: "MEMBER",
      createdAt: new Date(),
    });

    await expect(
      register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Email already in use");
  });
});

describe("login", () => {
  it("should return a token with valid credentials", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "$2b$10$hashedpassword",
      role: "MEMBER",
      createdAt: new Date(),
    });

    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const result = await login({
      email: "john@example.com",
      password: "password123",
    });

    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
  });

  it("should throw if user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(
      login({
        email: "noexiste@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw if password is incorrect", async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "$2b$10$hashedpassword",
      role: "MEMBER",
      createdAt: new Date(),
    });

    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    await expect(
      login({
        email: "john@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid credentials");
  });
});