# KarnalCode

Notes, previous year papers, doubts and placement guidance for IT students across Karnal colleges. Students sign up with their college email, ask and answer doubts, share notes, papers and syllabi, and learn from verified seniors and placed alumni.

## Features

- **Doubts** – ask questions (with image attachments), post solutions, vote, and mark the accepted answer. Includes a leaderboard and doubt hours.
- **Notes** – upload and browse notes, and save the ones you want to keep.
- **Previous year papers** – find and share papers by course, semester and year.
- **Syllabus** – browse and contribute syllabi.
- **People and profiles** – public profiles with college, headline, bio, role and points. New users complete their profile after signing up.
- **Auth** – Supabase email authentication with a callback route.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- [Supabase](https://supabase.com) (auth, Postgres, storage) via `@supabase/supabase-js`
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- `pdfjs-dist` for file previews

> This project uses a Next.js version with breaking changes. See [AGENTS.md](AGENTS.md) and the docs in `node_modules/next/dist/docs/` before writing code.

## Getting started

### Prerequisites

- Node.js 20 or later
- A Supabase project

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill it in. Both values are in Supabase under **Project settings > API**.

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_KEY` | Your Supabase public (anon) key |

3. Apply the SQL in [supabase/](supabase/) using the Supabase SQL editor. `doubt-attachments.sql` adds the `attachments` column to `questions`. Attachments are stored in the `notes` storage bucket under `<user id>/doubts/`.

4. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/          Routes: ask, auth, complete-profile, doubts, login, notes,
                papers, people, profile, syllabus, plus the home page
  components/   Shared UI (header, footer, cards, forms, preview dialog)
  lib/          Supabase client and data access per feature, plus hooks
  providers/    React Query provider
supabase/       SQL to run in the Supabase SQL editor
```

## Deployment

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new). Set the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the project settings. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
