# Implementation Plan — About `/about` + Team `/team`

Part of **Milestone 2 (Core pages)**. Two routes, built together. Content is from
the canonical draft (Page 2: About Us). Server Components throughout — no client
interactivity needed, so there are no loading or client-state concerns; both pages
render fully on the server from baked content. No empty states apply (content is
not data-fetched).

## Decisions locked

- **Two separate routes**, as the sitemap already defines: `app/about/page.tsx`
  and `app/team/page.tsx`. Routes already exist in `lib/site.ts` (`routes.about`,
  `routes.team`).
- **Missing bios (Kunle Oguntoye, Ayo Salaudeen):** render their cards with name +
  role + photo placeholder and a short "Full bio coming soon" line. Bios drop in
  later by editing data only — no structural change.
- **Layout (revised during build):** the original 3-up circular-avatar card grid was
  dropped in favour of a **vertical stack of full-width rows, one member per row**:
  photo on the left (rectangular portrait, `aspect-[4/5]`, `rounded-xl`), content on
  the right (name, role, meta, bio, school). A divider sits **in the content column
  only** (an `<hr>` after the text), so it never reaches under the photo; the last row
  omits it. `TeamGrid` orders **members with bios first** (stable sort on `hasBio`),
  pushing "coming soon" rows to the bottom, while `lib/team.ts` keeps the canonical
  draft order.
- **Photos:** members fall back to `ImagePlaceholder` until a real photo is supplied.
  The real-photo swap is **data-only**: a `photo?: StaticImageData` field on
  `TeamMember` (a static import from `public/team/<slug>.<ext>`), rendered via
  `next/image` (`fill` + `object-cover`) when present. `ImagePlaceholder` gained a
  deterministic **`rounded?: string` prop** (default `rounded-lg`) so its corner
  radius is explicit rather than relying on className ordering.
- **Team data** lives in one source of truth, `lib/team.ts`, consumed by the Team
  page. (About does **not** repeat the team — see below. The Team page is reached via
  the primary nav and the footer's "Our team" link.)

## New files

```
lib/team.ts                              # team roster (single source of truth)
app/about/page.tsx                       # About route + metadata
app/team/page.tsx                        # Team route + metadata
components/shared/PageHeader.tsx         # reusable page intro band (About + Team)
components/about/OurStory.tsx            # 2017 founding + 2019 bootcamps
components/about/Vision.tsx              # vision statement(s)
components/about/Objectives.tsx          # objectives (mission merged in)
components/about/Values.tsx              # 6-value grid, RISE acronym highlighted
components/about/NameIdentity.tsx        # RISE + Agboole / Yoruba heritage
components/team/TeamGrid.tsx             # bio cards (full + "coming soon")
components/team/TeamMemberCard.tsx       # single bio card (circular photo)
components/about/__tests__/*.test.tsx    # colocated unit tests
components/team/__tests__/*.test.tsx
```

Follows the established convention: one subfolder per page under `components/`,
tests colocated in `__tests__/`, shared pieces in `components/shared/`.

## Page composition

### About `/about`

1. **Page header** — shared `PageHeader` (eyebrow "About RISE Initiative", title,
   one-line lede). A text-led intro band, no big photo; matches the home page rhythm.
   Same component the Team page uses.
2. **Our Story** — the 2017 founding paragraph + 2019 bootcamps (600+ students,
   three Oyo secondary schools). Paired with an `ImagePlaceholder` (e.g. "2019
   leadership bootcamp, Oyo").
3. **Vision** — the vision statement(s) from the draft. (Draft has two vision
   paragraphs; trim toward one if they read as redundant — confirm with team.)
4. **Objectives** — the 5 objectives (Leadership Development; Mentorship &
   Opportunity Access; Education & Talent Development; Community Engagement &
   Service; Sustainable Community Transformation) as a titled list/grid. **The draft's
   separate "Mission" block is merged into this section** (team decision in the doc:
   Objectives and Mission overlapped — keep one Objectives section; the mission
   snapshot lives only on the home page). Fold any non-duplicative mission points
   (e.g. the cultural-heritage point; UN Sustainable Development Goals 4, 10, 11) in
   here rather than as a standalone Mission section. **No separate Mission section on
   About.**
5. **Values** — all six values, **each with its own descriptive Lucide icon** + the
   draft's description, in cards styled like `WhatWeDo` (icon in a tinted rounded
   square). Icon + tint per value:
   - **Resilience** → `Sprout`, `bg-emerald-50 text-emerald-600`
   - **Integrity** → `ShieldCheck`, `bg-gold-50 text-gold-600`
   - **Service** → `HeartHandshake`, `bg-emerald-50 text-emerald-600`
   - **Excellence** → `Award`, `bg-gold-50 text-gold-600`
   - **Collaboration** → `Users`, `bg-emerald-50 text-emerald-600`
   - **Impact** → `Target`, `bg-gold-50 text-gold-600`

   (Tints alternate emerald / gold across the six; gold is icon-only, never body text.)

   **All six cards share one identical design** — no special treatment for the four
   that spell RISE. Order them R-I-S-E first (Resilience, Integrity, Service,
   Excellence), then Collaboration and Impact, so the initials still read in sequence
   for anyone scanning, but nothing is visually singled out.

   Grid: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`, single column on mobile.

   The RISE acronym nod, if surfaced at all, lives **only in the section heading
   copy**, not the cards. **COPY NOTE (your call):** "Rising Above Limitations" is a
   tagline and a play on the verb *rise*, not an acronym, so leaning into a values
   acronym is fine and creates no conflict. The one thing to avoid is phrasing that
   implies **all six** values spell RISE: only four do (Collaboration and Impact do
   not). Honest framing that sidesteps this: lead with the four R-I-S-E values, then
   Collaboration and Impact, and if the acronym is mentioned at all, say the values
   *begin with the letters of our name* rather than that RISE "stands for" them.
   Eyebrow "Our values" with a neutral title (e.g. "What we stand for") still works —
   wording to confirm with the team.
6. **Name & Identity** — RISE = "Rising above limitations". Present **The Oyo
   Project (TOP)** as the project's name; *Agboole* is framed as the **cultural /
   community concept** behind it (compound / family home / neighbourhood), **not** a
   second name for the whole project (team leaned to TOP as the single name; Agboole
   may settle as just the mentorship/community aspect — keep the copy flexible).
   *Agboole* set in body text (Plus Jakarta Sans covers Yoruba; Sora does not).
   Includes a short **"what is Oyo"** context line so visitors unfamiliar with the
   place understand the rooting. **Draft placeholder copy (team to confirm/edit):**

   > Oyo is a historic town in southwestern Nigeria and one of the cultural homes of
   > the Yoruba people. It is where RISE Initiative is rooted, and where our work
   > begins.

   (Deliberately modest on history: today's Oyo town and the old Oyo Empire's
   capital, Oyo-Ile, are not the same place, so the line avoids "seat of the
   empire" claims. Team can add historical depth or local warmth as they prefer.)
   **This is the last About section** — no team teaser (Team is reached via the
   primary nav and the footer's "Our team" link; see discoverability note under SEO).

### Team `/team`

1. **Page header** — shared `PageHeader` (eyebrow "Our team", title, the
   operational-team intro lede as the supporting line).
2. **Team rows** — `TeamGrid` renders one full-width `TeamMemberCard` row per member
   from `lib/team.ts` (photo left, content right; see Layout above):
   - **Full bio members** (Fareedah, Dara, Tobi): portrait photo (or placeholder),
     name, role, one-line meta (profession · location), bio paragraphs. **School
     affiliation is woven in subtly** (team note: not a labelled "School
     Affiliation:" heading) — a quiet, low-weight closing line.
   - **Coming-soon members** (Kunle, Ayo): portrait placeholder, name, role, and a
     muted "Full bio coming soon" line. Same row shell, conditional body. These sort
     to the bottom.

## Data model — `lib/team.ts`

```ts
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  profession?: string;   // e.g. "Software Engineer"
  location?: string;     // e.g. "London, United Kingdom"
  bio?: string[];        // paragraphs; absent → "coming soon" card
  school?: string;       // school affiliation line
  photo?: StaticImageData; // static import from public/team/; absent → placeholder
};
```

Data order follows the draft: Fareedah → Kunle → Ayo → Dara → Tobi. A `hasBio`
helper (`!!member.bio?.length`) drives the two `TeamMemberCard` variants and the
display sort (bios first). `lib/team.ts` is consumed only by the Team page (the
About page does not list the team).

Layout: a vertical stack (`flex flex-col gap-12 sm:gap-16`) of full-width rows,
single column on mobile, two columns (`md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`)
from `md` up.

**Acronyms expanded on first use** in bio copy: United Nations Sustainable
Development Solutions Network, Public Relations Officer, Society of Electrical and
Electronic Engineering Students (SEEES), Vice President (VP). Keep the bios faithful
to the draft otherwise.

## SEO / metadata

Per-page `metadata` export with a unique `title`, `description`, and
`alternates.canonical` (`/about`, `/team`). **Match the Home page exactly**
(`app/page.tsx`): it sets only `description` + `alternates.canonical` and lets the
root layout supply OpenGraph — so do **not** add per-page `openGraph` blocks (the
layout's `openGraph.url` is `/`; per-page OG URLs are a deliberate later
enhancement, not part of this work, to keep parity with Home). The root layout's
title `template` ("%s · RISE Initiative") wraps each page's `title`.
`sitemap.xml` + `robots.txt` are tracked separately in the milestone (cover both
new routes when that lands).

**Discoverability of `/team`:** Team is in the **primary nav** (`navLinks`),
positioned right after About to keep the org/people grouping together, and is also
reached via the footer's "Our team" link (`Footer.tsx`, present on every page). The
About page does not tease it inline. Promoting it to the nav surfaces an NGO
credibility asset prominently; the tradeoff is that the page currently leads with
two "coming soon" bios and placeholder photos, so prioritise landing the remaining
bios and real photography.

## Accessibility & style

- Each `<section>` `aria-labelledby` its heading (home-page pattern).
- Gold never used as body text (contrast). Sentence case for UI text.
- Avoid em dashes in visible copy — commas/colons/parentheses instead.
- Required, descriptive `aria-label` on every `ImagePlaceholder`.
- No comments referencing the plan/content doc/design system.

## Tests (Vitest + RTL)

- `lib/team.ts`: roster integrity — every member has name + role; bio-less members
  flagged correctly; expected count.
- About sections: each renders its heading and key copy (story dates, all 6 value
  titles with the four R.I.S.E. values first and in R-I-S-E order, all 5 objective
  titles, the *Agboole* meaning).
- Team grid: full-bio member renders its bio paragraphs + (subtle) school line;
  coming-soon member renders the "coming soon" line. Assert absence concretely —
  e.g. render Kunle's card and assert a known phrase from a real bio is **not**
  present, plus the "coming soon" text **is** present (don't rely on counting
  paragraphs). Correct total card count (5).

## Quality gates (before this is "done")

1. `npm run lint && npm run typecheck && npm test && npm run build` all green.
2. `everything-claude-code:code-reviewer` subagent — address findings.
3. `everything-claude-code:security-reviewer` subagent — final gate.
4. UI check via one-shot headless screenshot (mobile + desktop) on both routes.

## Open content gaps (non-blocking, flagged for the team)

- Kunle Oguntoye and Ayo Salaudeen bios (showing "coming soon" until supplied).
- Real team photographs (placeholders until supplied).
- **"What is Oyo" context** — doc comment asks for a short explainer of what Oyo is.
  A neutral **draft line is now in the plan** (Name & Identity); team to confirm or
  edit the wording.
- The draft has two distinct **vision** statements — plan keeps both; trim to one if
  the team prefers.
- Agboole vs TOP naming is still being deliberated by Fareedah and Dara; copy kept
  flexible so a final call needs no restructure.

## Milestone bookkeeping

On completion, tick **About** and **Team** under Milestone 2 in
`website-plan.md` (the `About · Team · Projects · Get Involved · Contact · FAQ`
line becomes partially checked).
