# Work Tracker

Mobile-first personal work tracking app for calendar planning, execution, lightweight time logging, and daily review.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker / Docker Compose

## Features

- Email/password auth with private per-user data isolation
- Calendar-first month view with day selection, status-colored task markers, and mobile-friendly task details
- Dashboard with today overview, quick capture, active work queue, upcoming work, and recent sessions
- Work item CRUD with status, priority, due date, notes, estimates, recurring flag, and tag links
- Project and area management with project health and progress summaries
- Focus session start/stop flow plus manual session entry when backfilling is useful
- Daily planning and end-of-day review
- Settings for user defaults and tag management
- Optional demo workspace seed for a single explicit local account

## Local development

1. Copy the environment file.

```bash
cp .env.example .env
```

The example file includes a development `SESSION_SECRET`. Replace it with your own random value before using any shared or production environment.

2. Start PostgreSQL.

```bash
docker compose up -d db
```

3. Install dependencies.

```bash
npm install
```

4. Apply the migrations.

```bash
npm run db:migrate
```

5. Optionally seed one demo account and its workspace.

Set `SEED_DEMO_EMAIL` and `SEED_DEMO_PASSWORD` in `.env` first if you want sample data. If you leave them blank, `npm run db:seed` exits without creating any shared user or shared data.

```bash
npm run db:seed
```

6. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000`.

If you did not seed a demo account, create your first account at `http://localhost:3000/signup`.

## Full Docker run

```bash
docker compose up --build
```

This starts:

- `db`: PostgreSQL 16
- `app`: Next.js server on port `3000`

The app container runs Prisma migrations before boot.

## Production notes

- The repo is configured for PostgreSQL only.
- `next.config.ts` uses `output: "standalone"` to keep container deployment simple.
- Prisma migrations are committed in `prisma/migrations`.
- The app now requires signup/login and stores sessions in the database.
- Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` in production, and use a `__Secure-` cookie name over HTTPS.
- `SESSION_SECRET` is required in production and should be a long random value of at least 32 characters.
- Run `prisma migrate deploy` as a separate release step before serving traffic. Do not rely on app boot to perform production migrations.

## Vercel + Neon

Recommended production setup:

- Use Neon PostgreSQL for `DATABASE_URL`.
- Set `SESSION_SECRET` in Vercel with a long random value, for example `openssl rand -base64 32`.
- Keep `SEED_DEMO_EMAIL` and `SEED_DEMO_PASSWORD` unset in production unless you explicitly want demo data in that environment.
- Run `npx prisma migrate deploy` against your production database before or during deploy from a separate CI/release step, not from the app runtime.
- Expect all existing browser sessions to be invalidated the first time you deploy this hardening pass because session token hashing now depends on `SESSION_SECRET`.

## Database workflows

```bash
npm run db:migrate
npm run db:seed
```

For schema changes during development:

```bash
npx prisma migrate dev --name your_change
```

## Demo data

The seed is optional. When `SEED_DEMO_EMAIL` and `SEED_DEMO_PASSWORD` are set, it creates one explicit demo account with sample projects, work items, tags, sessions, and a daily plan. It does not create a shared default user for every environment.

## Project structure

```text
src/
  app/                 Routes and page shells
  components/          UI primitives and shared form/layout components
  lib/                 Prisma bootstrap, query helpers, constants, utils, validators
  server/actions/      Server actions for CRUD, timer, review, and settings flows
prisma/
  migrations/          Committed SQL migrations
  schema.prisma        Domain schema
  seed.ts              Demo seed script
```

## Validation

Recommended checks:

```bash
npm run build
```

If you want to inspect the database locally:

```bash
npx prisma studio
```
