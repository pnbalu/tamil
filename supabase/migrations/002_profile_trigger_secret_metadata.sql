-- Trigger: create profile on signup, including secret question/answer from metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, secret_question, secret_answer_hash)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'secret_question',
    new.raw_user_meta_data->>'secret_answer_hash'
  );
  return new;
end;
$$;
