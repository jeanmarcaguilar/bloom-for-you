-- Run in the SQL editor after creating an owner, a recipient, and a stranger user.
-- Replace the UUIDs. Each block should behave as the comment states.
begin;
set local role authenticated;

-- 1. Role escalation must fail:
select set_config('request.jwt.claims', '{"sub":"<RECIPIENT_UUID>"}', true);
update public.profiles set role='owner' where id='<RECIPIENT_UUID>';        -- expect ERROR

-- 2. Recipient cannot write content:
insert into public.flowers(owner_id,title,flower_type) values ('<OWNER_UUID>','x','rose'); -- expect ERROR (RLS)

-- 3. Recipient sees no drafts / future letters:
select count(*) from public.letters where status='draft' or scheduled_at > now();       -- expect 0

-- 4. Anonymous sees nothing:
reset role; set local role anon;
select count(*) from public.letters;                                                    -- expect 0
rollback;
