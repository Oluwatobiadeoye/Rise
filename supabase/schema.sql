-- RISE Initiative — submission store schema (Class Table Inheritance).
--
-- Run this once in the Supabase SQL editor (or via the Supabase CLI) on a new
-- project. The application connects with the service-role key, which bypasses
-- Row-Level Security; RLS is enabled with no policies so the anon/public key
-- can neither read nor write these tables. Keep the service-role key
-- server-side only (never in NEXT_PUBLIC_* or the client bundle).

create extension if not exists "pgcrypto";

-- Closed value sets, enforced by the database. The status enum is the union of
-- both lifecycles; a per-type CHECK below restricts which values each type may
-- hold (applications are accepted/declined; enquiries are closed).
do $$ begin
  create type submission_status as enum
    ('pending','in_review','accepted','declined','closed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mentor_audience as enum ('tertiary','early-career','either');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mentor_availability as enum ('monthly','fortnightly','flexible');
exception when duplicate_object then null; end $$;

-- Application cycles: a scheduled open/close window per role. Whether a role
-- is "open" is derived from whether now() falls inside a cycle's window.
create table if not exists public.cycles (
  id         uuid primary key default gen_random_uuid(),
  role       text not null check (role in ('mentor','mentee')),
  label      text not null,
  open_at    timestamptz not null,
  close_at   timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cycles_window_valid check (close_at > open_at)
);

create index if not exists cycles_role_open_idx on public.cycles (role, open_at desc);

-- Two cycles for the same role must not have overlapping windows.
create extension if not exists btree_gist;
do $$ begin
  alter table public.cycles add constraint cycles_no_overlap
    exclude using gist (role with =, tstzrange(open_at, close_at) with &&);
exception when duplicate_object then null; end $$;

-- Supertype: shared fields for every submission. The admin inbox lists, sorts,
-- filters, and counts straight from this table with no joins.
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('contact','mentor','mentee','volunteer')),
  full_name   text not null,
  email       text not null,
  status      submission_status not null default 'pending',
  notes       text not null default '',
  from_ref    text,
  cycle_id    uuid references public.cycles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Applications are accepted/declined; enquiries are closed. Neither set
  -- includes the other's terminal states.
  constraint submissions_status_for_type check (
    (type in ('mentor','mentee')
       and status in ('pending','in_review','accepted','declined','archived'))
    or
    (type in ('contact','volunteer')
       and status in ('pending','in_review','closed','archived'))
  )
);

create index if not exists submissions_type_created_idx
  on public.submissions (type, created_at desc);
create index if not exists submissions_status_idx
  on public.submissions (status);

-- Subtypes: one detail table per submission type. The primary key is also a
-- foreign key to the supertype, enforcing a strict 1-to-1 and cascading deletes
-- (so erasing a submission removes its detail row — useful for data retention).
create table if not exists public.contact_submissions (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  role          text not null,
  message       text not null
);

create table if not exists public.mentor_submissions (
  submission_id       uuid primary key references public.submissions(id) on delete cascade,
  field_of_expertise  text not null,
  audience_preference mentor_audience not null,
  availability        mentor_availability not null,
  message             text
);

create table if not exists public.mentee_submissions (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  institution   text not null,
  date_of_birth date not null,
  essay         text not null
);

create table if not exists public.volunteer_submissions (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  interest_area text not null,
  message       text
);

-- Notify-me signups captured while a cycle is closed.
create table if not exists public.notify_me (
  id          uuid primary key default gen_random_uuid(),
  role        text not null check (role in ('mentor','mentee')),
  email       text not null,
  created_at  timestamptz not null default now(),
  unique (role, email)
);

-- Atomic create: inserts the supertype row and the matching detail row in one
-- transaction (a plpgsql function runs in a single transaction), so a failed
-- detail insert rolls the whole thing back — no orphaned base rows. Returns the
-- new submission id.
create or replace function public.create_submission(
  p_type        text,
  p_full_name   text,
  p_email       text,
  p_from_ref    text default null,
  p_cycle_id    uuid default null,
  p_contact_role     text default null,
  p_contact_message  text default null,
  p_mentor_field        text default null,
  p_mentor_audience     mentor_audience default null,
  p_mentor_availability mentor_availability default null,
  p_mentor_message      text default null,
  p_mentee_institution text default null,
  p_mentee_dob         date default null,
  p_mentee_essay       text default null,
  p_volunteer_interest text default null,
  p_volunteer_message  text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.submissions (type, full_name, email, from_ref, cycle_id)
    values (p_type, p_full_name, p_email, p_from_ref, p_cycle_id)
    returning id into new_id;

  if p_type = 'contact' then
    insert into public.contact_submissions (submission_id, role, message)
      values (new_id, p_contact_role, p_contact_message);
  elsif p_type = 'mentor' then
    insert into public.mentor_submissions
        (submission_id, field_of_expertise, audience_preference, availability, message)
      values (new_id, p_mentor_field, p_mentor_audience, p_mentor_availability, p_mentor_message);
  elsif p_type = 'mentee' then
    insert into public.mentee_submissions (submission_id, institution, date_of_birth, essay)
      values (new_id, p_mentee_institution, p_mentee_dob, p_mentee_essay);
  elsif p_type = 'volunteer' then
    insert into public.volunteer_submissions (submission_id, interest_area, message)
      values (new_id, p_volunteer_interest, p_volunteer_message);
  else
    raise exception 'unknown submission type %', p_type;
  end if;

  return new_id;
end;
$$;

-- Lock every table down. With RLS on and no policies, only the service-role
-- key (which bypasses RLS) can touch these rows.
alter table public.submissions           enable row level security;
alter table public.contact_submissions   enable row level security;
alter table public.mentor_submissions    enable row level security;
alter table public.mentee_submissions    enable row level security;
alter table public.volunteer_submissions enable row level security;
alter table public.cycles                enable row level security;
alter table public.notify_me             enable row level security;
