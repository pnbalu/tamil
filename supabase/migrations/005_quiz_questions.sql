-- Quiz question bank: no AI at runtime; questions are served from this table.
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_ta text,
  options jsonb not null,
  correct_index int not null check (correct_index >= 0 and correct_index <= 3),
  topic text default 'vocabulary',
  level text default 'beginner',
  created_at timestamptz default now()
);

create index if not exists idx_quiz_questions_level on public.quiz_questions(level);
create index if not exists idx_quiz_questions_topic on public.quiz_questions(topic);

alter table public.quiz_questions enable row level security;

-- Allow anyone to read (quiz is used with anon key; no auth required to start)
create policy "Anyone can read quiz_questions"
  on public.quiz_questions for select using (true);

-- Random questions for quiz (PostgREST has no ORDER BY random())
create or replace function public.get_random_quiz_questions(
  p_count int default 10,
  p_level text default 'beginner',
  p_topic text default null
)
returns setof public.quiz_questions
language sql
security definer
set search_path = public
stable
as $$
  select id, question_en, question_ta, options, correct_index, topic, level, created_at
  from public.quiz_questions
  where level = p_level
    and (p_topic is null or topic = p_topic)
  order by random()
  limit least(greatest(1, p_count), 50);
$$;
