# Task Manager API

A RESTful API for team-based task management. Users register, create projects, and manage tasks within those projects — assigning them to team members with statuses, priorities, and deadlines. Role-based access control separates `ADMIN` users from `MEMBER` users.

---

## Live Demo

| | |
|---|---|
| API base URL | `https://task-manager-api-vk0z.onrender.com` |
| Swagger UI | `https://task-manager-api-vk0z.onrender.com/api/docs` |
| Health check | `https://task-manager-api-vk0z.onrender.com/health` |

**Demo accounts** (password for both: `Demo1234!`)

| Email | Role |
|---|---|
| `member@demo.com` | `MEMBER` |
| `admin@demo.com` | `ADMIN` |

In Swagger, call `POST /api/auth/login`, copy the `token` from the response, click **Authorize** and paste it.

> **Cold start:** the API runs on Render's free tier, which sleeps after ~15 minutes of inactivity. The first request after that can take **30–60 seconds** while the service wakes up. Subsequent requests are fast.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript 6 |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Validation | Zod 4 |
| Authentication | JWT + bcrypt |
| Testing | Jest + Supertest |
| Package Manager | pnpm |

---

## Project Structure

```
prisma/
├── schema.prisma              # Data models
├── migrations/                # SQL migrations
└── seed.ts                    # Demo users, projects and tasks
src/
├── docs/
│   └── openapi.ts             # OpenAPI spec served by Swagger UI at /api/docs
├── lib/
│   ├── prisma.ts              # Singleton Prisma client with PrismaPg adapter
│   ├── errors.ts              # Custom error classes (AppError, NotFoundError, AccessDeniedError)
│   ├── handleServiceError.ts  # Centralized HTTP error response handler
│   └── getOwnedProject.ts     # Shared ownership verification utility
├── middlewares/
│   ├── auth.middleware.ts     # JWT verification middleware
│   └── role.middleware.ts     # Role-based authorization middleware
└── modules/
    ├── users/                 # Auth + user management
    ├── projects/              # Project CRUD
    └── tasks/                 # Task CRUD with filters
```

---

## Getting Started

### Prerequisites

- Node.js 24
- PostgreSQL
- pnpm 11

### Installation

```bash
# Clone the repository
git clone https://github.com/r3vi28/task-manager-api
cd task-manager-api

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Create your local env file and fill in real values
cp .env.example .env

# Run database migrations
pnpm prisma migrate deploy

# (Optional) Load demo users, projects and tasks
pnpm seed
```

### Environment Variables

See [`.env.example`](.env.example) for a template.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by the app. In production, Neon's **pooled** URL (host contains `-pooler`) |
| `DIRECT_URL` | No | Direct (non-pooled) connection used by Prisma CLI migrations. Needed only when `DATABASE_URL` points to a pooler; falls back to `DATABASE_URL` |
| `JWT_SECRET` | Yes | Secret key used to sign JWT tokens (long random string) |
| `PORT` | No | Port the server listens on (default `3000`; set automatically by Render) |
| `NODE_ENV` | No | `development` enables query logging; `production` in deployment |
| `CORS_ORIGIN` | No | Comma-separated list of allowed origins (e.g. `https://my-app.vercel.app`). When unset, all origins are allowed |

### Running the Server

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm build
pnpm start
```

---

## Deployment

Deployed as a free stack: **Render** (web service) → **Neon** (PostgreSQL).

**Render web service settings**

| Setting | Value |
|---|---|
| Runtime | Node |
| Build command | `pnpm install --prod=false && pnpm prisma generate && pnpm build` |
| Start command | `pnpm start` |
| Health check path | `/health` |
| Env vars | `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN` |

`--prod=false` makes pnpm install devDependencies (TypeScript, Prisma CLI) even though `NODE_ENV=production` is set during the build.

**Migrations and seed** run from a local machine against Neon (the free Render plan has no shell or pre-deploy command):

```bash
# .env temporarily pointing to Neon:
#   DATABASE_URL = pooled URL, DIRECT_URL = direct URL
pnpm prisma migrate deploy
pnpm seed
```

Re-running `pnpm seed` is safe: it resets the demo users' passwords and only creates sample projects if they are missing.

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run a specific test file
pnpm test auth.middleware.test.ts
```

The test suite includes 96 tests across 11 suites covering schemas, services, controllers, and middlewares. All tests use mocked dependencies — no database connection required.

---

## API Endpoints

Interactive documentation is available at `/api/docs` (Swagger UI). Health check: `GET /health` (public).

All protected endpoints require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "MEMBER",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

The `user` object contains the public fields of the authenticated user (the `password` field is excluded). The `token` is a signed JWT that encodes the user's `id` and `role`, valid for 7 days. The frontend should store the `token` and send it as a `Bearer` token in the `Authorization` header for subsequent requests.

---

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | List all users | ADMIN |
| GET | `/api/users/:id` | Get a user by ID | JWT |
| PUT | `/api/users/:id` | Update own profile | JWT (own) |
| DELETE | `/api/users/:id` | Delete a user | ADMIN |

---

### Projects

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/projects` | List own projects | JWT |
| POST | `/api/projects` | Create a project | JWT |
| GET | `/api/projects/:id` | Get a project with tasks | JWT (owner) |
| PUT | `/api/projects/:id` | Update a project | JWT (owner) |
| DELETE | `/api/projects/:id` | Delete a project | ADMIN |

**Create project request body:**
```json
{
  "name": "My Project",
  "description": "Optional description"
}
```

---

### Tasks

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/projects/:id/tasks` | List tasks in a project | JWT (owner) |
| POST | `/api/projects/:id/tasks` | Create a task in a project | JWT (owner) |
| GET | `/api/tasks/:id` | Get a task by ID | JWT (owner) |
| PUT | `/api/tasks/:id` | Update a task | JWT (owner) |
| DELETE | `/api/tasks/:id` | Delete a task | ADMIN |

**Create task request body:**
```json
{
  "title": "Fix bug",
  "description": "Optional description",
  "status": "TODO",
  "priority": "HIGH",
  "assignedToId": 2,
  "dueDate": "2026-12-31T00:00:00.000Z"
}
```

**Available task filters** (`GET /api/projects/:id/tasks`):

| Query param | Values |
|---|---|
| `status` | `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | `LOW`, `MEDIUM`, `HIGH` |
| `assignedToId` | User ID (number) |

Example: `GET /api/projects/1/tasks?status=TODO&priority=HIGH`

---

## Data Models

### User

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Primary key |
| `name` | String | |
| `email` | String | Unique |
| `password` | String | Hashed with bcrypt |
| `role` | `ADMIN` \| `MEMBER` | Default: `MEMBER` |
| `createdAt` | DateTime | Auto-generated |

### Project

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Primary key |
| `name` | String | |
| `description` | String | Optional |
| `ownerId` | Int | FK → User |
| `createdAt` | DateTime | Auto-generated |

### Task

| Field | Type | Notes |
|---|---|---|
| `id` | Int | Primary key |
| `title` | String | |
| `description` | String | Optional |
| `status` | `TODO` \| `IN_PROGRESS` \| `DONE` | Default: `TODO` |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | Default: `MEDIUM` |
| `assignedToId` | Int | Optional FK → User |
| `projectId` | Int | FK → Project |
| `dueDate` | DateTime | Optional |
| `createdAt` | DateTime | Auto-generated |

---

## Error Handling

All errors follow a consistent response format:

```json
{
  "message": "Error description"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Missing or invalid token / Invalid credentials |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already in use) |
| `500` | Internal server error |

---

## License

MIT