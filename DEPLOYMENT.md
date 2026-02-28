# Vercel Deployment Guide

This guide covers deploying the API (`apps/api`) and frontend (`apps/web` or `apps/nextjs-web`) to Vercel.

## Prerequisites

- Two Vercel projects: one for the API, one for the frontend
- PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres))
- GitHub OAuth App ([create one](https://github.com/settings/developers))

---

## API Project (http://localhost:3001)

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/api` |
| **Framework Preset** | Other |
| **Build Command** | `cd ../.. && pnpm build --filter=@context-window/api` |
| **Output Directory** | `dist` (or leave default; NestJS uses `dist/`) |
| **Install Command** | `pnpm install` (run from repo root) |

> **Note:** The build must run from the monorepo root so `@context-window/database` (Prisma) is built first. If using Turborepo auto-detection, ensure Root Directory allows access to the full workspace.

### Required Environment Variables

Set these in the API project's **Environment Variables** (Vercel Dashboard → Project → Settings → Environment Variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`) |
| `GITHUB_CLIENT_ID` | **Yes** | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | **Yes** | From your GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | **Yes** | `http://localhost:3001/auth/github/callback` |
| `NEXTJS_APP_URL` or `VITE_APP_URL` | **Yes** (for CORS) | Your frontend URL, e.g. `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Optional | Comma-separated origins to add (e.g. `http://localhost:3000`) |

**CORS:** The API allows origins from `NEXTJS_APP_URL` and `VITE_APP_URL`. Set at least one to your production frontend URL. You can also use `ALLOWED_ORIGINS=http://localhost:3000`.

### GitHub OAuth App Configuration

In [GitHub OAuth App settings](https://github.com/settings/developers):

1. **Authorization callback URL:** `http://localhost:3001/auth/github/callback`
2. **Homepage URL:** `http://localhost:3000` (or your frontend URL)

### Database Setup

Before the first deploy:

1. Create a PostgreSQL database
2. Run migrations from your local machine (with production `DATABASE_URL`):

   ```bash
   DATABASE_URL="postgresql://..." pnpm db:push
   ```

   Or use `pnpm db:migrate` if you have migrations.

---

## Frontend Project (http://localhost:3000)

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` or `apps/nextjs-web` |
| **Build Command** | Auto-detected (Vite/Next.js) |
| **Output Directory** | Auto-detected |

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | `http://localhost:3001` |

---

## Troubleshooting

### CORS: "No 'Access-Control-Allow-Origin' header"

1. Ensure `NEXTJS_APP_URL` or `VITE_APP_URL` is set to `http://localhost:3000` in the **API** project.
2. Or set `ALLOWED_ORIGINS=http://localhost:3000` in the API project.
3. Redeploy the API after changing env vars.

### 500: "This Serverless Function has crashed"

Common causes:

1. **Missing `DATABASE_URL`** – Prisma cannot connect. Add a valid PostgreSQL URL.
2. **Missing `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`** – Passport strategy fails on `/auth/github`.
3. **Wrong `GITHUB_CALLBACK_URL`** – Must be `http://localhost:3001/auth/github/callback` (your API domain).
4. **Prisma client not generated** – Ensure the build runs from monorepo root so `@context-window/database` is built (runs `prisma generate`).

Check Vercel deployment logs (Deployments → select deployment → Building / Function logs) for the actual error.

### GitHub OAuth redirects to wrong URL

- `GITHUB_CALLBACK_URL` must exactly match the callback URL configured in your GitHub OAuth App.
- After login, users are redirected to `{NEXTJS_APP_URL or VITE_APP_URL}/traces` – ensure that path exists.
