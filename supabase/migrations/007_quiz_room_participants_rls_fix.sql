-- Fix infinite recursion in quiz_room_participants SELECT policy.
-- The old policy queried quiz_room_participants inside its own policy.

drop policy if exists "Anyone in room can read participants" on public.quiz_room_participants;

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

create policy "Anyone in room can read participants"
  on public.quiz_room_participants for select using (
    room_id in (select public.get_room_ids_user_can_see_participants())
  );
