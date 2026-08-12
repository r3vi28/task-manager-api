// src/modules/users/__tests__/user.service.test.ts
import { register, login, getUsers, getUserById, updateUser, deleteUser  } from "../user.service";
import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { NotFoundError, AccessDeniedError } from "../../../lib/errors";

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockFindMany = prisma.user.findMany as jest.Mock;
const mockUpdate = prisma.user.update as jest.Mock;
const mockDelete = prisma.user.delete as jest.Mock;

const mockUserWithPassword = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: "MEMBER",
  createdAt: new Date(),
};

const mockSafeUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "MEMBER",
  createdAt: new Date(),
};

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
    expect(result).toHaveProperty("user");
    expect(result.user).not.toHaveProperty("password");
    expect(result.user.email).toBe("john@example.com");
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

describe("getUsers", () => {
  it("should return all users without password", async () => {
    mockFindMany.mockResolvedValue([mockSafeUser]);

    const result = await getUsers();

    expect(result[0]).not.toHaveProperty("password");
  });
});

describe("getUserById", () => {
  it("should return user without password", async () => {
    mockFindUnique.mockResolvedValue(mockSafeUser);

    const result = await getUserById(1);

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("john@example.com");
  });

  it("should throw NotFoundError if user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getUserById(1)).rejects.toThrow(NotFoundError);
  });
});

describe("updateUser", () => {
  it("should update and return user without password", async () => {
    mockFindUnique.mockResolvedValue(mockUserWithPassword);
    mockUpdate.mockResolvedValue({ ...mockSafeUser, name: "Updated" });

    const result = await updateUser(1, 1, { name: "Updated" });

    expect(result).not.toHaveProperty("password");
    expect(result.name).toBe("Updated");
  });

  it("should throw NotFoundError if user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(updateUser(1, 1, { name: "Updated" })).rejects.toThrow(
      NotFoundError
    );
  });

  it("should throw AccessDeniedError if requester is not the user", async () => {
    mockFindUnique.mockResolvedValue(mockUserWithPassword);

    await expect(updateUser(1, 2, { name: "Updated" })).rejects.toThrow(
      AccessDeniedError
    );
  });
});

describe("deleteUser", () => {
  it("should delete and return user without password", async () => {
    mockFindUnique.mockResolvedValue(mockUserWithPassword);
    mockDelete.mockResolvedValue(mockSafeUser);

    const result = await deleteUser(1);

    expect(result).not.toHaveProperty("password");
  });

  it("should throw NotFoundError if user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(deleteUser(1)).rejects.toThrow(NotFoundError);
  });
});