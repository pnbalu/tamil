-- Optional example and story (English + Tamil) for richer kural detail
alter table public.thirukural
  add column if not exists example_en text,
  add column if not exists example_ta text,
  add column if not exists story_en text,
  add column if not exists story_ta text;
