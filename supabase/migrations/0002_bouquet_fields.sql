-- Adds the bouquet-creator fields. Existing RLS policies on public.bouquets already cover new columns.
alter table public.bouquets
  add column if not exists flower_type text not null default 'rose' check (flower_type in ('rose','tulip','sunflower','lily','carnation','mixed')),
  add column if not exists quantity int not null default 12 check (quantity in (6,12,18,24)),
  add column if not exists flower_color text not null default '#B3173E' check (flower_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column if not exists wrapping_style text not null default 'classic' check (wrapping_style in ('classic','korean','burlap','box','premium')),
  add column if not exists ribbon_style text not null default 'satin_red' check (ribbon_style in ('satin_red','satin_pink','satin_gold','satin_white','velvet_burgundy')),
  add column if not exists dedication text check (char_length(dedication) <= 300),
  add column if not exists event_date date;
