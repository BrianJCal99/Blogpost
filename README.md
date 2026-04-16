# Blogpost

A full-stack blogging platform built with React, Bootstrap 5, and Supabase. Users can create posts, follow other writers, interact via comments and likes, and browse content by tags.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State Management | Redux Toolkit |
| UI / Styling | Bootstrap 5, react-bootstrap, bootstrap-icons, FontAwesome |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| Notifications | react-hot-toast |

## Features

- **Authentication** — Sign up / sign in via Supabase Auth; protected routes redirect unauthenticated users
- **Posts** — Create, view, delete posts; posts are tagged and browsable
- **Feed** — Personalized feed of posts from followed users
- **Social** — Follow / unfollow users; view followers and following lists
- **Interactions** — Like and comment on posts; save posts for later
- **Discovery** — Browse all posts, users, and tags; full-text search across posts and users

## Getting Started

### Prerequisites

- Node.js ≥ 16
- A [Supabase](https://supabase.com) project with the required schema applied

### Installation

```bash
git clone https://github.com/BrianJCal99/blogpost.git
cd blogpost
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

```bash
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
npm test         # Run tests in watch mode
```

## Project Structure

```
src/
├── App.js                  # Route definitions
├── index.js                # App entry point (Redux, Router, Toaster)
├── ProtectedRoutes.js      # Auth guard component
├── components/             # Reusable UI components
│   ├── Card.jsx / CardLarge.jsx
│   ├── CommentSection.jsx
│   ├── LikeSection.jsx
│   ├── TagSection.jsx
│   ├── PostSettingsDropdown.jsx
│   ├── UserList.jsx
│   └── ...
├── routes/                 # Page-level components
│   ├── HomePage.jsx
│   ├── AllPostsPage.jsx
│   ├── DetailedPostViewPage.jsx
│   ├── UserFeedPage.jsx
│   ├── UserProfilePage.jsx
│   └── ...
├── redux/
│   └── features/user/userSlice.js   # Auth state & async thunks
└── utils/
    └── supabase.js         # Supabase client
```

## Database Schema

Core tables: `post`, `user`, `follow`, `save`, `comment`, `like`, `tag`, `post_tag`

All queries are made directly from components using the Supabase JS client — there is no separate API layer.

## License

MIT © [Brian Caldera](https://github.com/BrianJCal99)
