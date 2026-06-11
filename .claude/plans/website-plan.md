# RISE Initiative — Website Plan

## Context

RISE Initiative ("Rising Above Limitations") is a youth-leadership NGO rooted in
Oyo, Nigeria. Its flagship programme is **The Oyo Project (TOP) — *Agboole***, a
multi-tier programme walking young people from secondary school into their
professional lives. The board needs a public marketing website live by
**end of June 2026** (build owner: Tobi, Director of Technology).

We already have:
- A finished **content draft** (6 source pages) — expanded into the routes in the
  sitemap below. **Source:** [Google Doc](https://docs.google.com/document/d/1oyXhmnr6nsm-hMxmmlApM8VmDhz5IWVQ/)
  (the canonical copy for all page content). *Agents:* read it with the Google Drive
  tools using file id `1oyXhmnr6nsm-hMxmmlApM8VmDhz5IWVQ`.
- A vendored **design system** at `design-system/` — "Evergreen & Gold" palette,
  Sora + Plus Jakarta Sans fonts, design tokens, the **RISE logo** (mark + mono +
  lockups), and a website UI kit (nav, hero, cards, stat band, mentor CTA, footer,
  form modal).

Goal: build a production website from the design system, wire the real content,
add a team-publishable Blog + Gallery, and capture applications/enquiries — by June.

---

## Stack (decided)

| Concern | Choice |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Styling | **Tailwind CSS**, themed with the design-system tokens |
| Fonts / icons / logo | **Sora + Plus Jakarta Sans** via `next/font/google` (self-hosted at build; `latin` + `latin-ext`; real weights), **Lucide** icons, **RISE logo** (from the design system) |
| Blog + Gallery | **Sanity** — team publishes from an editor at `/studio`; live with no redeploy |
| Forms + applications | **Supabase** (durable records) + native on-brand forms |
| Admin review | v1: **Supabase dashboard**. Branded **`/admin`** (Supabase Auth) is a later milestone, only as time allows |
| Email | **Resend** — submission alerts to Tobi's personal email in v1 (applicant decision emails deferred with `/admin`) |
| Hosting | **Vercel** |

**Content split:** bios, programmes, testimonials, values, objectives, stats and
contact details are **baked into the code**. Blog posts and Gallery photos are
**published through Sanity** — no code change needed.

**Typography note — where the fonts come from:** **do NOT use the bundled
`design-system/fonts/*.woff2` files** — they turned out to be a single-weight,
latin-basic subset (no real bold weights, no Yoruba letters). Instead, both
families are pulled **from Google Fonts via `next/font/google`** (`subsets:
['latin','latin-ext']`, real weights 400–800). Next.js downloads them at build and
**self-hosts them on our own domain** at runtime — so no user-facing Google request
(privacy/perf kept), correct weights, and full Latin-Extended coverage. Plus Jakarta
Sans fully covers Yoruba (ẹ ọ ṣ + tone marks); **Sora does not**, so tone-marked
Yoruba stays in body text, with a `unicode-range` fallback for any that appears in a
heading. (The bundled woff2 files remain only for the static design-system preview
HTML.)

---

## Pages & high-level content

> Exact copy is finalized per-page when we build each one. All pages share the
> sticky nav and dark footer; primary nav = Home · About · Projects · Media ·
> Get Involved · Contact, plus a persistent **"Join the Movement"** CTA (→
> `/get-involved`). **Team** and **FAQ** are their own pages, linked from About /
> Contact and the footer.

### Home `/`
> Stays mission-level and broad — **no Oyo-specific framing here**; Oyo identity
> lives on the Projects / TOP page.
- **Hero** — "Empowering the Next Generation of Leaders", subhead, **learn-first CTAs**:
  primary **"Explore our programmes"** → `/projects`, secondary **"Get involved"** →
  `/get-involved`; warm, aspirational youth imagery.
- **Impact stats** — illustrative figures, e.g. 10,000 empowered in 5 years · 3 programme tiers · since 2017.
- **What We Do** — three cards: Secondary Schools · Tertiary Students · Early Career Professionals.
- **Mission snapshot** — short paragraph + link to Our Story.
- **Testimonials** — participant quotes.
- **Footer CTA band** — "Ready to grow with us?" (Apply as a Mentee / Become a Mentor / Support a Student).

### About `/about`
- Our Story (founded 2017; 2019 bootcamps, 600+ students)
- Vision · Objectives · Mission
- Values (Resilience, Integrity, Service, Excellence, Collaboration, Impact)
- Name & Identity (RISE + Agboole / Yoruba heritage)
- Our Team — short intro + link to the Team page.

### Team `/team`
- The Operational Team — full bios (Fareedah, Kunle, Ayo, Oluwadara, Tobi), with
  roles and school affiliations. A credibility asset; grows over time.

### Projects `/projects`
Two projects to date:
- **The Oyo Project (TOP) / Agboole** (2026– ) — the flagship. Intro, then its
  **three programme tiers**:
  - **RISE Foundations** — secondary school students
  - **RISE Horizons** — tertiary students
  - **RISE Impact Network** — early-career & professionals

  (each tier with its focus areas and calls to action).
- **Foundations of Impact** (2019) — the Leadership & Career Development Bootcamps; history & highlights (600+ students reached).

### Media — Blog `/blog` + Gallery `/gallery`
- Blog post list + article pages; image gallery. Both published via Sanity.

### Get Involved `/get-involved`
- Intro, then: Become a Mentor · Apply as a Mentee · Volunteer Roles · Support a Student.
- The first three open application forms; "Support a Student" is a **placeholder** for now.

### Contact `/contact`
- Get in Touch (enquiry emails + socials) and a contact form.

### FAQ `/faq`
- Common questions as an accordion — eligibility for mentorship, joining the
  professional community, school partnerships, NGO registration status.

---

## Applications & forms (high level)

Applications are a **recurring process**, not one-off forms — so we treat them as
a lightweight pipeline:

- **Who applies:** mentee = *tertiary students* (usually 18+, but **can be under
  18 in Nigeria**); mentor and volunteer = professionals; contact = general.
  **RISE Foundations (secondary school) has no apply flow** — it's school outreach.
  So the mentee form is the only route that may capture a minor (handled at
  onboarding, not at apply time — see below).
- **Native, on-brand forms** for contact, mentor, mentee and volunteer.
- **One canonical apply page per role** — `/get-involved/mentor` and
  `/get-involved/mentee`. *Every* entry point (nav, home footer band, Get Involved,
  the RISE Horizons section on TOP) routes to the same page — no separate "broad" vs
  "TOP" forms. Use **dedicated pages, not modals** (the mentee essay, mobile/low-
  bandwidth, shareable URLs, accessibility); reserve modals for tiny actions like
  "notify me". An optional `?from=` tag attributes the entry point — **stored
  server-side as a column on the submission, not a tracking cookie** (keeps the
  cookieless stance). The home footer band's three items route to the **specific**
  destinations (mentee page, mentor page, Support-a-Student placeholder) — not the generic hub.
- **Volunteer & contact are always-on**, not cycle-gated: **contact** is an inline
  form on `/contact`; **volunteer** is a "register interest" form on Get Involved.
  Only the **mentor/mentee apply pages** are cycle-gated.
- **Mentee = RISE Horizons (tertiary) only**, so "apply broadly" and "apply under
  TOP" converge on the same page. **Mentor** is also one form — *who* they mentor is
  an **audience-preference field** (tertiary students / early-career professionals /
  open to either; **secondary/minors excluded** from self-serve mentoring) plus
  **field of expertise** and **availability**; the team does the actual matching.
- **Application cycles** — intake opens and closes periodically (a row the team
  flips, not a deploy). The apply page is **cycle-gated**: open → form; closed →
  "applications closed + notify me". So a click always goes to the apply page, which
  shows whatever is true right now.
- **Durable, secured records** — submissions are written **server-side** (Route
  Handler / Server Action) with Row-Level Security; keys stay server-only.
  Notifications go to **Tobi's personal email for now** (branded inboxes at full launch).
- **Spam-hardened** — honeypot + Cloudflare Turnstile + rate limiting + server-side validation.
- **Review** — for the first cycle, in the **Supabase dashboard**. A branded
  `/admin` (status tracking, notes, decision emails) is the **last** milestone — built only as time allows.
- **Donations** — "Support a Student" is a placeholder button in v1; real payment
  (Paystack / Flutterwave — better than Stripe for Nigerian payouts) comes later.

## Compliance, privacy & hardening

- **Privacy policy page + consent checkbox** at point of collection (Nigeria Data
  Protection Act 2023). The **mentee form captures date of birth** (no consent UI on
  the form); any applicant who is **both under 18 and accepted** gets a guardian
  sign-off **at onboarding** (offline, before mentor matching) — handled by the team,
  not the form. All other forms collect adult data only. The **privacy policy must
  disclose** how a minor applicant's data is handled and that guardian consent is
  obtained before any matching (the mechanism can be offline; the disclosure can't).
- **Cookieless analytics** (Plausible or Vercel Analytics) → no cookie-consent banner.
- **Supabase region: EU** (Frankfurt/London) for lower latency to Nigeria.
- **Mobile / low-bandwidth first** — mid-range Android on patchy data is the primary
  case: aggressive image optimization (`next/image` + Sanity transforms), tight JS,
  lazy-loaded gallery, test on throttled 3G.
- **Designed empty & error states** — blog/gallery launch empty; plus 404, form
  failure, "cycle closed", global error boundary.
- **Accessibility** — required alt text on gallery images, focus states, keyboard
  FAQ accordion, form labels/errors; enforce "gold never as body text" (contrast).
- **Backups** of applicant data (scheduled export) before real applications arrive —
  it's now the only copy of a submission, so confirm this is in place before the first
  live form.
- **Data retention** — define how long applicant submissions and the "notify-me" list
  are kept, plus a deletion path (most important for any under-18 applicant not progressed).
- **No outbound applicant email in v1** — keep this dependency explicit: the
  personal-email-for-notifications decision holds *only* while no mail is sent **to**
  applicants. Any applicant-facing email must wait for the branded domain (SPF/DKIM).

---

## Milestones (to end of June)

- [x] **1. Foundation** — Next.js + Tailwind themed to the design system; fonts via
   `next/font/google`; nav, footer, shared UI. **Deploy a near-empty site to Vercel
   early** to de-risk hosting/config (on a Vercel/temporary URL — real domain later).
   - [x] Next.js (App Router) + TypeScript + Tailwind v4, themed from the design-system tokens
   - [x] Sora + Plus Jakarta Sans self-hosted via `next/font/google`
   - [x] Shared UI: Nav (sticky/blur, mobile menu), Footer, Button, Container, Eyebrow, Logo, ImagePlaceholder
   - [x] Unit tests (Vitest + RTL) and a GitHub Actions CI (lint · typecheck · test · build)
   - [x] Deployed to Vercel — live at https://rise-ruby-three.vercel.app/ (production)
- [x] **2. Core pages** — Home, About, Team, Projects, Get Involved, Contact, FAQ with
   real content, **SEO baked in** (per-page metadata, OG, `sitemap.xml`, `robots.txt`).
   - [x] **Home** — real content, per-page metadata + OpenGraph, on-brand 404, real hero photo
   - [x] **About** — real content, per-page metadata (story, vision, objectives, values, name & identity)
   - [x] **Team** — full bios for all six members from `lib/team.ts`, per-page metadata
   - [x] **Projects** — index + `[slug]` detail from `lib/projects.ts` (The Oyo Project tiers; Foundations of Impact with the curated 2019 gallery + lightbox); Home/Footer deep-link to tier anchors
   - [x] **Get Involved** — hub (mentor, mentee, volunteer, support-a-student) + mentor/mentee application pages; forms are UI-only (submission deferred to Milestone 4)
   - [x] **Contact** — details (emails + socials) + contact form UI (submission deferred); **FAQ** — `<details>` accordion + FAQ structured data
   - [x] `sitemap.xml` + `robots.txt` (driven by `siteConfig.url`)
- [x] **3. Media** — Blog on a filesystem content layer (`lib/content`, swap seam for
   Sanity): markdown posts (each may carry a cover plus any number of inline images),
   validated at build, with a designed empty state, per-post metadata/OpenGraph, and
   sitemap entries. The standalone gallery was dropped: programme updates are blog posts
   with their own photos, so a separate gallery was redundant.
- [x] **4. Forms** — native forms wired through server actions to a filesystem-backed
   store (`lib/db`, swap seam for Supabase) with validation, honeypot + rate-limit spam
   protection, cycle open/close (mentor/mentee pages go live or show "notify me"), and
   notifications recorded via `lib/notify` (swap seam for Resend → Tobi's email).
   Supabase / Resend / Turnstile swap in later behind `lib/db/index.ts` and
   `lib/notify/index.ts`.
- [x] **5. Privacy & polish** — privacy policy page (incl. the minor-applicant data
   disclosure under the Nigeria Data Protection Act 2023), required consent checkboxes on
   the data-collecting forms (validated server-side as a gate, not stored), cookieless
   Vercel Analytics, global error boundary, and baseline security headers. Consent on
   notify-me is a privacy-policy link rather than a checkbox.
- [x] **6. Full-launch prep (code-side)** — `siteConfig.url` is env-driven
   (`NEXT_PUBLIC_SITE_URL`) so the domain switch is one variable, and `docs/launch-checklist.md`
   captures every external step + one-line swap. Domain, branded inboxes, and email auth
   remain external steps (see the checklist; durable Supabase storage is the top blocker
   before forms are publicly linked).
- [x] **7. Branded `/admin`** — password-gated (`ADMIN_PASSWORD` + signed session cookie),
   zero-client-component review panel over the submission store: filterable list, detail
   with status + notes editing, cycle open/close toggles, and accept/decline decision
   emails. 404s entirely when unconfigured; all type/id input is validated against the
   union + a UUID pattern before any disk access.

---

## Verification

- Click through every page; confirm it looks right on mobile and desktop.
- Open/close a cycle and confirm the form switches between live and "notify me".
- Submit each form → confirm it's stored (Supabase) and a notification reaches
  Tobi's personal email.
- Review a submission in the **Supabase dashboard** (the v1 review path); confirm RLS
  blocks client/anon reads of the applications table.
- Publish a test blog post and gallery photo from `/studio` → appears live with no redeploy.
- *(When/if built)* in `/admin`: review an applicant, change status, send a decision
  email; confirm non-signed-in users are blocked.

---

## Still needed (non-blocking)

- Real domain + branded inbox addresses — **non-blocking**; using Tobi's personal
  email for notifications until we're ready to fully launch.
- Real photography (placeholders until supplied).
- CTA wording resolved: homepage is **learn-first** (Explore our programmes / Get
  involved); nav = "Join the Movement"; cohort-specific CTAs ("Apply for mentorship",
  "Join the next cohort") live at the apply points on Projects / Get Involved.
- *(Logo is covered — the design system ships the RISE mark, kept as a swappable
  component in case the in-progress redesign lands.)*

> A RISE-branded **HTML rendering** of this plan lives at `website-plan.html` in the
> repo root (open in a browser; milestones are tickable). This markdown file is the
> tracked source of truth — update it as decisions change.
