# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start dev server (localhost:3000)
npm run build    # Production build
npm test         # Run tests in watch mode
```

## Environment

Requires `.env.local` with:
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

## Architecture

This is a Create React App (React 18) single-page application using Supabase as the backend (cloud-hosted Postgres + auth).

**Entry point:** `src/index.js` wraps the app in `BrowserRouter`, Redux `StoreProvider`, a sticky `Navbar`, `Footer`, and a global `Toaster` (react-hot-toast). `src/App.js` defines all routes.

**Routing:** React Router v6. Two categories:
- Public routes: `/signin`, `/signup`, `/posts`, `/users`, `/tags`, `/search`, `/feed`, `/post/:id`, `/user/:id`, `/tag/:id`, and follower/following pages
- Protected routes (`/newpost`, `/myprofile`, `/myprofile/:id/followers`, `/myprofile/:id/following`): wrapped in `ProtectedRoute`, which reads Redux auth state and redirects to `/signin` if unauthenticated

**Auth & state:** `src/redux/features/user/userSlice.js` manages auth via async thunks (`signUpUser`, `signInUser`, `signOutUser`, `fetchUser`) that call Supabase auth directly. The Redux store holds `{ user, status, error }`. `status` cycles through `idle → loading → succeeded/failed`.

**Database access:** All Supabase queries are made directly from components/pages using the client in `src/utils/supabase.js`. There is no API layer — components import `supabase` and query tables (`post`, `user`, `follow`, `save`, `comment`, `like`, `tag`) directly.

**Key Supabase tables (inferred from queries):** `post`, `user`, `follow`, `save`, `comment`, `like`, `tag`, `post_tag`

**Components vs Routes:**
- `src/routes/` — full page views (data-fetching, layout)
- `src/components/` — reusable UI pieces. Notable ones:
  - `PostSettingsDropdown` — delete/save/unsave/copy-link actions per post; only shows delete/hide to the post owner
  - `CommentSection`, `LikeSection`, `TagSection` — sub-sections rendered inside `DetailedPostViewPage`
  - `Card` / `CardLarge` — post preview vs full post display

**UI:** Bootstrap 5 + react-bootstrap for layout/components, bootstrap-icons (`bi-*`) for icons, FontAwesome also available.

**Notifications:** `react-hot-toast` used for all user feedback. Confirmation actions (e.g. delete) use a custom inline toast with Yes/No buttons.
