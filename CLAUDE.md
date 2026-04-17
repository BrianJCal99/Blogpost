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

**Authentication**: Supabase Auth handles sessions. On signup, a PostgreSQL trigger (`create_user_on_signup`) auto-inserts a row into `public.user` from auth metadata. Session state is loaded into Redux on app start via the `fetchUser()` thunk in `redux/features/user/userSlice.js`.

**Protected routes**: `ProtectedRoutes.js` wraps authenticated-only pages and redirects to `/signin` if the Redux `user` state is absent.

**State management**: Redux Toolkit is used only for authentication state. All other UI state (forms, modals, fetched data) lives in local component state.

## Database

Schema is deployed to Supabase cloud (project ref: `cawbvzlbpvgsrcjsnxcw`).

Core tables: `user`, `post`, `tag`, `post_tag`, `comment`, `like`, `follow`, `save`.

All tables have Row-Level Security (RLS) enabled. When adding new tables or policies, follow the existing grant pattern (`anon`, `authenticated`, `service_role`).

The Supabase MCP server is configured in `.mcp.json` — use it to inspect the live database, run migrations, and query data during development.
