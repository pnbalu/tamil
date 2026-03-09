-- Quiz sessions: store results for history / stats (optional for Smart Quiz)
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  questions_count int not null,
  correct_count int not null,
  time_per_question_seconds int,
  completed_at timestamptz default now()
);

alter table public.quiz_sessions enable row level security;

create policy "Users can read own quiz_sessions"
  on public.quiz_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own quiz_sessions"
  on public.quiz_sessions for insert with check (auth.uid() = user_id);

-- Optional: app config for which AI provider to use (override env in Edge Function)
create table if not exists public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.app_config enable row level security;
create policy "Anyone can read app_config"
  on public.app_config for select using (true);

insert into public.app_config (key, value) values
  ('quiz_ai_provider', 'openai')
on conflict (key) do update set value = excluded.value, updated_at = now();
