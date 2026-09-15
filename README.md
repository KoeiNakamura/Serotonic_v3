# Serotonic_v3

A personal routine/energy tracker app for logging sleep, satisfaction
check-ins, and (eventually) a data-driven bedtime recommendation.

## Project Status: Complete (MVP)

As of September 2026, active development on this project is paused. The
original goals — practicing Issue-driven development (Issue → branch →
PR → merge) and shipping a working MVP end-to-end — have both been
achieved. The deeper motivation for building this app turned out to be
less about optimizing sleep and more about learning how to direct an
AI coding assistant and understand a full development workflow; that
goal has been met. See `RETROSPECTIVE.md` for a fuller account.

A few features (a study-time stopwatch, LAN/mobile access, and a
production deployment) were deliberately left unimplemented — see the
closed "wontfix" issues in this repo for the reasoning behind each.

## Tech Stack

- Frontend: Next.js (TypeScript), Docker
- Backend: Django REST Framework, Docker
- DB: MySQL 8.0
- Infra (local dev): Docker Compose

## Features

- Wake-up / sleep time logging, with a prompt for the previous night's
  bedtime when recording a wake-up
- Sleep session log with duration calculation, weekly bar graph
- JWT-based login (supports multiple users, each seeing only their own data)
- Wake / midday / bedtime satisfaction check-ins
- A bedtime recommendation derived from each user's own historical
  check-in data (clearly labeled as a personal reference value, not
  medical advice)

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
exercise.

## Progress

- [x] Docker dev environment (Next.js + Django + MySQL)
- [x] DailyLog model and REST API (wake/sleep/logs/sessions)
- [x] Timezone fix (Asia/Tokyo)
- [x] Frontend: wake/sleep button page and log list page
- [x] JWT authentication, multi-user support
- [x] Design system (color tokens, shared components, custom font/icon)
- [x] Redesigned log list, weekly sleep duration graph
- [x] Satisfaction check-ins (wake/midday/bedtime)
- [x] Bedtime recommendation from check-in history
- [x] Repo structure script (`get_structure.sh`)
- [ ] Study-time stopwatch — **won't do** (see closed issue #18)
- [ ] LAN access for mobile testing — **won't do** (see closed issue #12)
- [ ] Production deployment — **won't do** (see closed issue #11)