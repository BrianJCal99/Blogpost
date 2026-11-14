# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root:

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build
npm test           # Run tests in watch mode
npm test -- --testPathPattern=<file>  # Run a single test file
```

## Environment

Create `.env.local` in the repo root:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

**Direct-to-database**: The React frontend queries Supabase directly via the JS client (`src/utils/supabase.js`) — there is no custom REST API layer. Every component that reads or writes data imports the Supabase client and calls it inline.

**Edge Function (the one exception)**: `supabase/functions/suggest-post-meta` (Deno/TypeScript) powers the "✨ Suggest summary & tags" button in `NewPost.jsx`. It requires a signed-in user, bumps a per-user daily counter via `bump_ai_suggestion_usage()` (limit 20/day, table `ai_suggestion_usage`), calls Gemini with structured JSON output, and returns `{ abstract, tags }`. Secrets: `GEMINI_API_KEY` (required) and `GEMINI_MODEL` (optional, defaults to `gemini-3.6-flash`) are set with `supabase secrets set` in production and in the git-ignored `supabase/functions/.env` locally. Never put Gemini keys in a `REACT_APP_` variable: CRA bundles those into public JS.

**Authentication**: Supabase Auth handles sessions. On signup, a PostgreSQL trigger (`create_user_on_signup`) auto-inserts a row into `public.user` from auth metadata. Session state is loaded into Redux on app start via the `fetchUser()` thunk in `redux/features/user/userSlice.js`.

**Protected routes**: `ProtectedRoutes.js` wraps authenticated-only pages and redirects to `/signin` if the Redux `user` state is absent.

**State management**: Redux Toolkit is used only for authentication state. All other UI state (forms, modals, fetched data) lives in local component state.

## Database

Schema is deployed to Supabase cloud (project ref: `cawbvzlbpvgsrcjsnxcw`).

Core tables: `user`, `post`, `tag`, `post_tag`, `comment`, `like`, `follow`, `save`, plus `ai_suggestion_usage`.

Tag names must be single lowercase words (letters/digits only), enforced by a check constraint; the app splits typed tags on anything else.

All tables have Row-Level Security (RLS) enabled. When adding new tables or policies, follow the existing grant pattern (`anon`, `authenticated`, `service_role`).

The Supabase MCP server is configured in `.mcp.json` — use it to inspect the live database, run migrations, and query data during development.

**Migrations**: `supabase/migrations` holds the full schema, and each file's version prefix matches the live project's migration history (check with `supabase migration list`). Create new ones with `supabase migration new <name>` so the version is a full timestamp; don't use date-only prefixes like `20261109_`, which collide.

**Local stack**: `supabase start` (needs Docker) builds the schema from the migrations and loads `supabase/seed.sql`. Serve the function with `supabase functions serve suggest-post-meta --env-file supabase/functions/.env`.

**`build/` is tracked in git**: `npm run build` modifies tracked files. Restore them (`git restore build/ && git clean -fd build/`) rather than committing build output.
