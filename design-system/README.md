# RISE — Design System

> **Mission:** Identify, develop and connect young people through leadership development, mentorship and access to opportunities — while mobilising professionals to drive community impact.

RISE uses the **Evergreen & Gold** palette. It carries the RISE Initiative's mission and youth-leadership purpose, grounded in a calm, established palette: deep evergreen, warm gold, charcoal and warm paper. This design system gives any designer (or design agent) everything needed to produce on-brand materials: social graphics, slide decks, flyers/posters, and the marketing website.

---

## Brand at a glance

- **Name:** RISE (full: RISE Initiative)
- **Tagline:** *Identify. Develop. Connect.* (working) — full mission line used in long form.
- **Personality:** Grounded & credible · Warm & human · Optimistic & aspirational
- **Core idea / motif:** **The ascent.** Steady, upward growth — the climb toward potential. The logo mark is three **ascending chevrons** rising toward a gold apex (the goal / the spark).
- **Primary audience:** Young people / participants (inviting and aspirational, never corporate-stiff).
- **Secondary audiences:** Professional volunteers/mentors, donors & partners (must read credible and established).

### Color story
**Evergreen & Gold.** Deep **evergreen** (`#0F5B4F`) is growth, steadiness and the climb — the primary action color. **Gold** (`#C9A86A`) is the warm, sparing accent: possibility and worth. **Charcoal** (`#1F2933`) anchors dark sections and text, bottoming out in a **forest green-black** (`#0A2620`) for footers and deep bands. A lighter **emerald** (`#2E9E89`) signals growth and connection. Warm **paper** (`#F7F5F0`) keeps every surface human, not clinical.

| Role | Token | Hex |
|---|---|---|
| Primary (evergreen) | `--rise-evergreen` | `#0F5B4F` |
| Accent (gold) | `--rise-gold` | `#C9A86A` |
| Growth (emerald) | `--rise-emerald` | `#2E9E89` |
| Dark anchor (charcoal) | `--rise-charcoal` | `#1F2933` |
| Deepest (green-black) | `--rise-charcoal-900` | `#0A2620` |
| Text | `--rise-ink` | `#1F2933` |
| Page bg (paper) | `--rise-paper` | `#F7F5F0` |

> **Token naming note:** the brand ramps are named for their color — `--rise-evergreen` (primary), `--rise-gold` (accent), `--rise-emerald` (growth), `--rise-charcoal` (anchor). Still, reference colors by **role** (`--primary`, `--accent`, `--secondary`) wherever possible, so a future re-skin only touches the token definitions.

### Type
- **Display / headings:** **Sora** (geometric, confident, a little optimistic).
- **Body / UI:** **Plus Jakarta Sans** (humanist geometric — warm and very readable).
- Both are **self-hosted** in `/fonts` (woff2) and declared via `@font-face` in `colors_and_type.css` — no CDN dependency. Swap the two `--font-*` vars and the `@font-face` files to relicense.

---

## CONTENT FUNDAMENTALS

How RISE writes. Copy should sound like an encouraging mentor: confident, warm, direct — never bureaucratic NGO-speak.

**Voice & tone**
- **Optimistic and active.** Lead with possibility and momentum. "Your potential, realised." not "We aim to facilitate youth empowerment outcomes."
- **Human, not institutional.** Plain words over jargon. Avoid "stakeholders," "beneficiaries," "capacity-building." Say *young people*, *mentors*, *our community*.
- **Credible when it counts.** For donors/partners, back warmth with specifics (numbers, named programs, outcomes) — but keep sentences short.

**Person & address**
- Speak to the reader as **"you"** ("Find your people. Build your future."), and speak as **"we"** for the organisation.
- Refer to participants as **young people** or **members**, mentors as **mentors** or **professionals**.

**Casing**
- **Sentence case** for almost everything — headings, buttons, nav, labels.
- **ALL-CAPS only** for small eyebrow/kicker labels with wide tracking (e.g. `LEADERSHIP PROGRAM`). Never for long text.
- The brand name is always **RISE** (all caps). "RISE Initiative" in full, "RISE" on second reference.

**Mechanics**
- Short sentences. Active voice. One idea per line in headlines.
- Use the serial comma. Use en-dashes for ranges.
- Numbers: spell out one–nine in body copy; use figures for stats ("3,000 young people").

**Emoji:** Not used in formal/brand materials, website, decks, or flyers. Acceptable *sparingly* on social captions if it fits the platform — never in headlines or on-graphic text.

**Example copy**
- Hero: **"Rise into your potential."** / sub: "Leadership development, mentorship and real opportunities for young people ready to lead."
- CTA buttons: "Join the next cohort" · "Become a mentor" · "Partner with us"
- Eyebrow: `YOUTH LEADERSHIP` · `MENTORSHIP NETWORK` · `COMMUNITY IMPACT`
- Stat line: "Since 2024 — 1,200 young people, 180 mentors, 40 partner organisations."

---

## VISUAL FOUNDATIONS

When in doubt, optimise for **grounded, warm, upward**.

**Overall vibe.** Calm, credible, optimistic. Generous whitespace on warm paper. Confident geometric type. Color used boldly in evergreen accents and full-bleed charcoal/green "ascent" sections, gold reserved for small moments — most surfaces are calm paper/white with one or two strong moments.

**Color usage.**
- Default surfaces are **paper** (`#F7F5F0`) or **white**. Text is **charcoal**.
- **Evergreen** is the primary action/energy color — buttons, links, key highlights, the base of the mark. The system's workhorse; usable as larger fills (unlike the old hot coral).
- **Charcoal / green-black** anchors dark sections (footers, hero overlays, stat bands, dark slides) and serious/donor contexts. Footers use the deepest forest green-black.
- **Emerald** signals growth/connection — secondary tags, success, illustrative accents, charts.
- **Gold** is the sparingly-used highlight (the mark's apex, small shapes, underlines, "new" markers). Never body text.
- Avoid pure black (`#000`) — always charcoal. Avoid bright/hot accent fills.

**Backgrounds.**
- Primary: flat **paper / white**.
- Hero & section accents: a subtle **ascent gradient** from charcoal → deep evergreen, used on dark bands and image overlays (`linear-gradient(135deg, var(--rise-charcoal) 0%, var(--rise-evergreen-700) 120%)`). One strong gradient moment per page/deck.
- A soft **radial "gold glow"** (gold at low opacity) is allowed behind hero content.
- **Photography** is central. Full-bleed photos with a charcoal gradient scrim for text legibility.
- A subtle "rising chevron" line motif (echoing the mark) may be used as a quiet decorative element at low opacity.

**Imagery / photography.**
- Real, candid photos of **young people and mentors** — workshops, collaboration, mentoring, community. Authentic and diverse, genuine moments. Avoid stiff stock and corporate handshakes.
- **Treatment:** warm, bright, natural light. Not heavily filtered, not B&W, not cold.
- Over photos used for text: charcoal gradient scrim from bottom (`linear-gradient(to top, rgba(10,38,32,0.85), transparent)`).
- All photos in this system are **placeholders** (`<image-slot>` / labelled boxes) — supply real RISE photography.

**Spacing & layout.**
- 4px base unit; the `--space-*` scale steps 4/8/12/16/24/32/48/64/96px.
- Generous whitespace. Content max-width ~1120px on web. 12-col grid with 24–32px gutters.
- Strong left-alignment for headlines; centered only for hero/landing moments.
- Sticky top nav on web (paper bg, blurs to translucent on scroll).

**Corner radii.** Friendly but not bubbly. Cards `--radius-lg` (20px), buttons `--radius-md` (14px) or pill for primary CTAs, inputs `--radius-md`, chips/tags pill. Images `--radius-lg`. Nothing sharp; nothing fully circular except avatars and pill CTAs.

**Cards.** White surface, `--radius-lg`, 1px `--border` line **or** soft `--shadow-md`. Padding 24–32px. On hover (if interactive): lift with `--shadow-lg` + 2px translateY up.

**Shadows / elevation.** Soft, warm-tinted (charcoal alpha, never gray-black). `sm` (inputs/chips), `md` (cards), `lg` (popovers, hovered cards, modals). Evergreen CTAs may carry a colored `--shadow-evergreen` glow.

**Buttons.**
- *Primary:* evergreen fill, white text, pill or 14px radius, `--shadow-evergreen`. Hover → darker. Press → darker + scale(0.98).
- *Secondary:* charcoal outline or fill on light; on dark, white/paper fill.
- *Ghost/tertiary:* text + evergreen, underline on hover.
- Hit target ≥ 44px. Icon+label uses 8px gap.

**Motion.** Purposeful and gentle. Fades + short upward slides (`translateY(8–16px)` → 0) for entrances — content *rises* in. `--ease-out` default; `--ease-spring` for playful accents. Durations 120/200/360ms. Respect `prefers-reduced-motion`.

---

## ICONOGRAPHY

- **Icon set:** **[Lucide](https://lucide.dev)** — clean, geometric, consistent 2px stroke.
- **Style rules:** stroke icons only, 2px stroke, rounded line caps, 24px default box. Color = `currentColor` (charcoal/slate by default, evergreen when active/interactive).
- **Sizing:** 16px inline, 20–24px in UI, 32–48px as feature icons.
- **The logo mark is NOT an icon** — never use it inline as a bullet or feature icon.
- Feature icons may sit in a soft tinted circle (`--rise-evergreen-50` / `--rise-emerald-50` / `--rise-gold-50`) with the icon in the matching brand color.

---

## INDEX — what's in this system

**Foundations (root)**
- `README.md` — this file.
- `colors_and_type.css` — all design tokens + semantic type classes. Link this in every artifact.
- `index.html` — the system landing / showcase page.
- `SKILL.md` — agent entry point.

**Assets** (`assets/`)
- `logo-mark.svg` — full-color ascending-chevron mark.
- `logo-mark-mono.svg` — single-color mark (`currentColor`).
- `logo-lockup.html` — horizontal & stacked lockups (mark + RISE wordmark).
- Photography is represented by placeholders / `<image-slot>` — supply real photos.

**Preview cards** (`preview/`) — the cards shown in the Design System tab (colors, type, spacing, components, brand).

**UI kits** (`ui_kits/`)
- `website/` — marketing site kit (interactive `index.html`).
- `social/` — social graphics + flyer/poster templates.

**Slides** (`slides/`) — deck templates: title, section, content, stat/impact, quote, closing.

---

## CAVEATS / OPEN QUESTIONS
- **Palette source:** Evergreen & Gold came from the team's four colors (primary `#0F5B4F`, accent `#C9A86A`, bg `#F7F5F0`, text `#1F2933`); the **emerald growth** and **dark anchor** shades were derived to complete the system — easy to adjust.
- **Logo is a fresh v1 concept** for this palette (ascending chevrons → gold apex). Happy to explore alternatives — a monogram "R", a sprout, or a wordmark-only route.
- **All photography is placeholder.** Real, warm, candid photos will transform these materials.
