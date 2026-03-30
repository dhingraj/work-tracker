# Work Tracker - Product Spec

## Goal
Build a mobile-friendly personal work tracking app that helps Jay track work across projects, tasks, time, focus, outcomes, and follow-ups with a minimal modern UI and production-ready architecture.

## Product principles
- Mobile-first, responsive, fast
- Minimal UI, high information density
- Frictionless daily capture
- Focus on execution + reflection
- Good defaults, low ceremony
- Production-ready structure, auth-ready, deployable

## Core jobs to be done
1. Quickly capture work items, ideas, and follow-ups
2. Plan the day/week around priorities
3. Track active work sessions and interruptions
4. See where time actually went
5. Track progress by project and outcome, not just raw tasks
6. Review daily/weekly effectiveness

## MVP features
### 1. Dashboard
- Today overview
- In-progress items
- Upcoming / overdue
- Time tracked today
- Focus sessions count
- Quick capture input

### 2. Work Items
- Task CRUD
- Status: inbox, planned, in_progress, blocked, done, archived
- Priority: low, medium, high, critical
- Due date
- Estimate vs actual minutes
- Project/tag links
- Notes
- Recurring flag (basic)

### 3. Projects / Areas
- Projects with status and health
- Areas of responsibility
- Optional client/company association
- Progress summary per project

### 4. Time Tracking
- Start/stop timer for a work item
- Manual time entry
- Session notes
- Interruption reason
- Deep work flag

### 5. Daily Planning / Review
- Pick top 3 priorities
- End-of-day review:
  - completed
  - blocked
  - lessons
  - carry forward

### 6. Search / Filters
- Global search
- Filter by status, project, tag, date, priority

### 7. Mobile UX
- Bottom nav
- Floating quick-add
- Big tap targets
- Fast add/edit sheets

## Phase 2
- Weekly review
- Calendar integration
- AI summaries
- Suggestions on estimation accuracy
- Workload analytics
- Notifications / reminders
- Team / multi-user mode

## Recommended architecture
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM
- PostgreSQL for production, SQLite/dev fallback acceptable only if helpful
- NextAuth or simple auth-ready structure
- Server actions / route handlers
- Clean domain models and repository utilities
- Docker-ready

## MVP data model
- User
- Project
- Area
- WorkItem
- TimeSession
- DailyPlan
- DailyReview
- Tag
- WorkItemTag

## Suggested screens
- /dashboard
- /items
- /items/[id]
- /projects
- /projects/[id]
- /timer
- /review/daily
- /settings

## Key UX references to emulate
- Linear: clean task density
- Sunsama / Motion: planning flow
- Timely / Rize: focus/time awareness
- Notion mobile: compact capture feel

## Build expectations
- Production-quality structure
- Seed data for demo
- Docker support
- README with run/deploy instructions
