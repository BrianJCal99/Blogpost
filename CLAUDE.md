# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All frontend commands run from `blogpost_web/`:

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build
npm test           # Run tests in watch mode
npm test -- --testPathPattern=<file>  # Run a single test file
```

SendGrid microservice (`blogpost_api/sendgrid/`):

```bash
npm start          # Express server on PORT (default 3001)
```

## Environment

Create `blogpost_web/.env.local`:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

**Direct-to-database**: The React frontend queries Supabase directly via the JS client (`src/utils/supabase.js`) — there is no custom REST API layer. Every component that reads or writes data imports the Supabase client and calls it inline.

**Authentication**: Supabase Auth handles sessions. On signup, a PostgreSQL trigger (`create_user_on_signup`) auto-inserts a row into `public.user` from auth metadata. Session state is loaded into Redux on app start via the `fetchUser()` thunk in `redux/features/user/userSlice.js`.

**Protected routes**: `ProtectedRoutes.js` wraps authenticated-only pages and redirects to `/signin` if the Redux `user` state is absent.

**State management**: Redux Toolkit is used only for authentication state. All other UI state (forms, modals, fetched data) lives in local component state.

**SendGrid microservice**: A standalone Express server in `blogpost_api/sendgrid/server.js` handles newsletter email sending. It is separate from the main app and not imported by the frontend — it must be running independently when newsletter features are used.

## Database

Schema lives in `blogpost_api/supabase/migrations/20241212121251_initial_migration.sql`.

Core tables: `user`, `post`, `tag`, `post_tag`, `comment`, `like`, `follow`, `save`.

All tables have Row-Level Security (RLS) enabled. When adding new tables or policies, follow the existing grant pattern (`anon`, `authenticated`, `service_role`).

The Supabase MCP server is configured in `.mcp.json` — use it to inspect the live database, run migrations, and query data during development.
