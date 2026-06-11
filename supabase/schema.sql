-- RISE Initiative — submission store schema.
--
-- Run this once in the Supabase SQL editor (or via the Supabase CLI) on a new
-- project. The application connects with the service-role key, which bypasses
-- Row-Level Security; RLS is enabled with no policies so the anon/public key
-- can neither read nor write these tables. Keep the service-role key
-- server-side only (never in NEXT_PUBLIC_* or the client bundle).

create extension if not exists "pgcrypto";

-- Form submissions (contact, mentor, mentee, volunteer).
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('contact','mentor','mentee','volunteer')),
  payload     jsonb not null,
  status      text not null default 'new'
                check (status in ('new','in_review','accepted','declined','archived')),
  notes       text not null default '',
  from_ref    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists submissions_type_created_idx
  on public.submissions (type, created_at desc);
create index if not exists submissions_status_idx
  on public.submissions (status);

-- Application cycles: one row per role, flipped open/closed by the admin.
create table if not exists public.cycles (
  role        text primary key check (role in ('mentor','mentee')),
  open        boolean not null default false,
  updated_at  timestamptz
);

-- Notify-me signups captured while a cycle is closed.
create table if not exists public.notify_me (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('mentor','mentee')),
  email       text not null,
  created_at  timestamptz not null default now(),
  unique (role, email)
);

-- Lock every table down. With RLS on and no policies, only the service-role
-- key (which bypasses RLS) can touch these rows.
alter table public.submissions enable row level security;
alter table public.cycles      enable row level security;
alter table public.notify_me   enable row level security;
