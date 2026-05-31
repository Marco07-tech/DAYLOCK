# DayLock

Daily habit and gym routine tracker built with React, Vite, and Supabase.

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase project URL and anon key to `.env.local`.

3. In the [Supabase SQL Editor](https://supabase.com/dashboard), run the migration in `supabase/migrations/001_schema_and_rls.sql` (adds `task_completions`, `profiles.goal`, and Row Level Security).

4. Configure **Authentication → URL Configuration**:
   - Site URL: your app origin (e.g. `http://localhost:5173` or production URL)
   - Redirect URLs: `http://localhost:5173/auth/callback`, production `/auth/callback`

5. Enable **Google** under Authentication → Providers if using Google sign-in.

6. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |

## Deploy (Vercel)

1. Import the repository.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project environment variables.
3. `vercel.json` rewrites all routes to `index.html` for client-side routing.

## Security

- Never commit `.env` or `.env.local`.
- RLS policies in the migration restrict data to `auth.uid()`.
- Rotate keys if they are ever exposed in git history.
