-- create_user_on_signup() should only run as the trigger on auth.users,
-- never as an API call (/rest/v1/rpc/create_user_on_signup).
-- Trigger execution does not check EXECUTE, so sign-up keeps working.
revoke execute on function public.create_user_on_signup() from public, anon, authenticated;