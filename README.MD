# Task Manager API

A RESTful API for team-based task management. Users register, create projects, and manage tasks within those projects — assigning them to team members with statuses, priorities, and deadlines. Role-based access control separates `ADMIN` users from `MEMBER` users.

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
src/
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

- Node.js 20+
- PostgreSQL
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/r3vi28/task-manager-api
cd task-manager-api

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate deploy
```

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskmanager"
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `JWT_EXPIRES_IN` | Token expiration time (e.g. `7d`, `1h`) |
| `PORT` | Port the server listens on |
| `NODE_ENV` | Environment (`development` enables query logging) |

### Running the Server

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm build
pnpm start
```

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

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