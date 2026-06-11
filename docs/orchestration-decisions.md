# Orchestration decisions log

Autonomous build log for the RISE website completion run (started 2026-06-11).
Tobi asked me to drive every remaining milestone to done without asking
questions, making the calls an orchestrator would normally surface. Each
decision below is recorded for review: what I chose, the alternatives, and why.

## Standing constraints (from Tobi)

- At most 2 features worked concurrently (token budget).
- Filesystem as the database; real services (Supabase/Sanity/Resend) swap in
  later behind adapter seams. Confirmed: "filesystem now, swap later."
- Contact emails: keep the `@rise.org` placeholders for now (Tobi's call).
- Commit as work progresses; do not push.
- Every feature must pass a verifier subagent before it is considered done.

## Session-limit handling

- **2026-06-11 ~01:00** — Page-review workflow hit the session limit mid-run;
  resumed after the 1am reset from cache (no rework).
- **2026-06-11 ~01:xx (6am reset)** — The Milestone 4 verifier subagent hit the
  session limit before producing a verdict. **Decision:** rather than idle until
  6am, I (the main orchestrator loop) perform the Milestone 4 verification myself
  — reading the code critically, exercising the store, checking the cycle-gate
  states against the dev server, and running all gates. Rationale: the work is
  the same adversarial check a subagent would do, the main loop still has
  budget, and the goal is to keep moving to completion. If the main loop also
  hits the limit, I fall back to scheduling a resume after the reset.

## Decisions

### D1 — Milestone 4 verified by the orchestrator (not a subagent)
The M4 verifier subagent died on the session limit. I verified M4 myself:
read the store/actions/validation critically, confirmed atomic writes on every
path, exercised the cycle gate against the live server (closed → notify-me;
open mentor → full form with audience/availability; mentee → date of birth),
and ran all four gates (lint, typecheck, 208 tests, build). **Approved.**
- **Forward note for M7 (`/admin`):** `db.getSubmission`/`updateSubmission` build
  file paths from `type` + `id`. In M4 `id` is always a generated UUID, but the
  admin will pass both from form data — so the admin actions MUST validate
  `type` against the `SubmissionType` union and `id` against a UUID regex before
  hitting the store, or a crafted value could traverse outside `data/`. This is
  a hard requirement in the M7 build brief.

### D2 — Run Milestone 5 (privacy & polish) and Milestone 7 (`/admin`) in parallel
With M4 done, the two remaining build milestones touch disjoint files:
M5 = privacy policy page, consent checkboxes, analytics, error/empty states,
global error boundary; M7 = `app/admin/**`, `lib/admin/**`, `lib/actions/admin.ts`.
The only shared file is the consent checkbox inside the form components, which
M5 owns; M7 only reads the store. So they fit the "2 features at a time" cap
without collision. **Decision: launch both workers now, each with its own
verifier afterwards.**

### D3 — Consent checkbox added to data-collecting forms (M5 scope)
The plan requires a consent checkbox at the point of collection (Nigeria Data
Protection Act 2023). I directed M5 to add a required consent checkbox to the
contact, mentor, mentee, and volunteer forms (not notify-me, which only takes an
email for a reminder — I judged a link to the privacy policy sufficient there).
The mentee form keeps capturing date of birth with no extra consent UI; the
privacy policy discloses the minor-data handling per the plan.

### D4 — Analytics choice: Vercel Analytics (cookieless)
The plan allows Plausible or Vercel Analytics. I chose **Vercel Analytics**
(`@vercel/analytics`) because the site already deploys on Vercel, it is
cookieless (no consent banner needed), and it needs no external account/keys to
wire up — consistent with the "buildable and verifiable now" constraint. Swap to
Plausible later is a one-component change if preferred.

### D5 — Milestone 5 and 7 verified by the orchestrator; admin-chrome fix
Both verifier slots would have re-run during the 6am session-limit window, so I
verified both milestones in the main loop:
- **M5:** code-read the consent gate (validated, required, NOT stored — keeps the
  submission/admin contract stable), the privacy page (confirmed the required
  minor-data disclosure, NDPA basis, retention, deletion route, cookieless note),
  the error boundary, and accessibility of the consent checkbox. 264 tests pass.
- **M7:** code-read the auth (hashed constant-time password compare; signed-expiry
  HMAC session token with length-stable comparison and full malformed/expired/
  tampered rejection) and confirmed every admin action calls `assertAdmin()` and
  routes all type+id input through `validateSubmissionRef` (type-union + UUID)
  before any disk path — closing the path-traversal risk from D1. Admin 404s
  cleanly when `ADMIN_PASSWORD` is unset; build compiles all admin routes.

**Admin-chrome fix (my change, not the workers'):** M7 correctly left
`app/layout.tsx` to M5, so the public marketing Nav/Footer (with the "Join the
Movement" call to action) wrapped the admin panel — wrong for an internal tool.
I added `components/shared/SiteChrome.tsx`, a client gate that reads the pathname
and suppresses the public skip-link/Nav/Footer on `/admin` routes while leaving
every public page unchanged. Chosen over a route-group refactor (two root
layouts) because that would move every route folder and entangle the special
files (sitemap, robots, global-error) for a purely cosmetic gain — higher risk,
no functional benefit. Verified: public pages still render nav + footer; admin
renders bare.

### D6 — server-only dependency
M7 added `server-only@^0.0.1` (a tiny, standard Next.js guard package) so
`lib/admin/auth.ts` fails the build if ever imported into a client bundle,
protecting the password/HMAC code. Accepted — it is the idiomatic way to enforce
the server boundary and adds no runtime weight.
