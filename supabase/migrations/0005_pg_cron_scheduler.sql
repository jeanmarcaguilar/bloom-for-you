-- Migration: 0005_pg_cron_scheduler
-- Uses Supabase's built-in pg_cron + pg_net extensions to call the
-- /api/cron/send-scheduled endpoint every minute for free.
--
-- HOW TO APPLY:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste this entire file and run it
--   3. Replace YOUR_SITE_URL with your real Vercel URL (e.g. https://bloom-for-you.vercel.app)
--   4. Replace YOUR_CRON_SECRET with the value of your CRON_SECRET env var
--
-- To verify it's working:
--   SELECT * FROM cron.job;
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Enable required extensions (already on in most Supabase projects)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove old job if re-running this migration
select cron.unschedule('bloom-send-scheduled-emails')
  where exists (select 1 from cron.job where jobname = 'bloom-send-scheduled-emails');

-- Schedule the job: every minute, POST to our Next.js cron route
select cron.schedule(
  'bloom-send-scheduled-emails',   -- job name
  '* * * * *',                      -- every minute
  $$
    select net.http_post(
      url     := 'YOUR_SITE_URL/api/cron/send-scheduled',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_CRON_SECRET',
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    )
  $$
);
