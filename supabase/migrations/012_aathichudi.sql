-- Aathichudi (ஆத்திசூடி) by Avvaiyar: 109 single-line verses in Tamil alphabetical order
create table if not exists public.aathichudi (
  id smallint primary key,
  line_ta text not null,
  meaning_en text,
  explanation_en text,
  sort_order smallint not null default 0
);

create index if not exists idx_aathichudi_sort on public.aathichudi(sort_order);
alter table public.aathichudi enable row level security;
create policy "Anyone can read aathichudi"
  on public.aathichudi for select using (true);
