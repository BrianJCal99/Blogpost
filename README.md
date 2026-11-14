# BLOGPOST

A full-stack social blogging platform built with **React**, **Redux Toolkit**, **Bootstrap 5** and **Supabase**. People can write posts, tag them by topic, follow other writers, like, comment on and save posts, and get a personalised feed from the people they follow.

**Live demo:** [my-blogpost.vercel.app](https://my-blogpost.vercel.app/) · **Case study:** [brianjcaldera.com/projects/blogpost](https://brianjcaldera.com/projects/blogpost/)

![BLOGPOST web application](https://brianjcalderaportfolio.wordpress.com/wp-content/uploads/2025/05/blogpost_web.webp?w=1024)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3FCF8E?logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **Try it without signing up:** the live demo is filled with sample posts from three demo writers covering recipes, travel and fitness, so you can browse posts, tags and profiles straight away.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [AI features](#ai-features)
- [Backend and security](#backend-and-security)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [License](#license)

## Features

**Writing**
- Create, view and delete posts
- Tag posts by topic
- ✨ AI suggestions: one click drafts an abstract and tags from your post, which you can edit before publishing
- Detailed post pages
- Sign up and sign in with Supabase Auth; protected routes send signed-out visitors to the sign-in page

**Social**
- Follow and unfollow writers
- Followers and following lists
- Personalised feed of posts from people you follow
- Like, comment on and save posts

**Discovery**
- Browse all posts, users and tags
- Tag pages that group related posts
- Search across posts and users
- User profile pages

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 18, React Router 6 (Create React App) |
| State management | Redux Toolkit |
| UI | Bootstrap 5, React Bootstrap, Bootstrap Icons, Font Awesome |
| Notifications | react-hot-toast |
| Backend | Supabase (PostgreSQL database, authentication and Edge Functions) |
| AI | Google Gemini API (`@google/genai`), called from a Supabase Edge Function |
| Hosting | Vercel |

## AI features

On the new-post page, **✨ Suggest summary & tags** drafts a 1–2 sentence abstract and 3–5 tags from what you've written. The AI only suggests: it fills the Abstract and Tags fields, asks before replacing an abstract you already wrote, never duplicates tags you typed, and nothing is saved until you click **Post**.

**How it works**

```
React (NewPost.jsx) ──supabase.functions.invoke──▶ Edge Function: suggest-post-meta ──▶ Gemini API
        ▲                 (user's session token)      · checks the user is signed in          │
        └──────────── { abstract, tags } ◀──────────── · counts the daily limit (20/day)  ◀────┘
                                                       · sends title, text + existing tags
                                                       · validates and cleans the JSON reply
```

- **Structured output:** Gemini is called with a JSON schema (`{ abstract: string, tags: string[] }`), so the reply is machine-readable rather than free text. The function still validates it: non-empty abstract of at most 250 characters, at most 5 tags, each a single lowercase word.
- **Reuses existing tags:** the function sends the names in the `tag` table and asks the model to prefer them, which avoids near-duplicates like `#Food` / `#food` / `#Foods`. The `tag` table also enforces single lowercase words with a check constraint.
- **Key stays server-side:** Create React App bundles every `REACT_APP_` variable into public JavaScript, so the Gemini key is never given to the frontend. It lives only in Supabase secrets, read by the Edge Function.
- **Limits:** text must be at least 100 characters, each member gets 20 suggestions per day (UTC, tracked in `ai_suggestion_usage`), and errors come back as friendly messages (busy, too long, daily limit).

**Setup**

1. Create a Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Apply the migrations (including `ai_suggestion_usage`) to your project.
3. Set the secrets and deploy the function:

```bash
supabase link --project-ref <your-project-ref>
supabase secrets set GEMINI_API_KEY=<your-key> GEMINI_MODEL=gemini-3.6-flash
supabase functions deploy suggest-post-meta
```

`GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`.

## Backend and security

BLOGPOST has no custom server. The React app talks to Supabase directly through its JavaScript client, so the database itself decides who can read and write each table.

### Data model

| Table | What it stores |
|---|---|
| `user` | Each member's public profile (first name, last name and unique username), linked to their Supabase Auth account |
| `post` | Title, abstract, body, optional image and author |
| `tag`, `post_tag` | Topic tags and a join table linking posts to tags (many-to-many) |
| `follow` | Who follows whom (follower and followee) |
| `like`, `save`, `comment` | A member's likes, saved posts and comments, each linked to a user and a post |
| `ai_suggestion_usage` | How many AI suggestions each member has used per day (for the daily limit) |

### How the data is protected

- **Automatic profiles:** a database trigger on sign-up copies each new member's name and username into the `user` table. That function can't be called directly through the API.
- **Relational integrity:** foreign keys tie every post, like, save, comment and follow to real users and posts, and unique constraints prevent duplicate usernames and tag names. Deleting a post removes its likes, saves, comments and tags.
- **Row Level Security:** RLS is on for every table. Anyone can read posts and public profiles, but members can only create, edit or delete their own posts, comments, likes, saves, follows and profile, and only a post's author can tag it.
- **Private data:** email addresses are hidden from the public API with column-level privileges.
- **AI usage limit:** members can read their own suggestion count but can't change it; it only goes up through a database function the Edge Function calls.
- **Versioned migrations:** the full schema and security rules live as SQL files in [`supabase/migrations`](supabase/migrations), so database changes are reviewed alongside the code.

## Project structure

```
src/
├── App.js                  # Route definitions
├── index.js                # Entry point (Redux store, router, toaster)
├── ProtectedRoutes.js      # Auth guard for signed-in pages
├── components/             # Cards, comments, likes, tags, post settings, user lists
├── routes/                 # Pages: home, posts, post detail, feed, profiles, tags, search, sign-in
├── redux/                  # Redux store and user slice (auth thunks)
└── utils/supabase.js       # Supabase client
supabase/
├── functions/
│   └── suggest-post-meta/  # Edge Function: AI abstract and tag suggestions (Gemini)
├── migrations/             # Full schema, RLS, privacy and sign-up function rules
├── seed.sql                # Local development data (tags)
└── config.toml             # Local Supabase stack settings
```

## Getting started

### Prerequisites

- Node.js 16 or later
- A [Supabase](https://supabase.com/) project with the tables above

### Installation

```bash
git clone https://github.com/BrianJCal99/Blogpost.git
cd Blogpost
npm install
```

Create a `.env.local` file in the project root:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Then start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Local Supabase (optional)

With Docker running and the [Supabase CLI](https://supabase.com/docs/guides/cli) installed, you can run the whole backend locally. The migrations build the full schema and `seed.sql` adds sample tags:

```bash
supabase start                 # local database, auth and API on http://127.0.0.1:54321
supabase functions serve suggest-post-meta --env-file supabase/functions/.env
```

`supabase/functions/.env` (git-ignored) holds `GEMINI_API_KEY` and `GEMINI_MODEL` for local runs. Point the app at the local stack with `REACT_APP_SUPABASE_URL=http://127.0.0.1:54321` and the anon key from `supabase status`.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Create a production build in `build/` |

## License

Released under the [MIT License](LICENSE). © 2026 Brian Caldera.

Built by [Brian Caldera](https://brianjcaldera.com) · [GitHub](https://github.com/BrianJCal99) · [LinkedIn](https://www.linkedin.com/in/brianjcal/)
