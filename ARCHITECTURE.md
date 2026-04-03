# Architecture

## Domain model

- `User`: single-user workspace today, with preferences and productivity defaults
- `Area`: stable responsibility buckets such as consulting, product, or ops
- `Project`: outcome-oriented container with status, health, optional client, and linked work
- `WorkItem`: executable unit of work with status, priority, due date, estimate, notes, and recurrence flag
- `Tag` and `WorkItemTag`: lightweight cross-cutting labels for search and grouping
- `TimeSession`: timer or manual work log, optional interruption reason, deep work flag
- `DailyPlan`: top three priorities and a note for a given day
- `DailyReview`: daily reflection on completion, blockers, lessons, and carry-forward

## Request and mutation flow

- App Router server components read data through `src/lib/data.ts`.
- Mutations use server actions in `src/server/actions/*`.
- Authenticated user resolution flows through `src/lib/auth.ts`, using an `HttpOnly` session cookie backed by hashed session records in PostgreSQL.
- User-scoped reads and writes require a signed-in user, so data isolation is enforced server-side rather than through local-only assumptions.
- After writes, server actions revalidate affected routes so calendar, dashboard, item, project, timer, and review screens stay consistent.

## UI shape

- Mobile-first shell with bottom navigation and a floating quick-add button
- Dense card layout for small screens first, expanding into multi-column panels on larger viewports
- CRUD-heavy screens use direct forms instead of modal-heavy flows to keep the MVP fast and usable
- The calendar screen is the primary planning surface, using `WorkItem.dueDate` as the month-view placement for MVP
- The timer screen is secondary, focused on running a session or backfilling manual time after planning is done

## Deployment shape

- Next.js app runs as a Node server or on Vercel
- Prisma connects to PostgreSQL via `DATABASE_URL`
- Auth sessions are persisted in the database and the browser cookie is marked `Secure` in production
- `docker-compose.yml` defines `app` and `db`
- `Dockerfile` installs dependencies, generates Prisma client, builds the app, and starts the server
- Production migrations should run as a separate deploy step rather than during app boot

## Extension points

- Add weekly review and analytics without changing the core work/timer entities
- Expose route handlers or a REST/GraphQL edge later if external integrations become necessary
