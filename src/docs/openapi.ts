/**
 * OpenAPI 3 specification served by Swagger UI at /api/docs.
 * Kept as a TS object (not YAML) so tsc ships it inside dist/ without extra copy steps.
 */

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", example: 1 },
};

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const json = (ref: string) => ({
  "application/json": { schema: { $ref: `#/components/schemas/${ref}` } },
});

const jsonArray = (ref: string) => ({
  "application/json": { schema: { type: "array", items: { $ref: `#/components/schemas/${ref}` } } },
});

const unauthorized = errorResponse("Missing or invalid token");
const forbidden = errorResponse("Access denied");
const notFound = errorResponse("Resource not found");
const validationError = errorResponse("Validation error");

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
    description:
      "REST API for team-based task management. Log in with a demo account via `POST /api/auth/login`, " +
      "copy the `token` and click **Authorize**.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth" },
    { name: "Projects" },
    { name: "Tasks" },
    { name: "Users" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: {
            oneOf: [
              { type: "string" },
              { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
            ],
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["ADMIN", "MEMBER"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", minLength: 8, example: "supersecret" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "member@demo.com" },
          password: { type: "string", example: "Demo1234!" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      UpdateUserInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          ownerId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateProjectInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Website redesign" },
          description: { type: "string", example: "Q4 marketing site refresh" },
        },
      },
      UpdateProjectInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          assignedToId: { type: "integer", nullable: true },
          projectId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateTaskInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Write landing copy" },
          description: { type: "string" },
          status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], default: "TODO" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
          assignedToId: { type: "integer" },
          dueDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59Z" },
        },
      },
      UpdateTaskInput: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], example: "DONE" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          assignedToId: { type: "integer" },
          dueDate: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Auth"],
        summary: "Health check",
        security: [],
        responses: { "200": { description: "Service is up" } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user (role MEMBER)",
        security: [],
        requestBody: { required: true, content: json("RegisterInput") },
        responses: {
          "201": { description: "User created", content: json("User") },
          "400": validationError,
          "409": errorResponse("Email already in use"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        security: [],
        requestBody: { required: true, content: json("LoginInput") },
        responses: {
          "200": { description: "Authenticated", content: json("LoginResponse") },
          "400": validationError,
          "401": errorResponse("Invalid credentials"),
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "List the authenticated user's projects",
        responses: { "200": { description: "Projects", content: jsonArray("Project") }, "401": unauthorized },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a project",
        requestBody: { required: true, content: json("CreateProjectInput") },
        responses: {
          "201": { description: "Project created", content: json("Project") },
          "400": validationError,
          "401": unauthorized,
        },
      },
    },
    "/api/projects/{id}": {
      parameters: [idParam],
      get: {
        tags: ["Projects"],
        summary: "Get a project by id",
        responses: {
          "200": { description: "Project", content: json("Project") },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Update a project",
        requestBody: { required: true, content: json("UpdateProjectInput") },
        responses: {
          "200": { description: "Project updated", content: json("Project") },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project (ADMIN only)",
        responses: {
          "200": { description: "Project deleted", content: json("Project") },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/api/projects/{id}/tasks": {
      parameters: [idParam],
      get: {
        tags: ["Tasks"],
        summary: "List tasks of a project",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] } },
          { name: "priority", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] } },
          { name: "assignedToId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Tasks", content: jsonArray("Task") },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task in a project",
        requestBody: { required: true, content: json("CreateTaskInput") },
        responses: {
          "201": { description: "Task created", content: json("Task") },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/api/tasks/{id}": {
      parameters: [idParam],
      get: {
        tags: ["Tasks"],
        summary: "Get a task by id",
        responses: {
          "200": { description: "Task", content: json("Task") },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Update a task (e.g. set status to DONE)",
        requestBody: { required: true, content: json("UpdateTaskInput") },
        responses: {
          "200": { description: "Task updated", content: json("Task") },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task (ADMIN only)",
        responses: {
          "200": { description: "Task deleted", content: json("Task") },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (ADMIN only)",
        responses: { "200": { description: "Users", content: jsonArray("User") }, "401": unauthorized, "403": forbidden },
      },
    },
    "/api/users/{id}": {
      parameters: [idParam],
      get: {
        tags: ["Users"],
        summary: "Get a user by id",
        responses: {
          "200": { description: "User", content: json("User") },
          "401": unauthorized,
          "404": notFound,
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update your own user",
        requestBody: { required: true, content: json("UpdateUserInput") },
        responses: {
          "200": { description: "User updated", content: json("User") },
          "400": validationError,
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user (ADMIN only)",
        responses: {
          "200": { description: "User deleted", content: json("User") },
          "401": unauthorized,
          "403": forbidden,
          "404": notFound,
        },
      },
    },
  },
};
