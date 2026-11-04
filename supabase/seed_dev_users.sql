-- DEV/TESTING ONLY. Not a migration. Run once in the Supabase SQL Editor AFTER 0001_schema_and_rls.sql.
-- Edit the emails/passwords below first, and never reuse these on a real deployment.
do $$
declare
  owner_email text := 'owner@bloom.test';
  owner_pass text := 'ChangeMe-Owner-1';
  rec_email text := 'recipient@bloom.test';
  rec_pass text := 'ChangeMe-Recipient-1';
  oid uuid := gen_random_uuid();
  rid uuid := gen_random_uuid();
  r record;
begin
  for r in select * from (values (oid, owner_email, owner_pass, 'Owner'), (rid, rec_email, rec_pass, 'Recipient')) as v(id, email, pass, name) loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new)
    values ('00000000-0000-0000-0000-000000000000', r.id, 'authenticated', 'authenticated', r.email,
      crypt(r.pass, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', r.name), now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), r.id, r.id::text, jsonb_build_object('sub', r.id::text, 'email', r.email, 'email_verified', true),
      'email', now(), now(), now());
  end loop;

  -- The signup trigger created both profiles as 'recipient'; promote the owner (allowed here: no API user).
  update public.profiles set role = 'owner' where id = oid;
  insert into public.site_settings (owner_id, recipient_display_name) values (oid, 'My Love');
end $$;

select p.role, u.email from public.profiles p join auth.users u on u.id = p.id;
