# Full-launch checklist

Code-side preparation is done; every item below is an external step (account,
domain, or key provisioning) plus the one-line code swap it unlocks. Until
these land, the site runs fully on the Vercel URL with filesystem-backed
content and submissions.

## Content & accuracy review (human sign-off needed)

Page copy was drafted during the build and baked into code. The items below
were invented or synthesized and only RISE can confirm them — review before
the site is shared publicly.

- [ ] **Privacy policy retention periods are placeholders.** `app/privacy/page.tsx`
      states "up to 24 months" for submissions and "up to 12 months" for the
      notify-me list. No real RISE policy informed these numbers — set the true
      figures (this is the concrete version of the data-retention item below).
- [ ] **Read the whole privacy policy.** It is AI-drafted and covers minors'
      data under the Nigeria Data Protection Act 2023; have someone with NDPA
      familiarity confirm it, especially the under-18 guardian-consent
      mechanism ("offline, in person at onboarding, before mentor matching").
- [ ] **Applicant decision-email copy** (`lib/actions/admin.ts`, `DECISION_COPY`):
      review the accept/decline wording before email sending is enabled.
- [ ] **About page factual claim** (`components/about/OurStory.tsx`): verify
      "more than 600 students across three secondary schools in Oyo" (2019).
- [ ] **Home impact stats** (`components/home/ImpactStats.tsx`): confirm
      "10,000 — five-year goal", "3 tiers", "Since 2017" are accurate to publish.
- [ ] **Confirm program-design wording**: mentor availability options
      (monthly/fortnightly/flexible), audience options, the consent-checkbox
      sentence, the About mission statement, and British spelling as house style.

## ⚠️ Blockers before forms are publicly linked / a real cycle opens

These two are not cosmetic. On Vercel's serverless runtime the working
directory is read-only outside a per-instance, ephemeral `/tmp`, so the
filesystem-backed pieces below cannot safely run in production as-is.

- [ ] **Durable submission storage (top blocker).** The contact, mentor,
      mentee, volunteer, and notify-me forms appear functional in production
      but a real submission will error or be lost on the next cold start.
      Wire `createSupabaseSubmissionStore()` behind `lib/db/index.ts` (one-line
      swap) BEFORE linking the forms publicly. Mentor/mentee cycles default to
      closed (`open: false`), so keep them closed until this lands; do not
      surface the contact form publicly until then either.
- [ ] **Effective login throttle.** `lib/rate-limit.ts` is an in-memory,
      per-instance map that resets on every cold start, so the admin-login
      brute-force limit is weak in production. Until the limiter moves to a
      shared store (Supabase / Vercel KV / Upstash), rely on a high-entropy
      `ADMIN_PASSWORD` (it is the entire auth surface and the session-signing
      key is derived from it).

## Domain

- [ ] Purchase the real domain and add it to the Vercel project.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://<real-domain>` in Vercel project env
      (production). `lib/site.ts` reads it; canonical URLs, OpenGraph,
      `sitemap.xml`, and `robots.txt` all follow automatically.
- [ ] After the switch, re-verify `https://<real-domain>/sitemap.xml` and
      `robots.txt`, and submit the sitemap in Google Search Console.

## Branded inboxes and email

- [ ] Create branded inboxes (hello@, partnerships@, mentorship@, media@) on
      the real domain with Sender Policy Framework (SPF) and DomainKeys
      Identified Mail (DKIM) configured.
- [ ] Replace the placeholder `@rise.org` addresses in `lib/site.ts`
      (`contactEmails`) — currently kept as visible placeholders by owner
      decision (2026-06-11).
- [ ] Provision a Resend API key and implement `createResendNotifier()`
      behind the seam in `lib/notify/index.ts` (one-line swap). Set
      `RISE_NOTIFY_EMAIL` to the monitored inbox.
- [ ] Only after SPF/DKIM are live: enable applicant-facing decision emails
      (until then, no outbound email to applicants — v1 constraint).

## Durable storage (required before real applications open)

- [ ] Provision Supabase (EU region: Frankfurt or London) and implement
      `createSupabaseSubmissionStore()` behind the seam in `lib/db/index.ts`
      (one-line swap). The Vercel filesystem is ephemeral, so the filesystem
      store must not take real applications in production.
- [ ] Configure Row-Level Security so anonymous/client reads of submissions
      are blocked; keys stay server-side only.
- [ ] Set up a scheduled export/backup of applicant data before the first
      live cycle opens.
- [ ] Confirm the data-retention policy and the deletion path for
      under-18 applicants who do not progress.

## Content publishing (optional swap)

- [ ] If the team outgrows publish-by-pull-request, provision Sanity and
      implement `createSanityContentSource()` behind the seam in
      `lib/content/index.ts` (one-line swap); add the Sanity image host to
      `next.config.ts` `images.remotePatterns`.

## Admin

- [ ] Set `ADMIN_PASSWORD` in Vercel project env to enable `/admin`
      (it is hidden and returns 404 when unset).

## Payments (deferred)

- [ ] "Support a student" stays a placeholder until a Paystack or
      Flutterwave integration is scoped.
