-- Optional: distinguish quiz source for reports (smart quiz vs aathichudi)
alter table public.quiz_sessions
  add column if not exists quiz_type text default 'smart';

comment on column public.quiz_sessions.quiz_type is 'Source: smart (vocabulary), aathichudi (fill-in-blank verses).';
