-- Quiz rewards: store points per session and add XP to profile atomically

alter table public.quiz_sessions
  add column if not exists points_earned int not null default 0;

comment on column public.quiz_sessions.points_earned is 'XP awarded for this quiz (e.g. correct answers × points per correct).';

-- Atomic increment of profile XP (and update last activity for streaks)
create or replace function public.add_profile_xp(points int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if points is null or points <= 0 then return; end if;
  update public.profiles
  set
    total_xp = total_xp + points,
    last_activity_date = current_date,
    updated_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.add_profile_xp(int) to authenticated;
grant execute on function public.add_profile_xp(int) to anon;
