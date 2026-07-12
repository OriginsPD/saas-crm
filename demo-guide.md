# Demo Guide

> Project: **portfolio-saas-crm** (`saas-crm`)
> Last updated: 2026-07-11

## Prerequisites

- Bun 1.3.14+
- Docker Desktop running
- `.env` configured from `.env.example`

## Quick start

```bash
cd portfolio-saas-crm
bun install
bun run db:start
bun run db:generate
bun run db:migrate
bun run db:seed
bun run dev
```

- **Web:** http://localhost:3001
- **API:** http://localhost:3000

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| administrator | admin@example.test | DemoAdmin123! |
| sales_manager | manager@example.test | DemoManager123! |
| sales_representative | rep@example.test | DemoRep123! |

Local demo only. Never use in production.

## Walkthrough scripts

### 1. Representative daily CRM (5 min)

1. Sign in as `rep@example.test`
2. Open **Companies** — see Acme, Brightline, Delta owned by rep
3. Open **Deals** pipeline — move Brightline pilot stage or review totals
4. Open **Tasks** — complete or review open follow-ups
5. Open company detail — verify activity timeline
6. **Expected:** Scoped data only; no admin nav items

### 2. Manager reporting (3 min)

1. Sign in as `manager@example.test`
2. Open **Dashboard** and **Reports**
3. Review pipeline value, performance metrics, task counts
4. Open Cedar Systems deal (manager-owned)
5. **Expected:** Team-scoped metrics; no user admin

### 3. Administrator user management (3 min)

1. Sign in as `admin@example.test`
2. Navigate to **Users** (`/admin/users`)
3. Change a user role or disable a test user
4. **Expected:** Updates persist; disabled user gets 403 on CRM routes

### 4. Authorization check (2 min)

1. Sign in as `rep@example.test`
2. Attempt direct URL `/admin/users`
3. **Expected:** Permission denied UI or API 403

## Feature highlights

| Feature | Demo path | Showcases |
|---------|-----------|-----------|
| RBAC shell | Any signed-in route | Role-specific navigation |
| Pipeline | `/deals` | Stage board, scoped totals |
| Activity timeline | Company/contact/deal detail | Notes, calls, stage changes |
| Reports | `/reports` | Manager aggregation |
| Admin users | `/admin/users` | Server-side admin gate |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DB connection refused | `bun run db:start` |
| Seed already applied | Normal — script skips idempotently |
| Auth session issues | Clear cookies, re-login |
| Port conflict | Adjust `.env` ports |

## Tear down

```bash
bun run db:stop
```
