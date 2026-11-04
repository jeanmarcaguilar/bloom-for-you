# Bloom for You: foundation (Phase 2)

Status: database, roles, RLS and private storage are written. Not yet applied or tested against a live Supabase project; the Next.js UI is the next phase.

## Setup
1. Create a Supabase project. Copy URL, anon key and service-role key into `.env.local` (see `.env.example`). The service-role key is server-only.
2. Apply `supabase/migrations/0001_schema_and_rls.sql` (SQL editor, or `supabase db push`).
3. Auth > Providers: enable Email/Password. **Disable public sign-ups** so only accounts you create exist.
4. Create two users in Auth > Users (owner, recipient).
5. Promote the owner once, in the SQL editor (the API cannot do this):
   `update public.profiles set role='owner' where id='<OWNER_UUID>';`
6. Run `supabase/tests_rls.sql` and confirm each expectation.

## Security model
- One owner (unique index). Role is immutable for API users (trigger).
- Recipient reads only published, already-scheduled, unexpired rows. Drafts are invisible at the database level.
- Storage bucket is private. Recipient reads a file only if a currently-visible row references it. Serve via short-lived signed URLs.
- Deleting a content row does not delete its storage file; the app should remove both (to be implemented in the admin actions).
- Scheduling is evaluated at query time (`scheduled_at <= now()`), so no background job is needed.

## Backup
Use Supabase daily backups (Pro) or `pg_dump`, and download the `media` bucket periodically.

## Phase 1 (app scaffold)
`npm install && cp .env.example .env.local && npm run dev`, then run `npm run typecheck`.
Implemented: Next.js 15 config with noindex/no-store headers, env validation, Supabase SSR clients, session-refreshing middleware (redirects anonymous users to /login), `requireUser`/`requireOwner` guards, login with a generic error message, sign-out, /home, /unauthorized, /admin overview.
Not verified: nothing here has been installed, built or run yet. Expect to fix small type or version issues on first `npm run typecheck`.
