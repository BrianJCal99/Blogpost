-- BLOGPOST: tighten Row Level Security so members can only change their own data.
-- Reading stays public, exactly as today. Nothing here changes or deletes any rows.
-- Runs as one transaction: if any statement fails, nothing is applied.

begin;

-- ---------------------------------------------------------------------------
-- post: only the author can create, edit or delete their own posts
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.post;
drop policy if exists "allow authenticated users to update" on public.post;

create policy "Authors can create their own posts" on public.post
  for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Authors can update their own posts" on public.post
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

-- New: the app's "Delete post" button had no policy behind it, so deletes
-- silently removed nothing. Likes, saves, comments and tags on the post are
-- removed automatically by the existing ON DELETE CASCADE foreign keys.
create policy "Authors can delete their own posts" on public.post
  for delete to authenticated
  using (created_by = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- comment: comment only as yourself, edit only your own comments
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.comment;
drop policy if exists "allow authenticated users to update" on public.comment;

create policy "Members can comment as themselves" on public.comment
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Members can update their own comments" on public.comment
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- like: like only as yourself (the app never edits likes, so no update policy)
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public."like";
drop policy if exists "allow authenticated users to update" on public."like";

create policy "Members can like as themselves" on public."like"
  for insert to authenticated
  with check (user_id = (select auth.uid()));
-- (The existing delete policy already limits removal to the owner.)

-- ---------------------------------------------------------------------------
-- save: save only as yourself
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.save;

create policy "Members can save posts as themselves" on public.save
  for insert to authenticated
  with check (user_id = (select auth.uid()));
-- (The existing delete policy already limits removal to the owner.)

-- ---------------------------------------------------------------------------
-- follow: follow and unfollow only as yourself
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.follow;
drop policy if exists "Enable delete for authenticated users " on public.follow;

create policy "Members can follow as themselves" on public.follow
  for insert to authenticated
  with check (follower_id = (select auth.uid()));

create policy "Members can unfollow as themselves" on public.follow
  for delete to authenticated
  using (follower_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- post_tag: only a post's author can tag it (the app never edits these rows)
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public.post_tag;
drop policy if exists "allow authenticated users to update" on public.post_tag;

create policy "Authors can tag their own posts" on public.post_tag
  for insert to authenticated
  with check (
    exists (
      select 1 from public.post p
      where p.id = post_id and p.created_by = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- user (profiles): edit only your own profile
-- Profiles are created by the sign-up trigger, which bypasses RLS, so the
-- insert rule only matters for direct API calls.
-- ---------------------------------------------------------------------------
drop policy if exists "Enable insert for authenticated users only" on public."user";
drop policy if exists "Enable UPDATE for authenticated users" on public."user";

create policy "Members can create their own profile" on public."user"
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy "Members can update their own profile" on public."user"
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- tag: left as is. New posts create tags with an upsert, which needs the
-- existing insert and update policies for signed-in members.
-- ---------------------------------------------------------------------------

commit;