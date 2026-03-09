-- Group quiz: rooms with unique code, participants, invites by phone
create table if not exists public.quiz_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  creator_id uuid not null references auth.users(id) on delete cascade,
  quiz_type text not null default 'ta_to_en',
  level text not null default 'beginner',
  questions_count int not null check (questions_count >= 1 and questions_count <= 50),
  time_per_question_seconds int not null default 30,
  question_ids uuid[],
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'completed')),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

create index if not exists idx_quiz_rooms_code on public.quiz_rooms(code);
create index if not exists idx_quiz_rooms_creator on public.quiz_rooms(creator_id);
create index if not exists idx_quiz_rooms_status on public.quiz_rooms(status);

create table if not exists public.quiz_room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.quiz_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  score int,
  total_questions int,
  time_taken_seconds int,
  finished_at timestamptz,
  unique(room_id, user_id)
);

create index if not exists idx_quiz_room_participants_room on public.quiz_room_participants(room_id);

create table if not exists public.quiz_room_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.quiz_rooms(id) on delete cascade,
  phone_number text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  invited_at timestamptz default now()
);

create index if not exists idx_quiz_room_invites_room on public.quiz_room_invites(room_id);

alter table public.quiz_rooms enable row level security;
alter table public.quiz_room_participants enable row level security;
alter table public.quiz_room_invites enable row level security;

-- Rooms: creator can do anything; participants can select
create policy "Creator can manage own rooms"
  on public.quiz_rooms for all using (auth.uid() = creator_id);
create policy "Participants can read room"
  on public.quiz_rooms for select using (
    exists (select 1 from public.quiz_room_participants p where p.room_id = id and p.user_id = auth.uid())
  );

-- Helper: room ids where current user is creator or participant (avoids RLS recursion)
create or replace function public.get_room_ids_user_can_see_participants()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.quiz_rooms where creator_id = auth.uid()
  union
  select room_id from public.quiz_room_participants where user_id = auth.uid();
$$;

-- Participants: can read participants in rooms they created or joined; can insert self; can update own row
create policy "Anyone in room can read participants"
  on public.quiz_room_participants for select using (
    room_id in (select public.get_room_ids_user_can_see_participants())
  );
create policy "Users can join room"
  on public.quiz_room_participants for insert with check (auth.uid() = user_id);
create policy "Users can update own participant row"
  on public.quiz_room_participants for update using (auth.uid() = user_id);

-- Invites: creator can manage; participants can read for their room
create policy "Creator can manage room invites"
  on public.quiz_room_invites for all using (
    exists (select 1 from public.quiz_rooms r where r.id = room_id and r.creator_id = auth.uid())
  );
create policy "Participants can read room invites"
  on public.quiz_room_invites for select using (
    exists (select 1 from public.quiz_room_participants p where p.room_id = quiz_room_invites.room_id and p.user_id = auth.uid())
  );

-- Get room by code (for join flow)
create or replace function public.get_quiz_room_by_code(p_code text)
returns public.quiz_rooms
language sql
security definer
set search_path = public
stable
as $$
  select * from public.quiz_rooms where code = trim(p_code) and status = 'waiting' and expires_at > now() limit 1;
$$;

-- Get questions by ids (for group quiz run)
create or replace function public.get_quiz_questions_by_ids(p_ids uuid[])
returns setof public.quiz_questions
language sql
security definer
set search_path = public
stable
as $$
  select id, question_en, question_ta, options, correct_index, topic, level, created_at
  from public.quiz_questions
  where id = any(p_ids)
  order by array_position(p_ids, id);
$$;

-- Start quiz: creator only; assigns question_ids and sets status = in_progress
create or replace function public.start_quiz_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.quiz_rooms;
  v_ids uuid[];
begin
  select * into v_room from public.quiz_rooms where id = p_room_id and creator_id = auth.uid();
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Room not found or you are not the creator');
  end if;
  if v_room.status != 'waiting' then
    return jsonb_build_object('ok', false, 'error', 'Quiz already started or completed');
  end if;
  select array_agg(id order by ord)
  into v_ids
  from (
    select id, row_number() over () as ord
    from public.quiz_questions
    where level = v_room.level
    order by random()
    limit least(greatest(1, v_room.questions_count), 50)
  ) sub;
  if v_ids is null or array_length(v_ids, 1) < 1 then
    return jsonb_build_object('ok', false, 'error', 'No questions available for this level');
  end if;
  update public.quiz_rooms set question_ids = v_ids, status = 'in_progress' where id = p_room_id;
  return jsonb_build_object('ok', true, 'question_ids', v_ids);
end;
$$;
