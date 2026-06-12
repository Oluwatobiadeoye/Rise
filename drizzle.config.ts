import { defineConfig } from "drizzle-kit";

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
