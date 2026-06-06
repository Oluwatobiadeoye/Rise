# Deploying the RISE website

This is the **Milestone 1** deploy: project scaffold + the Home page. The goal is
to get a near-empty, on-brand site onto **Vercel** early — on a temporary
`*.vercel.app` URL — to de-risk hosting and configuration. The real domain and
later features (forms, blog/gallery, email) come in later milestones.

## What you need

- A **Vercel** account (free Hobby tier is fine to start).
- This repository pushed to GitHub (or GitLab/Bitbucket).
- **No environment variables** are required for this milestone. (`.env.example`
  documents keys for later milestones — Supabase, Sanity, Resend, Cloudflare
  Turnstile — but none are used yet.)

## Toolchain (already pinned)

- **Node 22** — pinned in `.nvmrc` (`22.14.0`). Vercel reads `.nvmrc` and builds
  on Node 22 automatically. Node 22 is required because the latest ESLint and
  Vitest exclude the odd/non-LTS Node 23 line.
- Framework: **Next.js 16** (App Router, Turbopack). Vercel auto-detects it.

## Verify locally before deploying

From the repo root, on Node 22 (`nvm use`):

```bash
npm install      # first time only
npm run lint     # ESLint — clean
npm run typecheck # tsc --noEmit — clean
npm test         # Vitest — 31 tests pass
npm run build    # next build — this is the real deploy gate; must succeed
```

If `npm run build` succeeds locally, the Vercel build will too (same command).

## Deploy — Option A: connect the Git repo (recommended)

1. Push this repo to GitHub.
2. In Vercel: **Add New… → Project → Import** this repository.
3. Confirm the auto-detected settings (no changes needed):
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (repo root — the app lives at the root)
   - **Build Command:** `next build` (default)
   - **Install Command:** `npm install` (default)
   - **Output:** handled by Next.js (default)
   - **Environment Variables:** none
4. Click **Deploy**. Vercel builds on Node 22 (from `.nvmrc`) and gives you a
   `https://<project>.vercel.app` URL.
5. Every push to the default branch redeploys; pull requests get preview URLs.

## Deploy — Option B: Vercel CLI (one-off)

```bash
npx vercel login     # run this yourself (interactive); in this session use: ! npx vercel login
npx vercel           # link + deploy a preview
npx vercel --prod    # promote to production (the *.vercel.app URL)
```

## After deploying — confirm

- The Home page renders identically to local (hero, impact band, the three
  programme cards, mission, testimonials, the CTA band, footer).
- Check mobile width: sticky nav blurs on scroll, the hamburger opens the menu.
- Visiting an unbuilt route (e.g. `/about`) shows the on-brand 404, not a crash.
  (About, Projects, Team, Get Involved, Contact, FAQ, Blog and Gallery are built
  in later milestones.)

## Security headers

Baseline response headers are set in `next.config.ts` and verified on the
production server (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options:
DENY`, `Strict-Transport-Security`). A **Content-Security-Policy is intentionally
deferred** to the milestone that introduces third-party origins (Sanity /
Supabase / Cloudflare Turnstile), so it can be authored and tested against the
real script/style/connect sources instead of guessed now.

## Known, non-blocking

- `npm audit` reports **2 moderate** advisories. Both are Next.js's **bundled
  `postcss`** (a transitive, build-time dependency inside `next` itself), not our
  code, and not exploitable here (we only compile author-written CSS at build
  time). **Do not run `npm audit fix --force`** — its "fix" tries to downgrade
  Next.js to v9, which would break everything. Resolves when Next.js bumps its
  bundled `postcss`; track via `npm update next`.
- The site uses **no cookies** and self-hosts its fonts (no third-party font
  requests), so no cookie-consent banner is needed.
