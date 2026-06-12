// Imports the filesystem markdown posts in content/blog/*.md into the Postgres
// `posts` table as published rows. Idempotent: a slug that already exists is
// left untouched, so this is safe to re-run.
//
//   npm run seed-blog        (loads .env.local if present)
//
// Uses DIRECT_URL (the session pooler) when set, else DATABASE_URL. The stored
// HTML is rendered from markdown; the public read path sanitizes it again.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    if (line.trim() === "") continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return { fields, body: text.slice(end + 5) };
}

function readingMinutesFromHtml(html) {
  const t = html.replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ");
  const words = t.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set.");

  let entries;
  try {
    entries = await readdir(BLOG_DIR);
  } catch {
    console.log("No content/blog directory; nothing to seed.");
    return;
  }
  const files = entries.filter((n) => n.endsWith(".md")).sort();

  const { default: postgres } = await import("postgres");
  const sql = postgres(url, { prepare: false });
  let inserted = 0;
  let skipped = 0;
  try {
    for (const name of files) {
      const raw = await readFile(path.join(BLOG_DIR, name), "utf8");
      const parsed = parseFrontmatter(raw);
      if (!parsed) {
        console.warn(`Skipping ${name}: no frontmatter.`);
        continue;
      }
      const f = parsed.fields;
      if (f.draft === "true") {
        console.log(`Skipping ${name}: draft.`);
        continue;
      }
      const bodyHtml = marked.parse(parsed.body, { async: false });
      const publishedAt = `${f.date}T00:00:00.000Z`;
      const readingMinutes = readingMinutesFromHtml(bodyHtml);
      const hasCover = Boolean(f.cover);

      const rows = await sql`
        insert into posts (
          slug, title, excerpt, author, body_html, reading_minutes,
          cover_src, cover_alt, cover_width, cover_height,
          status, published_at, first_published_at
        ) values (
          ${f.slug}, ${f.title}, ${f.excerpt ?? ""}, ${f.author},
          ${bodyHtml}, ${readingMinutes},
          ${hasCover ? f.cover : null},
          ${hasCover ? (f.coverAlt ?? null) : null},
          ${hasCover ? Number(f.coverWidth) : null},
          ${hasCover ? Number(f.coverHeight) : null},
          'published', ${publishedAt}, ${publishedAt}
        )
        on conflict (slug) do nothing
        returning slug
      `;
      if (rows.length > 0) {
        inserted += 1;
        console.log(`Imported "${f.slug}".`);
      } else {
        skipped += 1;
        console.log(`Skipped "${f.slug}" (already present).`);
      }
    }
  } finally {
    await sql.end();
  }
  console.log(`\nDone: ${inserted} imported, ${skipped} already present.`);
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exitCode = 1;
});
