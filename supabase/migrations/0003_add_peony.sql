-- Allow 'peony' in bouquets table flower_type check constraint
alter table public.bouquets drop constraint if exists bouquets_flower_type_check;
alter table public.bouquets add constraint bouquets_flower_type_check
  check (flower_type in ('rose','tulip','sunflower','lily','carnation','peony','mixed'));

