import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/** Whether a direct Postgres connection is configured (used to pick the store). */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

let cached: PostgresJsDatabase<typeof schema> | null = null;

/**
 * The Drizzle database client over a direct Postgres connection (Supabase's
 * transaction pooler). Created lazily on first use so a missing `DATABASE_URL`
 * never breaks the build — only a live call — and prepared statements are
 * disabled, which the transaction pooler requires.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Drizzle store selected but DATABASE_URL is unset.",
    );
  }
  const client = postgres(url, { prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}
