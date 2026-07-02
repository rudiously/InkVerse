# InkVerse

**Write what you feel. Read what others lived.**

A full-stack community writing platform — a home for poems, stories, journals, letters,
essays, and every voice in between. Built with Node.js/Express, Supabase (PostgreSQL),
JWT authentication, and a React + Tailwind frontend.

---

## What's included

This is a real, runnable codebase (not a mockup) covering the core of the spec:

**Backend** (`/backend`)
- Express REST API, JWT access + refresh tokens (httpOnly refresh cookie), bcrypt password hashing
- Register / Login / Logout / Refresh / Email verification / Forgot & Reset password
- Chapters: create, edit, delete, draft/publish/archive, tags, categories, explore feed with search/filter/sort/pagination
- Comments with replies, likes, edit, delete, report
- Likes, bookmarks, follow/unfollow
- Notifications (like, comment, reply, follow)
- Community aggregates, global search, platform stats
- Admin routes: delete chapters, suspend users, feature stories, manage categories, review reports, dashboard
- Rate limiting, Helmet security headers, input validation, role-based access
- Full Postgres schema for every table in the spec (users, profiles, chapters, drafts/status,
  categories, tags, comments, replies, likes, bookmarks, followers, notifications, reports,
  reading history, views, achievements, writing challenges) with triggers to keep counters in sync

**Frontend** (`/frontend`)
- React 18 + Vite + Tailwind, warm cream/beige/gold design system matching the brief
- Pages: Home (hero, stats, featured, trending, categories, writers, challenge CTA), Explore
  (search + filters + sort + pagination), Write (rich text editor, autosave, draft/preview/publish),
  My Chapters (dashboard with stats, tabs, sort/search, edit/delete/archive/publish/share),
  Chapter Read (reading-optimized typography, progress bar, like/bookmark/share/follow, comments
  with replies/likes/report, related chapters), Profile, Community, Bookmarks, Notifications
- Full auth flow: Register, Login, Forgot Password, Reset Password, Verify Email
- Protected routes, JWT-aware API client with automatic token refresh

**What's scaffolded but intentionally minimal** (real endpoints + schema exist; build out the UI as needed):
- Admin dashboard UI (the API routes are complete — see `backend/src/routes/admin.routes.js`)
- Achievements & writing challenges (schema + basic list endpoint; award logic is a good next step)
- Image upload is URL-based (paste a link) rather than direct file upload — wire up Supabase
  Storage or S3 when you're ready
- The rich text editor is a dependency-free `contentEditable` implementation. For a more robust
  authoring experience, swap in [Tiptap](https://tiptap.dev) or [Slate](https://www.slatejs.org/)

---

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run `backend/database/schema.sql` — this creates every table,
   trigger, and seed data (default categories + starter achievements)
3. Grab your Project URL, `service_role` key, and `anon` key from Project Settings → API

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in your Supabase keys, JWT secrets, SMTP creds
npm install
npm run dev                # http://localhost:5000
```

Generate strong values for `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`, e.g.:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Without SMTP configured, verification/reset emails are logged to the console instead of sent —
handy for local development.

### 3. Frontend

```bash
cd frontend
cp .env.example .env       # points to your backend API
npm install
npm run dev                 # http://localhost:5173
```

### 4. Try it out
1. Register an account (check your terminal for the verification link if SMTP isn't set up)
2. Head to **Write**, draft a chapter, publish it
3. Browse **Explore**, like/bookmark/comment, follow the author
4. Check **My Chapters** for your dashboard stats

---

## Making yourself an admin

Admin routes require `role = 'admin'` on the `users` table. After registering, run in the
Supabase SQL editor:
```sql
update users set role = 'admin' where email = 'you@example.com';
```

---

## Deployment notes

- **Backend**: any Node host works (Render, Railway, Fly.io, a VPS). Set the env vars from
  `.env.example` in your host's dashboard.
- **Frontend**: `npm run build` produces a static `dist/` — deploy to Vercel, Netlify, or
  Supabase-hosted static hosting. Set `VITE_API_URL` to your deployed backend URL.
- **Database**: Supabase is already hosted — no separate deployment needed.
- This backend uses the Supabase **service role key** and enforces authorization in application
  code (see `middleware/auth.js`), so Row Level Security policies are optional here. If you'd
  rather rely on RLS as a second layer of defense, enable it per-table in Supabase and mirror
  the same rules (e.g. "users can only update their own chapters").

---

## Project structure

```
inkverse/
├── backend/
│   ├── src/
│   │   ├── config/        # Supabase client
│   │   ├── middleware/     # auth, rate limiting, error handling
│   │   ├── routes/         # Express routers
│   │   ├── controllers/    # route handlers / business logic
│   │   ├── utils/          # JWT, password hashing, email
│   │   └── server.js
│   ├── database/
│   │   └── schema.sql      # full Postgres schema + seed data
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # axios client with token refresh
    │   ├── context/         # AuthContext
    │   ├── components/      # Navbar, Footer, ChapterCard, RichTextEditor, etc.
    │   └── pages/            # Home, Explore, Write, MyChapters, ChapterRead, Profile, ...
    └── .env.example
```

Copyright © 2026 InkVerse
