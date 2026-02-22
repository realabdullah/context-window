# Server setup

## Prerequisites

- **Node.js** ≥ 22.12.0 (`nvm use` if you use `.nvmrc`)
- **pnpm** 9.x
- **PostgreSQL** (local or remote)

## 1. Environment

From the repo root, copy the example env and edit as needed:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL, e.g. `postgresql://user:password@localhost:5432/context_window?schema=public` |
| `PORT` | No | API port (default `3001`) |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` | For Compile | At least one LLM key for the “Compile” feature |

The web app (optional overrides):

- `VITE_API_URL` – API base URL (default `http://localhost:3001`)
- `VITE_USER_ID` – User id for API requests (default `mvp-user-1`)

## 2. Install and database

```bash
pnpm install
pnpm db:generate   # generate Prisma client
pnpm db:push       # create/update DB schema (no migrations)
```

## 3. Run

**Option A – everything (API + web) from root:**

```bash
pnpm dev
```

**Option B – run apps separately:**

```bash
# Terminal 1 – API (port 3001)
pnpm --filter @context-window/api run dev

# Terminal 2 – Web (port 3000)
pnpm --filter @context-window/web run dev
```

- **API:** http://localhost:3001  
- **Web:** http://localhost:3000  

## 4. Optional

- **Prisma Studio:** `pnpm db:studio` to inspect/edit the database.
- **Production API:** `pnpm --filter @context-window/api run build` then `pnpm --filter @context-window/api run start:prod` (uses `PORT` or 3001).
