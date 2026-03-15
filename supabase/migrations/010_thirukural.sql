-- Thirukural: 3 sections (பால்), 133 chapters (அதிகாரம்), 1330 couplets
-- Sections: Aram (அறம்), Porul (பொருள்), Inbam (இன்பம்)

create table if not exists public.thirukural_sections (
  id smallint primary key,
  name_en text not null,
  name_ta text,
  sort_order smallint not null default 0
);

create table if not exists public.thirukural_adhigaram (
  id smallint primary key,
  section_id smallint not null references public.thirukural_sections(id) on delete cascade,
  name_en text not null,
  name_ta text,
  sort_order smallint not null default 0
);

create table if not exists public.thirukural (
  id smallint primary key,
  adhigaram_id smallint not null references public.thirukural_adhigaram(id) on delete cascade,
  line1_ta text not null,
  line2_ta text not null,
  meaning_en text,
  explanation_en text,
  sort_order smallint not null default 0
);

create index if not exists idx_thirukural_adhigaram_section on public.thirukural_adhigaram(section_id);
create index if not exists idx_thirukural_adhigaram on public.thirukural(adhigaram_id);

alter table public.thirukural_sections enable row level security;
alter table public.thirukural_adhigaram enable row level security;
alter table public.thirukural enable row level security;

create policy "Anyone can read thirukural_sections"
  on public.thirukural_sections for select using (true);
create policy "Anyone can read thirukural_adhigaram"
  on public.thirukural_adhigaram for select using (true);
create policy "Anyone can read thirukural"
  on public.thirukural for select using (true);
