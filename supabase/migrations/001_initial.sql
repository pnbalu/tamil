-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  learning_goal text,
  level text,
  daily_goal_minutes int default 10,
  reminder_enabled boolean default true,
  reminder_time text default '08:00',
  secret_question text,
  secret_answer_hash text,
  streak_days int default 0,
  total_xp int default 0,
  last_activity_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Return secret question for forgot-password flow (by email, no other data)
create or replace function public.get_secret_question_for_reset(user_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object('secret_question', secret_question)
  into result
  from profiles
  where email = user_email
  limit 1;
  return coalesce(result, json_build_object('secret_question', null));
end;
$$;

grant execute on function public.get_secret_question_for_reset(text) to anon;
grant execute on function public.get_secret_question_for_reset(text) to authenticated;

-- Lesson categories (seed)
create table if not exists public.lesson_categories (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title_en text not null,
  title_ta text,
  icon text,
  sort_order int default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.lesson_categories(id) on delete cascade,
  title_en text not null,
  title_ta text,
  duration_min int default 5,
  xp_reward int default 20,
  sort_order int default 0
);

create table if not exists public.user_lesson_progress (
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  completed boolean default false,
  progress_percent int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_categories enable row level security;
alter table public.lessons enable row level security;
alter table public.user_lesson_progress enable row level security;

create policy "Anyone can read categories and lessons"
  on public.lesson_categories for select using (true);
create policy "Anyone can read lessons"
  on public.lessons for select using (true);

create policy "Users can read own progress"
  on public.user_lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on public.user_lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on public.user_lesson_progress for update using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed categories and lessons
insert into public.lesson_categories (key, title_en, title_ta, icon, sort_order) values
  ('alphabet', 'Alphabet', 'அகராதி', '🔤', 1),
  ('numbers', 'Numbers', 'எண்கள்', '🔢', 2),
  ('family', 'Family', 'குடும்பம்', '👨‍👩‍👧', 3),
  ('food', 'Food', 'உணவு', '🍛', 4)
on conflict (key) do nothing;

insert into public.lessons (category_id, title_en, title_ta, duration_min, xp_reward, sort_order)
select id, 'Vowels', 'உயிர் எழுத்துகள்', 8, 20, 1 from public.lesson_categories where key = 'alphabet'
union all select id, 'Consonants', 'மெய் எழுத்துகள்', 10, 25, 2 from public.lesson_categories where key = 'alphabet'
union all select id, 'Numbers 1-10', 'எண்கள் 1-10', 5, 15, 1 from public.lesson_categories where key = 'numbers'
union all select id, 'Family terms', 'குடும்பச் சொற்கள்', 6, 20, 1 from public.lesson_categories where key = 'family'
union all select id, 'Food words', 'உணவுச் சொற்கள்', 6, 20, 1 from public.lesson_categories where key = 'food';
