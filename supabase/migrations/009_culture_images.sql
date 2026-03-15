-- Optional image URL for culture categories and items (for list/cards)
alter table public.culture_categories
  add column if not exists image_url text;

alter table public.culture_items
  add column if not exists image_url text;
