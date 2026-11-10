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
- [Backend and security](#backend-and-security)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [License](#license)

## Features

**Writing**
- Create, view and delete posts
- Tag posts by topic
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
| Backend | Supabase (PostgreSQL database and authentication) |
| Hosting | Vercel |

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

### How the data is protected

- **Automatic profiles:** a database trigger on sign-up copies each new member's name and username into the `user` table. That function can't be called directly through the API.
- **Relational integrity:** foreign keys tie every post, like, save, comment and follow to real users and posts, and unique constraints prevent duplicate usernames and tag names. Deleting a post removes its likes, saves, comments and tags.
- **Row Level Security:** RLS is on for every table. Anyone can read posts and public profiles, but members can only create, edit or delete their own posts, comments, likes, saves, follows and profile, and only a post's author can tag it.
- **Private data:** email addresses are hidden from the public API with column-level privileges.
- **Versioned migrations:** the security rules live as SQL files in [`supabase/migrations`](supabase/migrations), so database changes are reviewed alongside the code.

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
└── migrations/             # RLS, privacy and sign-up function rules
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

> **Note:** the migrations in `supabase/migrations` add the security rules on top of the existing tables. They don't create the tables themselves.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Create a production build in `build/` |

## License

Released under the [MIT License](LICENSE). © 2026 Brian Caldera.

Built by [Brian Caldera](https://brianjcaldera.com) · [GitHub](https://github.com/BrianJCal99) · [LinkedIn](https://www.linkedin.com/in/brianjcal/)
