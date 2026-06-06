# RISE — Deck Templates

Open `index.html` for a runnable 6-slide deck (arrow keys / click to navigate, `P` or print for PDF, thumbnail rail on the left). Built on the shared `deck-stage.js` shell at 1920×1080.

## Slide types (edit any in place)
1. **Title** — ascent gradient, logo, big headline + mission line.
2. **Section divider** — dark charcoal, numbered, big section name + evergreen rule.
3. **Content** — three-up pillar layout (Identify / Develop / Connect) with Lucide feature icons.
4. **Stat / impact** — white, oversized evergreen figures with labels.
5. **Quote** — charcoal, large pull-quote + attribution.
6. **Closing** — ascent gradient CTA + contact.

## Reuse
- Copy a `<section>…</section>` block and edit its copy. Each slide is static HTML for direct editing.
- Tokens come from `../colors_and_type.css`; logo from `../assets/logo-mark.svg`; icons via Lucide (`0.460.0`).
- Entrance motion is **transform-only** (content stays visible if animations are frozen — e.g. in static previews, print, or background tabs).

## Conventions
- One headline idea per slide, sentence case, eyebrow is the only all-caps.
- Two background worlds: **paper/white** (content) and **charcoal / ascent gradient** (title, section, quote, closing). Don't introduce a third.
