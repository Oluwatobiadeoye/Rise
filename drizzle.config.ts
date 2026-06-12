import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not load .env.local on its own, so load it here (Node 22
// built-in; same parser as `node --env-file`, no variable expansion — put the
// full connection strings in .env.local, not `${VAR}` references).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Migrations prefer a session-mode/direct URL (port 5432) when provided; the
// app itself uses the transaction pooler (DATABASE_URL, port 6543).
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
