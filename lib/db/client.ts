import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let cached: PostgresJsDatabase<typeof schema> | null = null;

/**
 * The Drizzle database client over a direct Postgres connection (Supabase's
 * transaction pooler). Created lazily on first use so a missing `DATABASE_URL`
 * surfaces at call time, not at import (the build never opens a connection), and
 * prepared statements are disabled, which the transaction pooler requires.
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
