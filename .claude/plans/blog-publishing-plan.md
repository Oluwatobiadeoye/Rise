# In-house Blog Publishing — Implementation Plan (v2, hardened)

## Goal

Let the RISE team author and publish blog posts themselves from the existing
`/admin`, with **one login** (the admin accounts we already built), content
stored in **Supabase** (one datastore), images in **Supabase Storage**, and
posts going live **without a redeploy**. The public blog pages keep their
current behaviour and styling. No hosted CMS, no second login. We use **TipTap**
(headless, open source) for the editor — we write the glue, not an editor.

> v2 incorporates an adversarial design / UX / security review. Changes from v1
> are called out as **[review]** so the reasoning is traceable.

---

## Decisions (baked in)

1. **Editor: TipTap.** StarterKit + Link + Image, styled to Evergreen & Gold.
   TipTap's Link extension is configured with `protocols: ['http','https','mailto']`
   and `autolink`/`linkOnPaste` constrained so the editor never emits
   `javascript:`/`data:` links. **[review: C2]**
2. **Body stored as sanitized HTML, AND re-sanitized on render.** **[review: C1]**
   Sanitize on write with a strict allowlist before storing, *and* sanitize
   again at read time in the content source before it reaches
   `dangerouslySetInnerHTML`. Stored HTML is **not** treated as trusted just
   because it was once clean (guards mutation-XSS and any future allowlist/CVE
   fix applying to old rows). Render-time uses **`isomorphic-dompurify`**
   (DOMPurify is hardened against mXSS); write-time uses the same.
3. **Sanitizer config is explicit, not default.** **[review: C2]** Allowed:
   `p, h2, h3, h4, strong, em, u, s, ul, ol, li, blockquote, a, img, code, pre,
   br, hr`. `allowedSchemes: ['http','https','mailto']`;
   `img` src limited to `http/https` (no `data:`); **drop** `style`, `srcset`,
   `target`, all `on*`; force `a` to `rel="noopener noreferrer nofollow"`.
   No `svg`, `iframe`, `object`, `embed`, `script`, `style`, `template`,
   `noscript`. A unit test asserts each named bypass vector is stripped.
4. **Reading time** computed on write from the sanitized DOM's **textContent**
   (tags stripped first), 200 wpm, min 1. **[review: M4]** v1 doc claimed parity
   with the markdown source's word count; it is HTML-text-derived and the seeded
   post's estimate is recomputed at cutover.
5. **Freshness model — precise.** **[review: B1, B2]** DB reads go through Drizzle
   (`postgres-js`), which is **not** `fetch`, so Next's fetch/data cache does not
   apply — the only cache in play is the **full route cache**. Freshness is
   therefore pure route-cache invalidation: on create/update/publish/unpublish/
   archive, the action validates the slug then calls `revalidatePath("/blog")`
   and `revalidatePath("/blog/<slug>")`. `dynamicParams` stays **true**
   (explicitly; never set false) so a newly-published slug not present at build
   renders on demand. `generateStaticParams` is wrapped so a build-time DB
   failure returns `[]` instead of breaking the build (pages then render on
   demand). **CI `next build` does not depend on a reachable DB.**
6. **Image storage: Supabase Storage**, public `blog` bucket, object keys
   `blog/<uuid>.<ext>`, **listing disabled** (fetch by exact URL only).
   **[review: M3]** Uploads validated by **magic bytes** (not the declared
   content-type), stored `contentType` set server-side to the detected type with
   `X-Content-Type-Options: nosniff`; **SVG is never stored as an image**.
   **[review: C3]** Storage client is confined to a `server-only` module using
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC`), and the
   data layer stays entirely on Drizzle. **[review: C4]**
7. **Slug lifecycle.** **[review: Major-5, UX-4]** Slug is freely editable while
   the post is a draft; **locked (read-only) once first published** to protect
   shared links. A robust `slugify` transliterates diacritics (Yoruba-safe),
   strips symbols, and always yields a valid kebab slug, so a title like
   "RISE & TOP 2026: Ìdàgbàsókè" never reaches the DB CHECK as an error.
   **[review: UX-12]** (Slug redirects are out of scope for v1; locking avoids
   the need.)
8. **Published-edit model — explicit.** **[review: UX-1]**
   - **Drafts** auto-save (debounced + on blur, mirroring `ReviewEditor`), with a
     "Saved 12:04 / Saving…" indicator and a `beforeunload` unsaved-changes
     guard. **[review: UX-2]**
   - **Published posts** do **not** auto-save (we never push half-finished edits
     live). Editing a live post shows a banner: *"This post is live — Save
     updates the public post immediately."* Save is explicit; an "Unpublish to
     edit privately" affordance lets the editor pull it back to draft first.
9. **Validation returns, never throws.** **[review: UX-3]** All authoring server
   actions return a typed result (`{ ok: false, field, message } | { ok: true,
   ... }`) consumed via `useActionState`, rendering **inline** field errors.
   Throwing is reserved for genuine 500s (auth/Forbidden stays a throw, matching
   the existing pattern). Duplicate slug, empty body, oversized image, etc. never
   become a Next error page that eats the editor's work.
10. **Roles — single capability, all admins.** **[review: UX-8 — decided]** One
    `manage-blog` capability covering authoring, publishing, unpublishing, and
    archiving, granted to **all three roles** (superadmin, owner, reviewer). The
    NGO's writer is never locked out; there is no separate editorial gate. (If a
    publish gate is wanted later, splitting `manage-blog` into author/publish is
    a one-line matrix change.)
11. **Destructive actions are guarded.** **[review: UX-9]** Hard delete is
    replaced by **archive** (soft delete, recoverable); Unpublish and Archive
    require a confirm dialog. A separate permanent-delete (superadmin only) is a
    later follow-on.
12. **Preview before publish.** **[review: UX-5]** A `author-blog`-gated route
    `/admin/blog/[id]/preview` renders the current draft through the **real**
    public post template (cover crop, `.post-body` styling, date, reading time),
    so an editor sees the true result without QА-ing in production.

---

## Phases

### Phase 0 — Dependencies
Deps (latest stable): `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
`@tiptap/extension-link`, `@tiptap/extension-image`, `isomorphic-dompurify`,
`@supabase/supabase-js` (storage only), `image-size`. Client-side image
downscale uses the canvas API (no dep).

### Phase 1 — Data layer (one store, defensive source)
- **Schema** (`lib/db/schema.ts`): `posts` with `enableRLS()`:
  `id uuid pk`, `slug text unique` + kebab CHECK, `title`, `excerpt`, `author`,
  `bodyHtml text`, `readingMinutes int`,
  `coverSrc/coverAlt/coverWidth/coverHeight` (nullable group; **alt required when
  src present** — enforced in the action, plus a CHECK), `status` enum
  `draft|published|archived` (default `draft`), `publishedAt timestamptz null`,
  `firstPublishedAt timestamptz null` (drives slug-lock), `createdAt/updatedAt`.
  Partial index `(published_at desc) WHERE status = 'published'`. **[review: M8]**
- **Migration** via `drizzle-kit generate`, applied to prod with `db:migrate`
  (DIRECT_URL). RLS on, no policies (service connection bypasses; the public read
  path is the same Drizzle service connection and **filters `status='published'`
  in SQL** — RLS is not the filter). **[review: M2]**
- **One Drizzle store** owns the `posts` table and the single `rowToPost` /
  `rowToPostMeta` mapper. **[review: Major-4]** It exposes both the read-only
  `ContentSource` methods (published-only) and the admin draft/write methods —
  no second query layer. `lib/content/db.ts` is a thin adapter selecting the
  published subset and applying render-time sanitization (decision 2).
- **Defensive source + safe cutover.** **[review: B3]** The DB content source
  catches a missing-relation / connection error and falls back to the fs source
  (and logs), so a mis-ordered deploy degrades gracefully instead of 500-ing or
  erasing the existing post. Documented cutover runbook:
  `generate migration → db:migrate prod → seed-blog prod → verify row present →
  only then commit/push the source-swap code`. The env gate flips the *source*
  automatically on deploy, so seeding must precede the deploy.
- **Seed**: `scripts/seed-blog.mjs` (matching `create-admin`'s
  `--env-file-if-exists=.env.local` pattern, using `DIRECT_URL`) imports the
  existing `2019-foundations-of-impact-bootcamps.md` into `posts`. **[review: B3]**
- **Seam** (`lib/content/index.ts`): `isDatabaseConfigured()` ? DB source : fs
  source (unchanged pattern).

### Phase 2 — Image storage (hardened)
- `lib/blog/storage.ts` — **`import "server-only"`** at top. **[review: C4]**
  `uploadImage(bytes) → { url, width, height }`: enforce byte cap **before**
  buffering/parsing; detect type via `image-size` magic bytes (reject anything
  not jpeg/png/webp; reject implausible dimensions — bomb guard); store with
  server-set `contentType` + `nosniff`; key `blog/<uuid>.<detected-ext>`.
  **[review: C3, H3]**
- `uploadBlogImage` server action: **first line** `requireCan("manage-blog")`;
  `checkRateLimit` keyed on admin id. **[review: H2, H3]** Returns the URL +
  dimensions (typed result).
- Client: size/type check + canvas **downscale of large phone photos** before
  upload, a progress/spinner state, uploaded thumbnail with Replace/Remove, and
  a **required alt-text** field gating Publish. **[review: UX-6, UX-7]** HEIC is
  detected client-side with a clear "please upload JPEG/PNG/WebP" message.
- `next.config.ts`: `images.remotePatterns` scoped to the exact bucket path
  prefix `/storage/v1/object/public/blog/**`, not the whole host. **[review: L2]**
- **Add a Content-Security-Policy** now that an external origin is introduced —
  at minimum `script-src 'self'` and `img-src 'self' <supabase-storage-host>`.
  This is the "third-party origin" the CSP deferral was waiting on; without it
  the sanitizer is the only XSS control. **[review: Major-6]**

### Phase 3 — Admin authoring UI
- **Nav**: capability-gated "Blog" link in `app/admin/layout.tsx`.
- **List** `app/admin/blog/page.tsx` (`requireCan("manage-blog")`): all posts incl.
  drafts/archived, status badges, date, "New post", row → editor.
- **Editor** `components/admin/BlogEditor.tsx` (`"use client"`): TipTap + styled
  toolbar; fields title, slug (auto-derived, locked after first publish), date
  ("Date shown on the post", defaults to now at first publish, warns on future
  dates — **[review: UX-10]**), excerpt, author, cover (upload + alt). Draft
  auto-save + indicator + unsaved guard; published-post banner + explicit Save
  (decision 8). Block **Publish** (not draft Save) on empty body/excerpt/cover-alt
  with inline messages. **[review: UX-13]** Post-publish toast + "View live post →"
  link + a "Live" badge. **[review: UX-14]**
- **Routes** `app/admin/blog/new`, `app/admin/blog/[id]` (UUID-validated id →
  `notFound()` for unknown — **[review: M1]**), `app/admin/blog/[id]/preview`
  (decision 12).
- **Server actions** `lib/actions/blog.ts` — **`import "server-only"`**, each with
  `requireCan("manage-blog")` as the **first line**: `saveBlogPost`,
  `publishBlogPost`, `unpublishBlogPost`, `archiveBlogPost`, `uploadBlogImage`.
  Each validates slug against `^[a-z0-9]+(?:-[a-z0-9]+)*$` and confirms the row
  **before** any `revalidatePath`. **[review: H1, H2]** Slug-conflict handled like
  the admins path (23505 → typed field error). All return typed results
  (decision 9).

### Phase 4 — Rendering, sanitization & freshness
- `lib/blog/sanitize.ts`: the decision-3 allowlist, used on **write and read**.
- Public pages unchanged structurally; cover via `next/image` (scoped remote
  pattern). Confirm `dynamicParams` true, no conflicting `dynamic`/`revalidate`.
- Verify (with a test, not by eye) publish → live on `/blog` and `/blog/<slug>`
  with no rebuild. **[review: B2]**

### Phase 5 — Tests, gates, docs
- **Unit**: sanitizer (every named vector: `<script>`, `on*`, `javascript:`/
  `data:` in href & img, `srcset`, `style`, `svg`, mis-nested/mXSS samples),
  slugify (diacritics → valid kebab), reading-time on HTML text, validation
  result shapes, the store's published filter + draft→null mapping, slug-conflict
  handling, and **upload guard + magic-byte rejection**. **[review: C1-C3, H2]**
- **Integration (DB-backed)**: **[review: Major-7, B2]** against a real Postgres
  (the dev Supabase or a disposable PG, skipped when `DATABASE_URL` is absent):
  draft absent from `/blog` → publish → present, without rebuild; slug uniqueness
  conflict; archive removes from public list. (Honest note: mock-only tests would
  leave the authoring half unproven; this path is required.)
- **CI guard**: grep asserting `SERVICE_ROLE` / the service key never appears in
  the client bundle. **[review: C4]**
- **Gates**: `lint && typecheck && test && build` (Node 22), then code-review and
  security-review subagents (sanitization, upload, key confinement are the focus).
- **Docs**: `website-plan.md` (blog-authoring milestone), `docs/launch-checklist.md`
  (new env vars, the Supabase `blog` bucket setup + listing-off + nosniff, the
  cutover runbook, key rotation), `docs/orchestration-decisions.md` (in-house vs
  Sanity; the role split; the published-edit model).

---

## Files (add / change)

**Add**: `lib/content/db.ts`, `lib/blog/storage.ts` (`server-only`),
`lib/blog/sanitize.ts`, `lib/blog/slugify.ts`, `lib/actions/blog.ts`
(`server-only`), `components/admin/BlogEditor.tsx`, `app/admin/blog/{page,new/page,[id]/page,[id]/preview/page}.tsx`,
`drizzle/000X_*.sql`, `scripts/seed-blog.mjs`.

**Change**: `lib/db/schema.ts` (`posts`), `lib/db/drizzle.ts` + `lib/db/types.ts`
(the one `posts` store), `lib/content/index.ts` (gate + defensive fallback),
`lib/content/types.ts` (`AdminPost`/`PostInput`/result types),
`lib/admin/permissions.ts` (`author-blog` + `publish-blog`),
`app/admin/layout.tsx` (gated link), `next.config.ts` (image pattern + CSP),
`package.json` (deps + `seed-blog`), the three docs.

---

## Risk register (post-review)

| Risk | Mitigation |
|---|---|
| Build-time DB dependency on CI **[B1]** | `generateStaticParams` returns `[]` on DB error; `dynamicParams` true; build needs no DB |
| `revalidatePath` mental model / stale page **[B2]** | Documented: DB reads uncached, freshness = route-cache invalidation; integration test proves publish→live |
| Auto-flip source erases/500s existing post at cutover **[B3]** | Defensive fs fallback on missing table + ordered migrate→seed→verify→deploy runbook |
| Read/write mapper drift **[Major-4]** | One Drizzle store, one `rowToPost`; content source is a thin view |
| Slug change breaks shared links **[Major-5/UX-4]** | Lock slug after first publish; robust diacritic-safe slugify |
| Stored / mutation XSS **[C1/C2]** | Sanitize on write **and** read with DOMPurify; explicit allowlist; per-vector tests; CSP added |
| Image content-type spoofing **[C3]** | Magic-byte detection; server-set contentType + nosniff; no SVG; cookieless origin |
| Service-role key leak **[C4]** | `server-only` modules; never `NEXT_PUBLIC`; CI bundle grep; scoped/rotatable key |
| Cache-poison via slug in revalidatePath **[H1]** | Validate slug + confirm row before revalidate |
| Lost work for non-technical editor **[UX-1/2]** | Draft auto-save + indicator + unload guard; published edits explicit + banner |
| User-facing errors as crash pages **[UX-3]** | Actions return typed results; inline field errors |
| Writer locked out **[UX-8]** | Single `manage-blog` capability granted to all three roles |

## Out of scope (v1; not "easy" — noted) **[review: Minor-9]**
Slug redirects, scheduled/future publishing (needs a scheduler this architecture
lacks), categories/tags, multiple authors, comments, and a public RSS feed (the
feed re-opens the build-time/freshness question). Each is a deliberate follow-on,
not a freebie.
