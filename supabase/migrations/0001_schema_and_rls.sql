-- Bloom for You: schema, roles, RLS, private storage. Apply to a clean Supabase project.
create extension if not exists pgcrypto;

-- ===== Profiles & roles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  role text not null default 'recipient' check (role in ('owner','recipient')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Exactly one owner, ever.
create unique index one_owner on public.profiles ((role)) where role = 'owner';

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'owner') $$;

create or replace function public.is_recipient() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'recipient') $$;

-- New auth users always start as 'recipient'. Owner is promoted manually (see README).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block privilege escalation: role is immutable for API users (auth.uid() not null).
create or replace function public.protect_role() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role cannot be changed';
  end if;
  new.updated_at = now();
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;
create policy profiles_read_self on public.profiles for select using (id = auth.uid() or public.is_owner());
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- no insert/delete policies: only the trigger and service role create/remove profiles

-- ===== Content tables =====
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references profiles(id) on delete cascade,
  recipient_display_name text not null default '' check (char_length(recipient_display_name) <= 80),
  nickname text check (char_length(nickname) <= 80),
  greeting text not null default 'Hello' check (char_length(greeting) <= 200),
  welcome_message text not null default '' check (char_length(welcome_message) <= 1000),
  footer_message text not null default 'Made with love, one little memory at a time.' check (char_length(footer_message) <= 300),
  theme_settings jsonb not null default '{}' check (jsonb_typeof(theme_settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flowers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  flower_type text not null check (flower_type in ('rose','tulip','sunflower','daisy','lily','cherry_blossom','lavender','custom')),
  color text not null default '#D96C91' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  message text not null default '' check (char_length(message) <= 5000),
  dedication text check (char_length(dedication) <= 300),
  flower_image_path text,
  event_date date,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bouquets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  gift_message text not null default '' check (char_length(gift_message) <= 5000),
  flower_items jsonb not null default '[]' check (jsonb_typeof(flower_items) = 'array' and jsonb_array_length(flower_items) <= 50),
  wrapping_color text not null default '#F5C9D7' check (wrapping_color ~ '^#[0-9A-Fa-f]{6}$'),
  ribbon_color text not null default '#9D174D' check (ribbon_color ~ '^#[0-9A-Fa-f]{6}$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,  -- doubles as scheduled time; visible once <= now()
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  preview text check (char_length(preview) <= 300),
  body text not null check (char_length(body) <= 20000),
  category text not null default 'just_because' check (char_length(category) <= 80),
  signature text check (char_length(signature) <= 80),
  image_path text, audio_path text, theme text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 10000),
  memory_date date,   -- owner-entered; never assumed
  location_description text check (char_length(location_description) <= 200),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  music_url text,
  is_featured boolean not null default false,
  featured_order int,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memory_media (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.surprises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  surprise_type text not null check (surprise_type in ('message','flower','bouquet','photo','audio','letter','custom')),
  intro text check (char_length(intro) <= 500),
  content text not null default '' check (char_length(content) <= 10000),
  media_path text,
  scheduled_at timestamptz,
  expires_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or scheduled_at is null or expires_at > scheduled_at)
);

create table public.surprise_views (
  id uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references surprises(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (surprise_id, recipient_id)
);

create index on flowers (status); create index on letters (status, scheduled_at);
create index on memories (status, memory_date); create index on memory_media (memory_id, display_order);
create index on surprises (status, scheduled_at, expires_at); create index on bouquets (status, published_at);

-- updated_at maintenance
create or replace function public.touch() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['site_settings','flowers','bouquets','letters','memories','surprises'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch()', t, t);
  end loop; end $$;

-- ===== RLS: owner full control; recipient reads only what is currently visible =====
do $$ declare t text; vis text; begin
  for t, vis in select * from (values
    ('flowers',   $v$status='published'$v$),
    ('bouquets',  $v$status='published' and (published_at is null or published_at <= now())$v$),
    ('letters',   $v$status='published' and (scheduled_at is null or scheduled_at <= now())$v$),
    ('memories',  $v$status='published'$v$),
    ('surprises', $v$status='published' and (scheduled_at is null or scheduled_at <= now()) and (expires_at is null or expires_at > now())$v$)
  ) as x(t, vis) loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (public.is_owner() and owner_id = auth.uid()) with check (public.is_owner() and owner_id = auth.uid())', t||'_owner', t);
    execute format('create policy %I on public.%I for select using (public.is_recipient() and (%s))', t||'_recipient_read', t, vis);
  end loop; end $$;

alter table public.site_settings enable row level security;
create policy settings_owner on public.site_settings for all
  using (public.is_owner() and owner_id = auth.uid()) with check (public.is_owner() and owner_id = auth.uid());
create policy settings_recipient_read on public.site_settings for select using (public.is_recipient());

alter table public.memory_media enable row level security;
create policy media_owner on public.memory_media for all
  using (public.is_owner() and exists (select 1 from memories m where m.id = memory_id and m.owner_id = auth.uid()))
  with check (public.is_owner() and exists (select 1 from memories m where m.id = memory_id and m.owner_id = auth.uid()));
create policy media_recipient_read on public.memory_media for select
  using (public.is_recipient() and exists (select 1 from memories m where m.id = memory_id and m.status = 'published'));

alter table public.surprise_views enable row level security;
create policy views_owner_read on public.surprise_views for select using (public.is_owner());
create policy views_recipient_insert on public.surprise_views for insert
  with check (public.is_recipient() and recipient_id = auth.uid()
    and exists (select 1 from surprises s where s.id = surprise_id and s.status='published'
      and (s.scheduled_at is null or s.scheduled_at <= now()) and (s.expires_at is null or s.expires_at > now())));
create policy views_recipient_read on public.surprise_views for select using (recipient_id = auth.uid());

-- ===== Private storage =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media','media', false, 10485760,
  array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg'])
on conflict (id) do update set public = false;

-- Recipient may read an object only if a currently-visible row references it.
create or replace function public.recipient_can_read_media(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_recipient() and (
    exists (select 1 from flowers   where flower_image_path = p and status='published')
 or exists (select 1 from letters   where (image_path = p or audio_path = p) and status='published' and (scheduled_at is null or scheduled_at <= now()))
 or exists (select 1 from memory_media mm join memories m on m.id = mm.memory_id where mm.storage_path = p and m.status='published')
 or exists (select 1 from surprises where media_path = p and status='published' and (scheduled_at is null or scheduled_at <= now()) and (expires_at is null or expires_at > now())))
$$;

create policy media_owner_all on storage.objects for all
  using (bucket_id = 'media' and public.is_owner()) with check (bucket_id = 'media' and public.is_owner());
create policy media_recipient_read on storage.objects for select
  using (bucket_id = 'media' and public.recipient_can_read_media(name));
