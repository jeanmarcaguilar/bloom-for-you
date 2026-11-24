-- Migration: 0004_scheduled_emails
-- Adds a job queue for emails that should be sent at a future scheduled_at time.
-- The cron route /api/cron/send-scheduled polls this table every minute.

create table public.scheduled_emails (
  id          uuid primary key default gen_random_uuid(),
  bouquet_id  uuid not null references public.bouquets(id) on delete cascade,
  sender_name text not null default '',
  scheduled_at timestamptz not null,
  sent_at      timestamptz,          -- null = pending, non-null = done
  error        text,                 -- last error message if any
  attempts     int not null default 0,
  created_at   timestamptz not null default now()
);

-- Index for the cron query: pending rows due to send
create index scheduled_emails_pending_idx
  on public.scheduled_emails (scheduled_at)
  where sent_at is null;

-- Only service role (cron route) may read/write this table
alter table public.scheduled_emails enable row level security;
-- No RLS policies: service role bypasses RLS automatically
-- (anon / authenticated users cannot read this table at all)
