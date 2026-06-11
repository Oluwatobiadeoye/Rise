# Supabase setup

The app uses Supabase for the submission store **only when its keys are set**;
without them it falls back to the local filesystem store. So adding Supabase is
purely a provisioning + configuration step, no code change.

## What you need

1. A Supabase account (free tier is fine to start): https://supabase.com
2. A new Supabase **project**, created in an **EU region** (Frankfurt or London)
   for lower latency to Nigeria.
3. Two values from the project (Project Settings → API):
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **service_role key** (the secret one, not the `anon` key)

## Steps

1. **Create the project** in an EU region. Wait for it to finish provisioning.
2. **Create the tables + Row-Level Security.** Open the project's **SQL Editor**,
   paste the contents of `supabase/schema.sql`, and run it. This creates the
   `submissions`, `cycles`, and `notify_me` tables and enables RLS.
3. **Add the keys locally** (to `.env.local`, git-ignored):
   ```
   SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```
   Restart `npm run dev`. The app now reads/writes Supabase instead of `data/`.
4. **Add the keys in Vercel** (Project → Settings → Environment Variables, for
   Production and Preview). Redeploy. Production now persists to Supabase.

## Verifying

- Submit the contact form, then check **Table Editor → submissions** in Supabase
  for the new row.
- Open `/admin`, change a status or toggle a cycle, and confirm the row updates.
- Confirm the **anon** key cannot read the tables: with RLS enabled and no
  policies, a client-side query using the anon key returns no rows. The app is
  unaffected because it connects with the service-role key server-side.

## Security notes

- The **service_role key bypasses RLS** and must never reach the browser. It is
  only read in `lib/db/supabase.ts`, which is `server-only`, and it is never
  prefixed with `NEXT_PUBLIC_`.
- RLS is enabled on every table with **no policies**, which denies all
  anon/public access. This is the intended lock-down for a server-only data
  store (see the RLS explanation below).
- Before the first real application cycle: set up a **scheduled backup/export**
  of the `submissions` table, and confirm the data-retention and deletion
  process (especially for any under-18 applicant) per the privacy policy.

## What this does not change

- Notifications still write to the filesystem (`data/notifications/`) until
  Resend is wired behind `lib/notify/index.ts`.
- The login rate limiter is still in-memory/per-instance; move it to a shared
  store when traffic warrants (see the launch checklist).
