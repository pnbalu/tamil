-- Optional example and story (English + Tamil) for richer verse detail
alter table public.aathichudi
  add column if not exists example_en text,
  add column if not exists example_ta text,
  add column if not exists story_en text,
  add column if not exists story_ta text;
