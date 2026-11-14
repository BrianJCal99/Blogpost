-- Hide members' email addresses from the public API.
-- Profiles stay publicly readable, but only these columns can be selected.
-- Each member's own email is still available to the app through Supabase Auth.
revoke select on table public."user" from anon, authenticated;
grant select (id, created_at, first_name, last_name, user_name, unique_user_name)
  on table public."user" to anon, authenticated;