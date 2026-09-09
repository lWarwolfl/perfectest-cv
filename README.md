# Perfectest CV

A full-featured resume builder: multi-template resumes and cover letters with live preview and pagination, a job-application tracker, AI assistance, and shareable public pages. Built with Next.js (App Router), TypeScript, Tailwind CSS 4, Drizzle ORM + PostgreSQL (Neon), better-auth, and ImageKit.

> Started from my own real-world coding experience — it doesn't claim to follow every best practice to the letter (AI was involved, and AI is sometimes inaccurate) — but it has been personally reviewed and led by me.

## Features

- **Resume editor** — sections (profile, work, education, skills, languages, projects, certificates, and more), drag-and-drop ordering, per-entry editing, rich-text descriptions, autosave.
- **24 resume templates** — a dedicated Templates gallery page (`/templates`). Each template is a complete one-page placeholder document: design **and** editable sample content (including a placeholder profile photo). "Use" creates a new resume with a random name derived from the template, prefilled with that design + content. The regular "New Resume" flow is unchanged.
- **Cover letters** — separate editor with its own design system, template presets, and copy-from-resume (details + design) support.
- **Live preview & print** — WYSIWYG A4/US-Letter preview with item-aware pagination; browser-print to PDF is sized exactly to the document.
- **Job tracker** — kanban board with custom columns, drag-and-drop cards, status history, attached resume/cover-letter versions, files and todos per card.
- **AI features** — bring-your-own OpenAI-compatible endpoint for ATS match, resume improvements, and cover-letter drafts.
- **Auth** — email/password with email verification and password reset (branded HTML mail), plus Google OAuth.
- **Sharing** — publish any resume or cover letter at a secret URL; share pages are public and unlisted.
- **Image uploads** — profile photos and letter images stored on ImageKit.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn-style UI components |
| State | Zustand (style/autosave stores), TanStack Query (server state) |
| DB | PostgreSQL via Drizzle ORM (Neon serverless Postgres) |
| Auth | better-auth (credentials + Google OAuth) |
| Mail | Nodemailer over SMTP (Gmail) |
| Images | ImageKit |
| Forms | react-hook-form + zod |

## Project structure

```
app/
  (main)/            # authed dashboard shell (sidebar layout)
    dashboard/       # overview: stats, charts, AI settings, FlowCV sync
    resumes/         # resume list (cards, duplicate, delete, share, print)
    templates/       # 24-template gallery -> creates prefilled resumes
    letters/         # cover letter list
    tracker/         # kanban job-application tracker
    ai/              # AI feature pages
  (editor)/
    resumes/[id]/    # full resume editor
    letters/[id]/    # full cover letter editor
  auth/              # signin, signup, verify-email, reset flows
  share/             # public resume/letter share pages
  api/auth/[...all]/ # better-auth route handler
components/
  ui/                # base UI primitives (button, dialog, select, ...)
  common/            # shared cards, dialogs, preview frame, pagination engine
  editor/            # editor sidebar, section cards, customize panels
  layout/            # sidebar / mobile nav
  dashboard/         # dashboard widgets
features/            # feature modules: types, defaults, hooks, schemas
  resume/            # templates.ts, defaults.ts, renderer, hooks
  letter/  auth/  share/  queries/  ai/
server/              # server actions per domain (resume, letter, tracker, ai, image, user)
drizzle/             # schema.ts + migrations
lib/                 # auth config, mail, fonts, print, utils
stores/              # zustand stores
```

## Getting started (local)

```bash
npm install
cp .env.example .env   # or create .env from the table below
npx drizzle-kit push   # create tables
npm run dev
```

### Environment variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `BETTER_AUTH_URL` | Your app's base URL (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Random secret for session signing (`openssl rand -base64 32`) |
| `IMAGEKIT_URL_ENDPOINT` / `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` | Image uploads |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Verification & password-reset email |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | "Sign in with Google" |
| `NEXT_PUBLIC_APP_URL` | Fallback base URL when not on Vercel (used for metadata) |

## Host it yourself with your own accounts

Everything below has a free tier. The app is a standard Next.js app — any host works, but Vercel is the zero-config path.

### 1. Database — Neon

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the pooled connection string (`...neon.tech/dbname?sslmode=require`).
3. Put it in `DATABASE_URL`. The client in `drizzle/index.ts` is already tuned for Neon's pooler (`prepare: false`, capped lifetime/idle).
4. Create the tables: `npx drizzle-kit push` (schema lives in `drizzle/schema.ts`).

### 2. Images — ImageKit

1. Sign up at [imagekit.io](https://imagekit.io), create an account (any name).
2. In the dashboard, copy the **URL endpoint**, **public key**, and **private key** into the three `IMAGEKIT_*` variables. The private key is used server-side for uploads/deletes (`server/image/uploadImage.action.ts`); uploads go to the `perfectest_cv/` folder by default.
3. Add `https://ik.imagekit.io/**` (or your own endpoint host) to `images.remotePatterns` in `next.config.ts` if you change it.

### 3. Email — Google SMTP

Gmail doesn't allow plain-password SMTP; use an App Password.

1. Enable 2-Step Verification on your Google account.
2. Create an App Password: Google Account → Security → 2-Step Verification → App passwords (16 characters).
3. Set:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=you@gmail.com
   SMTP_PASS=<16-char app password>
   ```
4. Verification and reset emails are sent from `SMTP_USER` with the app's branded template (`lib/auth/mail.ts`).

### 4. OAuth — Google

1. Go to [Google Cloud Console](https://console.cloud.google.com) → create/select a project.
2. APIs & Services → OAuth consent screen → External → fill in app name + your email; add yourself as a test user (or publish the app).
3. Credentials → Create credentials → OAuth client ID → **Web application**.
4. Authorized JavaScript origins: your app URL (e.g. `http://localhost:3000`, later your Vercel URL).
5. Authorized redirect URIs: `<your-app-url>/api/auth/callback/google`.
6. Copy client ID/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

### 5. Deploy — Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Add all environment variables above in Project → Settings → Environment Variables.
3. Set `BETTER_AUTH_URL` (and `NEXT_PUBLIC_APP_URL`) to your production URL, e.g. `https://your-app.vercel.app`. If you set `VERCEL_PROJECT_PRODUCTION_URL`, the app picks it up automatically for metadata/share links.
4. Update Google OAuth origins/redirect URIs with the final URL.
5. Deploy. Run `npx drizzle-kit push` against the production `DATABASE_URL` once if the database is still empty.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run lint:fix   # eslint --fix
npm run format     # prettier
```

## License

[MIT](LICENSE) © Mohammad Sina Kheiri
