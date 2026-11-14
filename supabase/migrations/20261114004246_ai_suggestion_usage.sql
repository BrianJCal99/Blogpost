-- BLOGPOST: per-user daily counter for AI "Suggest summary & tags" requests.
-- The suggest-post-meta Edge Function calls bump_ai_suggestion_usage() before
-- each Gemini call and refuses the request once the count passes its daily limit.
-- Days are counted in UTC. Nothing here changes existing tables.
--
-- DEPLOY ORDER: apply this BEFORE deploying the version of suggest-post-meta
-- that calls bump_ai_suggestion_usage(), or every suggestion request will fail.

begin;

create table public.ai_suggestion_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  count integer not null default 0 check (count >= 0),
  primary key (user_id, day)
);

alter table public.ai_suggestion_usage enable row level security;

-- Members can see their own usage. There are deliberately no insert/update/delete
-- policies: counts only change through bump_ai_suggestion_usage() below, so a
-- member can't reset their own counter.
create policy "Members can read their own AI usage" on public.ai_suggestion_usage
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Same grant pattern as the other tables; RLS decides what each role can do.
grant delete, insert, references, select, trigger, truncate, update
  on table public.ai_suggestion_usage to anon, authenticated, service_role;

-- Add one to the caller's count for today and return the new count.
-- SECURITY DEFINER so it can write past RLS; it only ever touches auth.uid()'s row.
create or replace function public.bump_ai_suggestion_usage()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_count integer;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.ai_suggestion_usage as u (user_id, day, count)
  values (uid, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = u.count + 1
  returning u.count into new_count;

  return new_count;
end;
$$;

revoke execute on function public.bump_ai_suggestion_usage() from public, anon;
grant execute on function public.bump_ai_suggestion_usage() to authenticated, service_role;

commit;
