# Implementation Plan — Projects `/projects` (index + detail pages)

Part of **Milestone 2 (Core pages)**. Builds the Projects section: a `/projects`
index plus per-project detail pages. Content is from the canonical draft (Page 3:
Projects). Server Components throughout, except a single small client component for
the gallery lightbox. The 2019 bootcamp photos (three school folders supplied via
Drive) are curated, optimized, and shown on the 2019 project's detail page.

## Decisions locked

- **Index + detail, not one long page.** `/projects` lists the projects, and
  each "Read more" opens a project-specific page with its own URL. Rationale: per-
  project URLs are shareable, better for search-engine optimisation (SEO), and give
  the Home "What We Do" cards and the footer's programme links real deep-link
  targets. The content volume (the flagship plus a past project, each substantial)
  makes a single page long and flat.
- **Index is full-width editorial rows, not a card grid.** With only two projects,
  a two-up card grid looks sparse and flattens their unequal weight. Instead each
  project is a full-width stacked row (eyebrow status pill + title + lede + "Read
  more"), divider between them — mirroring the Team page's full-width row pattern.
  Both rows are equal size (equal billing for the live flagship and the 2019 proof).
- **The "Join the community" CTA is an intentional dead link → 404.** RISE Impact
  Network's CTA has no destination yet, so it points at `/get-involved/impact-network`
  (no route), which auto-renders the existing `app/not-found.tsx`. Horizons' mentor/
  mentee CTAs point at their planned `/get-involved/*` routes (also 404 until the
  Get Involved milestone ships) — consistent, not special-cased.
- **Two projects to date:**
  - **The Oyo Project (TOP)** — the flagship (2026– ), `/projects/the-oyo-project`.
  - **Foundations of Impact** — the 2019 bootcamps, `/projects/foundations-of-impact`.
- **The three TOP programme tiers are sections within the TOP page** (anchored), not
  separate project pages — they are sub-programmes of one project:
  `#rise-foundations`, `#rise-horizons`, `#rise-impact-network`.
- **The 2019 gallery is a section on the Foundations detail page**, after the story
  and impact highlights — it is the visual proof, owned by that project. **Grouped by
  the three schools visited** (the Drive folder names): Aatan Baptist Comprehensive
  School, Best Legacy International Secondary School, SPED International Secondary
  School. (The folder structure is the information architecture.)
- **Photos are curated and static, no content-management system.** The 2019 set is
  historical and fixed, so ~8–12 best candid shots per school are committed to
  `public/`, optimized for the web, and served by `next/image`. No Sanity for this.
- **Data-driven.** A single source of truth, `lib/projects.ts`, consumed by the index
  and a dynamic `[slug]` detail route (`generateStaticParams` → all pages prerender
  static, matching the rest of the site).
- **Lightbox is the only `'use client'` piece.** Everything else stays a Server
  Component, mirroring the existing convention (only `Nav` is client today).

## New files

```
lib/projects.ts                                  # project roster + getProject() (single source of truth)
app/projects/page.tsx                            # index route + metadata
app/projects/[slug]/page.tsx                     # detail route + per-project metadata + generateStaticParams
components/projects/ProjectIndexRow.tsx          # one full-width row on the index
components/projects/ProjectIntro.tsx             # detail-page intro/prose block
components/projects/TierSection.tsx              # a TOP programme tier (anchored)
components/projects/ImpactHighlights.tsx         # stat/highlight row (Foundations)
components/projects/ProjectGallery.tsx           # school-grouped photo grids (server)
components/projects/Lightbox.tsx                 # 'use client' fullscreen viewer
components/projects/__tests__/*.test.tsx         # colocated unit tests
public/projects/foundations-2019/aatan/*         # curated + optimized photos
public/projects/foundations-2019/best-legacy/*
public/projects/foundations-2019/sped/*
```

Reuses the shared `PageHeader`, `Container`, `Eyebrow`, `Button`, and `cn`.

## Routing & data model — `lib/projects.ts`

```ts
import type { StaticImageData } from "next/image";

export type TierCta = { label: string; href: string };

export type Tier = {
  slug: string;            // "rise-foundations" → anchor id
  name: string;            // "RISE Foundations"
  subtitle: string;        // "Secondary school programme"
  audience: string;        // target group line
  body: string[];          // paragraphs
  focus: string[];         // key focus areas
  cta?: TierCta[];
};

export type GallerySchool = {
  school: string;          // "Aatan Baptist Comprehensive School"
  location?: string;       // "Oyo"
  photos: { src: StaticImageData; alt: string }[];  // ~8–12; [] until photos land
};

export type Project = {
  slug: string;            // "the-oyo-project"
  name: string;            // "The Oyo Project (TOP)"
  period: string;          // "2026–" | "2019"
  status: "active" | "past";
  summary: string;         // index-row blurb
  lede: string;            // detail-page header lede
  intro: string[];         // detail-page intro paragraphs
  tiers?: Tier[];          // TOP only
  highlights?: string[];   // Foundations only
  gallery?: GallerySchool[]; // Foundations only
};

export const projects: ReadonlyArray<Project> = [ /* TOP, Foundations */ ];
export function getProject(slug: string): Project | undefined { /* … */ }
```

`app/projects/[slug]/page.tsx` resolves the project via `getProject(slug)`, calls
`notFound()` for unknown slugs, and exports `generateStaticParams()` from `projects`.
`PageHeader.lede` is a plain string, so the *Agboole* italic treatment lives in
`ProjectIntro` (the body), not in the header.

## Page composition

### Index `/projects`
1. **Page header** — shared `PageHeader` (eyebrow "Our work", title, one-line lede).
2. **Project rows** — `ProjectIndexRow` per project: status pill (Active / 2019),
   name, summary, and a "Read more →" link to the detail page. Full-width stacked
   rows of equal size with a divider between them; the flagship (TOP) leads, the
   past project (Foundations) follows.

### The Oyo Project (TOP) `/projects/the-oyo-project`
1. **Page header** — "The Oyo Project (TOP)", with *Agboole* set in body text (Plus
   Jakarta Sans covers Yoruba) and the "Building Community, Expanding Opportunity"
   framing as the lede.
2. **Intro** — `ProjectIntro`: what Agboole is (community, home, collective progress),
   the flagship multi-level programme walking young people from secondary school into
   their professional lives.
3. **Three tiers** — `TierSection` each, anchored:
   - **RISE Foundations** (`#rise-foundations`) — secondary school students in partner
     schools in Oyo. Focus: Leadership Development, Mentorship, Academic Excellence,
     Character Formation, Community Engagement.
   - **RISE Horizons** (`#rise-horizons`) — tertiary students affiliated with Oyo.
     Focus: Professional Mentorship, Career Development, Leadership Growth, Scholarship
     & Opportunity Awareness, Personal Development. CTAs: Apply as a mentor / mentee.
   - **RISE Impact Network** (`#rise-impact-network`) — early-career and established
     professionals affiliated with Oyo. Focus: Professional Networking, Career
     Advancement, Mentorship & Knowledge Sharing, Leadership in Service, Community
     Impact. CTA: Join the community → intentional dead link (`/get-involved/impact-network`,
     no route) that renders the 404 until a community hub exists.

Each `TierSection` carries `scroll-mt` so the sticky nav does not cover the heading
when a `#tier` anchor is followed from Home or the footer.

### Foundations of Impact `/projects/foundations-of-impact`
1. **Page header** — "Foundations of Impact", period 2019, lede naming the Leadership
   & Career Development Bootcamps.
2. **The story** — `ProjectIntro`: the 2019 bootcamps for secondary school students in
   Oyo town, the facilitators, broadening perspectives; the belief that still guides
   the work.
3. **Impact highlights** — `ImpactHighlights`: 600+ students reached; 3 schools across
   Oyo; leadership experts and career professionals as facilitators; focus areas
   (leadership development, career awareness, self-development, sustainable
   development, community building).
4. **Gallery** — `ProjectGallery`, grouped by school (see below).

## Gallery + lightbox spec

- **`ProjectGallery` (Server Component):** one labelled block per `GallerySchool` —
  school heading + optional location line, then a responsive grid (2 cols mobile / 3
  tablet / 4 desktop) of `next/image` thumbnails with uniform `aspect-[4/3]`,
  `object-cover`, `rounded-lg`, and the brand shadow, so mixed source ratios align.
  Below-the-fold images lazy-load (the `next/image` default). **Until a school's
  `photos` array is populated, its block renders a "photographs are being prepared"
  placeholder** instead of an empty grid — the structure ships green before the
  curated 2019 images land.
- **`Lightbox` (`'use client'`):** clicking a thumbnail opens a fullscreen overlay
  with the large image, previous/next controls, a close button, and keyboard support
  (←/→ to navigate, Esc to close), focus-trapped, click-outside to dismiss. It avoids
  any browser `alert`/dialog. No external dependency — a small custom component.
- **Alt text is required and descriptive**, e.g. "Students at the 2019 leadership
  bootcamp, Aatan Baptist Comprehensive School."

## Photo pipeline (curation → optimization → placement)

1. **Curate** ~8–12 per school from the Drive folders: prefer candid group shots,
   facilitators, and students engaged; **drop** the "Career and Leadership Boot Camp"
   banner/poster slides and near-duplicates.
2. **Download** the chosen originals (Drive) to a temp dir.
3. **Optimize** each to web size: longest edge ~1600 px, quality ~80, strip metadata
   (EXIF) — using `sips`/`sharp`/ImageMagick. Target ~200–400 KB each. Keep `.jpg`.
4. **Place** under `public/projects/foundations-2019/<school-slug>/` with predictable
   names (e.g. `aatan-01.jpg`), and import them into `lib/projects.ts` as static
   imports so `tsc` types them and `next/image` gets intrinsic dimensions + blur.
5. School slugs: `aatan`, `best-legacy`, `sped`.

Total committed footprint stays small (~30 images × ~300 KB ≈ 9 MB), versus the
200+ raw originals (>0.5 GB) which are **not** committed.

## SEO / metadata

Per-page `metadata` with unique `title`, `description`, and `alternates.canonical`
(`/projects`, `/projects/the-oyo-project`, `/projects/foundations-of-impact`). Match
the existing pages: only `description` + canonical; the root layout supplies
OpenGraph (no per-page `openGraph` blocks, for parity). The layout's title template
("%s · RISE Initiative") wraps each `title`. Cover all three routes when
`sitemap.xml` lands (tracked separately in the milestone).

## Cross-linking (wire-up, small follow-ups)

- Home **"What We Do"** cards (Secondary / Tertiary / Early-career) → deep-link to the
  matching tier anchor on the TOP page instead of bare `/projects`.
- Footer's **RISE Foundations / Horizons / Impact Network** → the same tier anchors.
- Home hero "Explore our programmes" already points at `/projects` (now real).

## Accessibility & style

- Each `<section>` `aria-labelledby` its heading (site pattern).
- Gallery: required descriptive `alt`; lightbox keyboard-operable and focus-trapped.
- Gold never used as body text. Sentence case for UI text. Avoid em dashes in visible
  copy. Expand acronyms on first use (e.g. Sustainable Development Goals (SDG)).
- No comments referencing the plan/content draft/design system.

## Tests (Vitest + React Testing Library)

- `lib/projects.ts`: roster integrity — expected slugs; TOP has three tiers with the
  expected anchors; Foundations has highlights and a gallery; every gallery photo has
  non-empty `alt`.
- Index: renders a row per project with a working "Read more" link to each slug.
- TOP detail: renders the three tier headings and their anchor ids; Horizons CTAs link
  to the Get Involved routes; the Impact Network CTA points at the dead `/get-involved/
  impact-network` path.
- Foundations detail: renders the story, the "600+" highlight, and one gallery block
  per school (3), with the school headings present.
- `Lightbox`: opens on thumbnail click, closes on Esc/close, advances on next.
- `[slug]` route: unknown slug triggers `notFound()`.

## Quality gates (before "done")

1. `npm run lint && npm run typecheck && npm test && npm run build` all green.
2. `everything-claude-code:code-reviewer` subagent — address findings.
3. `everything-claude-code:security-reviewer` subagent — final gate.
4. UI check via one-shot headless screenshots (mobile + desktop): index, both detail
   pages, and the lightbox open.

## Sequencing

All projects are in scope and land together. Build order keeps the pipeline green at
every step:

1. **`lib/projects.ts`** — full roster (TOP + Foundations), exact copy from the draft.
   Gallery schools are present with empty `photos: []` for now.
2. **Components + routes** — index rows, `ProjectIntro`, `TierSection`,
   `ImpactHighlights`, `ProjectGallery` (with the placeholder state), `Lightbox`, and
   the `/projects` + `/projects/[slug]` routes.
3. **Tests + quality gates** — green lint/typecheck/test/build.
4. **2019 photos last** — curate, optimize, and place the Drive photos, then fill the
   `photos` arrays with static imports. The gallery's placeholder state means the
   build is shippable before this step completes.

## Open content gaps (non-blocking, flag for the team)

- Best Legacy International Secondary School — confirm the full name as displayed.
- TOP copy is the 2026 flagship; confirm tier wording and CTAs before launch.
- **RISE Impact Network needs a real CTA destination.** It is a deliberate 404 for now
  (`/get-involved/impact-network`); wire it to a community hub or Get Involved anchor
  before launch.
- Real photographs exist only for the 2019 project; TOP has none yet (text-led for
  now, no placeholder hero needed).

## Milestone bookkeeping

On completion, tick **Projects** under Milestone 2 in `website-plan.md` (the
`About · Team · Projects · Get Involved · Contact · FAQ` line advances).
```
