# RISE Initiative — Website

Public marketing website for **RISE Initiative** ("Rising Above Limitations"), a
youth-leadership NGO rooted in Oyo, Nigeria. Goal: production site by **end of June 2026**.

- **Production:** https://rise-ruby-three.vercel.app/
- **Plan & milestones:** `.claude/plans/website-plan.md` — the source of truth. Keep its checkboxes current as work lands.
- **Design system:** `design-system/` — vendored "Evergreen & Gold" kit (tokens, fonts, logo, UI patterns). Reference only; it is not part of the app build and is eslint-ignored.
- **Content source:** the canonical content draft (Google Drive file id `1oyXhmnr6nsm-hMxmmlApM8VmDhz5IWVQ`). Page copy is baked into code from there.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 6 · Tailwind CSS v4 · Vitest 4 + Testing Library · lucide-react. Hosted on Vercel.

## Toolchain (important)

- **Use Node 22** — pinned in `.nvmrc` (`22.14.0`). Run `nvm use` first. Do **not** use Node 23: it is non-LTS / end-of-life, and the latest ESLint and Vitest explicitly reject it.
- **Default to the latest stable version of every framework, dependency, and GitHub Action.** Don't wait to be told.
  - **One exception: ESLint stays on v9.** `eslint-config-next@16`'s bundled plugins cap at ESLint 9; npm marks v10 as `invalid`. Do not bump ESLint to 10.

## Commands

```bash
npm run dev        # next dev (Turbopack)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # next build (the deploy gate)
```

## Architecture & conventions

- **App Router** under `app/`. Server Components by default; add `'use client'` only when required (currently only `Nav`).
- **Components:** `components/shared/` for anything reused across pages; **one subfolder per page** (`components/home/`, future `components/about/`, …). Unit tests colocated in a `__tests__/` folder beside the components.
- **Design tokens:** the `:root` block from `design-system/colors_and_type.css` is ported into `app/globals.css` and mapped to Tailwind utilities via `@theme inline`. Prefer the role/brand utilities (`bg-primary`, `text-ink`, `bg-evergreen-50`, `rounded-pill`, `shadow-evergreen`, `font-display`).
- **Fonts:** Sora + Plus Jakarta Sans via `next/font/google` (subsets `latin` + `latin-ext`), self-hosted at build. Do **not** use the bundled `design-system/fonts/*.woff2` — they are single-weight and lack Yoruba glyphs.
- **Icons:** lucide-react. lucide 1.x removed brand icons, so the social glyphs (Instagram/Facebook/LinkedIn) are inlined in `components/shared/icons.tsx`.
- **Images:** `next/image` with static imports; real photos live in `public/`. `image-types.d.ts` supplies static-image types for `tsc` (the generated `next-env.d.ts` is git-ignored and only exists after a build).
- **Logo:** swappable via `components/shared/Logo.tsx`.

## Code style

- **No comments that reference the plan, content doc, design system, or milestones** (e.g. "per the plan", "copied from the content draft"). Comments explain technical *why* only.
- **Expand acronyms on first use:** full term followed by the acronym in parentheses, e.g. "West African Examinations Council (WAEC)".
- **Avoid em dashes in visible page copy** — prefer commas, colons, or parentheses. (A few are intentionally kept; don't bulk-replace blindly.)
- Sentence case for UI text. Gold is never used as body text (contrast).

## Testing

- Vitest + React Testing Library on jsdom. `vitest.setup.ts` mocks `next/link`, `next/navigation`, and `next/image` so components render without the Next runtime.
- Tests gate the pipeline — keep them green.

## Quality gates (before pushing)

1. `npm run lint && npm run typecheck && npm test && npm run build` must all pass.
2. **Code review** via the `everything-claude-code:code-reviewer` subagent after each substantial change; address findings.
3. **Security review** via the `everything-claude-code:security-reviewer` subagent as the final gate before pushing.
4. **UI verification:** prefer a one-shot headless screenshot (`chrome --headless=new --screenshot`) — it does not trigger Chrome's "Allow remote debugging" consent prompt that `agent-browser` does. Use `agent-browser` only when a true emulated mobile viewport or interaction is needed.

## Git & commits

- **Never add `Co-Authored-By` or any Claude/AI attribution** to commit messages.
- Commit and push **only when asked**.

## CI/CD & deploy

- **GitHub Actions** (`.github/workflows/ci.yml`): the `verify` job runs lint → typecheck → test → build on every push and PR.
- **Production deploys are gated on CI.** The `deploy` job has `needs: verify` and runs only on push to `main`, deploying to Vercel via the CLI (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`). A red pipeline means no deploy.
- **Vercel's automatic deploy on `main` is disabled** (`vercel.json` → `git.deploymentEnabled.main = false`) so the pipeline is the only path to production. Branch/PR previews still auto-deploy.
- Required GitHub repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Do not deploy to production outside the pipeline.

## Product notes

- The **home page stays broad** — no Oyo-specific framing (that lives on the Projects / TOP page). CTAs are learn-first ("Explore our programmes", "Get involved").
- Photography is placeholder until real RISE photos are supplied.
