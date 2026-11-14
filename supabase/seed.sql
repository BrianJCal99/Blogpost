-- Local development seed: runs after migrations on `supabase db reset`.
-- Tag names mirror production (2026-11-14) so features like AI tag
-- suggestions can be tested against realistic data.

insert into public.tag (name) values
  ('apps'), ('australia'), ('baking'), ('beginners'), ('breakfast'),
  ('cardio'), ('desserts'), ('dinner'), ('europe'), ('fitness'),
  ('food'), ('hiking'), ('japan'), ('mobility'), ('motivation'),
  ('nutrition'), ('packing'), ('recipes'), ('recovery'), ('running'),
  ('soup'), ('technique'), ('thailand'), ('training'), ('trains'),
  ('travel'), ('traveltips'), ('vegetarian'), ('wellness')
on conflict (name) do nothing;
