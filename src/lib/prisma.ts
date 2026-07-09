import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

/**
 * Singleton Prisma client instance shared across the application.
 * Uses PrismaPg adapter for a Rust-free PostgreSQL connection.
 */
const prisma = new PrismaClient({
  adapter,
  log: [{ level: "query", emit: "event" }],
});

export default prisma;