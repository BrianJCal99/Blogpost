-- BLOGPOST: stop members renaming tags, and keep tag names lowercase.
-- Nothing here changes or deletes any rows.
-- Runs as one transaction: if any statement fails, nothing is applied.
--
-- DEPLOY ORDER: ship the NewPost.jsx change (select-then-insert instead of upsert)
-- to production BEFORE applying this. The old upsert code needs the UPDATE policy,
-- so applying this first would break publishing posts that reuse an existing tag.

begin;

-- Any signed-in user could previously rename any tag (e.g. turn "food" into anything).
-- Tags are only ever created and read by the app, never edited.
drop policy if exists "allow authenticated users to update" on public.tag;

-- Tags are single lowercase words (letters and digits only, no hyphens or spaces),
-- enforced in the database too so a client can't skip the app's own cleanup.
-- All existing tags already follow this rule (checked 2026-11-14), so it is
-- validated against every row.
alter table public.tag
  add constraint tag_name_single_word
  check (name = lower(name) and name ~ '^[[:alnum:]]+$');

commit;
