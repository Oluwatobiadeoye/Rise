---
name: rise-design
description: Use this skill to generate well-branded interfaces and assets for RISE Initiative (a youth-leadership NGO), either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, social graphics, flyers, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `README.md` — brand context, content + visual foundations, iconography, full index.
- `colors_and_type.css` — all tokens (color, type, spacing, radii, shadow, motion) + semantic classes. Link in every artifact.
- `assets/` — logo mark (color + mono), lockups.
- `preview/` — design-system swatch/specimen cards.
- `ui_kits/website/` — marketing site (React components).
- `ui_kits/social/` — social + flyer/poster templates.
- `slides/` — deck templates on `deck-stage.js`.

## Non-negotiables
- **Palette:** Evergreen & Gold — evergreen `#0F5B4F` (primary), charcoal `#1F2933`, emerald `#2E9E89`, gold `#C9A86A`, on warm paper `#F7F5F0`. Warm ink text, never pure black.
- **Type:** Sora (display) + Plus Jakarta Sans (body), self-hosted in `/fonts` via `@font-face` in `colors_and_type.css`.
- **Voice:** warm, optimistic, active; sentence case everywhere except wide-tracked all-caps eyebrows. "you" for the reader, "we" for RISE. No emoji in formal materials.
- **Icons:** Lucide, 2px stroke, currentColor.
- **Motion:** gentle fades + upward "rise" slides. Content must stay visible if animation is frozen.
