# Supabase setup

The app uses a direct Postgres connection (via Drizzle ORM) for the submission
store **only when `DATABASE_URL` is set**; without it the app falls back to the
local filesystem store. Adding Supabase is a provisioning + configuration step
plus running the Drizzle migration once.

The app connects straight to Postgres over Supabase's connection pooler, so the
Supabase Data API (PostgREST) and the service-role key are no longer used.

## What you need

1. A Supabase account (free tier is fine to start): https://supabase.com
2. A new Supabase **project**, created in an **EU region** (Frankfurt or London)
   for lower latency to Nigeria.
3. The connection strings (Project → Settings → Database):
   - **`DATABASE_URL`**: the **Connection pooling → Transaction** string
     (port **6543**). This is what the running app uses.
   - **`DIRECT_URL`** (optional): the **direct/session** connection string
     (port **5432**), used only by `drizzle-kit` to run migrations.

## Steps

1. **Create the project** in an EU region. Wait for it to finish provisioning.
2. **Add the connection strings locally** (to `.env.local`, git-ignored):
   ```
   DATABASE_URL=postgresql://postgres.<ref>:<password>@<host>:6543/postgres
   DIRECT_URL=postgresql://postgres.<ref>:<password>@<host>:5432/postgres
   ```
3. **Apply the schema.** Drizzle owns the schema (`lib/db/schema.ts`) and the
   migrations under `drizzle/`. Run:
   ```
   npm run db:migrate
   ```
   This creates the `submissions`, detail, `cycles`, `notify_me`, and
   `notifications` tables, the enums, the per-type status check, the cycles
   no-overlap exclusion constraint (`btree_gist`), and enables Row-Level
   Security on every table. Restart `npm run dev`; the app now reads/writes
   Postgres instead of `data/`.
4. **Add `DATABASE_URL` in Vercel** (Project → Settings → Environment Variables,
   for Production and Preview), then redeploy. `DIRECT_URL` is only needed
   wherever you run migrations. Production now persists to Postgres.
5. **Disable the Data API (optional, recommended).** Since the app connects
   directly to Postgres, the Supabase Data API (PostgREST) can be disabled in
   the project settings. RLS stays enabled as defense in depth.

## Verifying

- Submit the contact form, then check **Table Editor → submissions** in Supabase
  for the new row.
- Open `/admin`, change a status or toggle a cycle, and confirm the row updates.
- With RLS enabled and no policies, any anon/public access path (the Data API)
  returns no rows. The app is unaffected because it connects directly to
  Postgres, which bypasses RLS.

## Security notes

- The direct connection string (`DATABASE_URL`) grants full database access and
  must never reach the browser. It is only read in `lib/db/client.ts`, which is
  `server-only`, and it is never prefixed with `NEXT_PUBLIC_`.
- The transaction pooler requires prepared statements to be disabled; the client
  sets `{ prepare: false }`.
- RLS is enabled on every table with **no policies**, denying all anon/public
  access through the Data API. Direct connections (the app's path) bypass RLS.
- Before the first real application cycle: set up a **scheduled backup/export**
  of the `submissions` table, and confirm the data-retention and deletion
  process (especially for any under-18 applicant) per the privacy policy.

## What this does not change

- Notifications are recorded to the `notifications` table (and still to the
  filesystem when `DATABASE_URL` is unset), but no email is sent until Resend
  is wired behind `lib/notify/index.ts`.
- The login rate limiter is still in-memory/per-instance; move it to a shared
  store when traffic warrants (see the launch checklist).
