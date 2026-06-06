# RISE — Website UI Kit

A high-fidelity, interactive recreation of the RISE Initiative marketing website. Modular React components you can recombine for real pages or throwaway mocks.

## Run it
Open `index.html`. It's a single-page marketing site with working interactions:
- Sticky nav that blurs/elevates on scroll + responsive mobile menu button
- "Join a cohort" / "Become a mentor" open an **apply modal** with a success state
- Smooth-scroll anchor nav, hover lifts on cards

## Components (`*.jsx`)
| File | What it is |
|---|---|
| `shared.jsx` | `Placeholder` (stand-in photo), `useLucide` hook, `LOGO` path |
| `Nav.jsx` | Sticky top nav + brand lockup + CTAs |
| `Hero.jsx` | Headline, lead, CTAs, trust row, gold-glow accent |
| `Pillars.jsx` | Identify / Develop / Connect program cards |
| `Impact.jsx` | Ascent-gradient stats band |
| `Mentor.jsx` | "Mobilise professionals" CTA section |
| `Steps.jsx` | 3-step "how it works" |
| `Footer.jsx` | Dark charcoal footer + social links |
| `JoinModal.jsx` | Apply/mentor form modal with success state |
| `App.jsx` | Composes the page, owns modal state |

## Conventions
- Styles live in `styles.css` (classes), tokens come from `../../colors_and_type.css`.
- Icons: **Lucide** via CDN, pinned to `0.460.0` (keeps both brand icons and `users-round`/`handshake`).
- Photography is **placeholder** (`Placeholder` / `.ph`) — swap for real warm, candid RISE photos.
- Components export to `window` so each Babel script shares scope.

## Notes / caveats
- Forms are cosmetic (no backend) — this is a UI kit, not production.
- Built mobile-responsive (single breakpoint at 860px).
