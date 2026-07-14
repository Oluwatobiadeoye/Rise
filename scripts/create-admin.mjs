// Creates an admin account in whichever store is configured.
//
//   node --env-file=.env.local scripts/create-admin.mjs
//   (or: npm run create-admin  — after loading env, e.g. via --env-file)
//
// When DATABASE_URL is set it inserts into the Postgres `admins` table;
// otherwise it writes a JSON record under data/admins/<uuid>.json. Prompts are
// plain (the password IS visible as you type — no masking, by design).

import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const ROLES = ["superadmin", "owner", "reviewer"];

// Mirrors lib/admin/password.ts hashPassword: "<saltHex>:<keyHex>".
function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  console.log("Create a RISE admin account.\n");
  console.warn(
    "NOTE: the password is shown in plain text as you type it (no masking).\n",
  );

  const username = (await rl.question("Username: ")).trim();
  const email = (await rl.question("Email: ")).trim().toLowerCase();
  const name = (await rl.question("Full name: ")).trim();
  const roleAnswer = (
    await rl.question("Role (superadmin/owner/reviewer) [superadmin]: ")
  ).trim();
  const role = roleAnswer === "" ? "superadmin" : roleAnswer;
  const password = await rl.question("Password (min 12 chars): ");
  rl.close();

  if (!username || !email || !name) {
    throw new Error("Username, email, and name are all required.");
  }
  if (!ROLES.includes(role)) {
    throw new Error(`Role must be one of: ${ROLES.join(", ")}`);
  }
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }

  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  if (process.env.DATABASE_URL) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(process.env.DATABASE_URL, { prepare: false });
    try {
      await sql`
        insert into admins (username, email, name, role, password_hash)
        values (${username}, ${email}, ${name}, ${role}, ${passwordHash})
      `;
    } finally {
      await sql.end();
    }
    console.log(`\nCreated admin "${username}" (${role}) in the database.`);
  } else {
    const id = randomUUID();
    const dir = path.join(process.cwd(), "data", "admins");
    await mkdir(dir, { recursive: true });
    const record = {
      id,
      username,
      email,
      name,
      role,
      active: true,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    await writeFile(
      path.join(dir, `${id}.json`),
      JSON.stringify(record, null, 2),
      "utf8",
    );
    console.log(
      `\nCreated admin "${username}" (${role}) in the filesystem store.`,
    );
  }
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exitCode = 1;
});
