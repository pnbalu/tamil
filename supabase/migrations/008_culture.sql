-- Culture: categories (e.g. Festivals), items (e.g. Diwali), terms (Tamil/English pairs for quiz)
create table if not exists public.culture_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ta text,
  sort_order int default 0
);

create table if not exists public.culture_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.culture_categories(id) on delete cascade,
  slug text not null,
  name_en text not null,
  name_ta text,
  info_en text not null,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  sort_order int default 0,
  unique(category_id, slug)
);

create table if not exists public.culture_terms (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.culture_items(id) on delete cascade,
  term_ta text not null,
  term_en text not null,
  sort_order int default 0
);

create index if not exists idx_culture_items_category on public.culture_items(category_id);
create index if not exists idx_culture_items_level on public.culture_items(level);
create index if not exists idx_culture_terms_item on public.culture_terms(item_id);

alter table public.culture_categories enable row level security;
alter table public.culture_items enable row level security;
alter table public.culture_terms enable row level security;

create policy "Anyone can read culture_categories"
  on public.culture_categories for select using (true);
create policy "Anyone can read culture_items"
  on public.culture_items for select using (true);
create policy "Anyone can read culture_terms"
  on public.culture_terms for select using (true);

-- Random terms for an item (for building quiz in app). Optionally filter by level via item.
create or replace function public.get_culture_terms_for_item(p_item_id uuid, p_limit int default 20)
returns setof public.culture_terms
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.item_id, t.term_ta, t.term_en, t.sort_order
  from public.culture_terms t
  where t.item_id = p_item_id
  order by random()
  limit least(greatest(1, p_limit), 50);
$$;

-- Terms from other items (for wrong options in quiz)
create or replace function public.get_culture_terms_from_other_items(p_exclude_item_id uuid, p_limit int default 30)
returns setof public.culture_terms
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.item_id, t.term_ta, t.term_en, t.sort_order
  from public.culture_terms t
  where t.item_id != p_exclude_item_id
  order by random()
  limit least(greatest(1, p_limit), 100);
$$;
