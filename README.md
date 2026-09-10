# Serotonic_v3

A personal routine/energy tracker app. Currently building an MVP focused
solely on recording sleep and wake-up times.

## Tech Stack

- Frontend: Next.js (TypeScript), Docker
- Backend: Django REST Framework, Docker
- DB: MySQL 8.0
- Infra (local dev): Docker Compose

## Resuming Development

Steps to pick back up after a break:

```bash
cd ~/projects/Serotonic
docker-compose start
```

Verify everything is running:

```bash
docker-compose ps
```

All three containers (`serotonic_db`, `serotonic_backend`, `serotonic_frontend`) should show `Up`.

- Frontend: http://localhost:3000
- Backend (admin): http://localhost:8000/admin
- Backend (API):   http://localhost:8000/api/logs/

Before starting any new work, always check the branch and working tree:

```bash
git status
git branch
```

Confirm you're on `main` with a clean working tree before creating a new feature branch.

## End-of-session Routine

```bash
git status           # check for uncommitted changes
docker-compose stop  # stop containers (saves memory, config is preserved)
```

## Development Workflow

This project follows an Issue-driven development flow (Issue → feature
branch → implementation → commit → PR → merge) as a deliberate practice
exercise. Any new work should start with a GitHub Issue before implementation.

## Current Progress

- [x] Set up Docker dev environment (Next.js + Django + MySQL)
- [x] Implement DailyLog model (daily-record schema)
- [x] Implement REST API (`/api/wake/`, `/api/sleep/`, `/api/logs/`)
- [x] Fix timezone to Asia/Tokyo
- [x] Frontend: wake/sleep button page
- [x] Frontend: log list page
- [ ] LAN access for mobile testing — **on hold**. Buttons don't respond
      on iPhone Safari due to a suspected Next.js hydration failure; root
      cause not yet confirmed (see related GitHub Issue for details).
- [ ] Production deployment (VPS + Docker) — on hold pending budget
      (planning to revisit once part-time income is secured).