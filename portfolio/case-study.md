# Portfolio Case Study — Portfolio SaaS CRM

> Project: **portfolio-saas-crm** (`saas-crm`)  
> Last updated: 2026-07-11

## Elevator pitch

Multi-role B2B CRM built with TypeScript monorepo stack. Demonstrates authentication, server-enforced RBAC, relational sales workflows, reporting, and automated test evidence — suitable as a portfolio flagship for full-stack SaaS delivery.

## Problem statement

Small B2B sales teams need one place to track companies, contacts, pipeline deals, follow-up tasks, and team performance — with clear permission boundaries between reps, managers, and administrators.

## My role

- End-to-end implementation via Portfolio Application Factory
- Spec Kit specification, plan, and bounded task execution
- Database schema, repositories, API modules, and React UI
- Test strategy across unit, integration, and e2e layers

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | TanStack Start + React | SSR-ready app shell, typed routing |
| Backend | Elysia on Bun | Type-safe API, fast local dev |
| Database | PostgreSQL + Drizzle | Relational CRM model, typed queries |
| Auth | Better Auth | Email/password sessions, Drizzle adapter |
| UI | shadcn/ui in shared package | Consistent primitives, accessible defaults |

## Key features demonstrated

1. **Role-aware CRM shell** — Navigation and data scope per administrator, manager, representative
2. **Deal pipeline** — Stage transitions with activity audit trail
3. **Tasks and activity timeline** — Follow-ups linked to accounts and deals
4. **Manager reporting** — Pipeline, performance, and task aggregates with scope filters
5. **Admin user management** — Role, team, enable/disable with server-side gate

## Portfolio focus areas

| Focus | How demonstrated |
|-------|-------------------|
| Business workflows | Company → contact → deal → task → report chain |
| Role-based access | Permission matrix + integration denial tests |
| Automated testing | 178 tests, full `quality:all` gate |
| Dashboard design | Scoped metrics, pipeline board, dense tables |

## Technical highlights

### Server-side authorization

Every CRM route loads session, CRM profile, and scope before repository access. Representatives cannot read peer records even with direct API IDs — verified in integration tests.

### Vertical slice architecture

Features delivered as slices: data layer → API → UI → tests. Repositories apply scope predicates; UI reflects permissions but never replaces server checks.

## Quality and rigor

- **Tests:** 56 unit, 88 integration, 34 e2e — all passing
- **Authorization:** Matrix-driven RBAC with automated denial cases
- **Accessibility:** WCAG 2.1 AA manual audit on primary flows
- **Validation:** `VALIDATION_REPORT.md` with exit codes

## Challenges and solutions

| Challenge | Solution |
|-----------|----------|
| Team/manager circular FK | Seed team first, assign manager profile after profiles created |
| Scope across entities | Shared `AuthorizationScope` + repository query builders |
| Idempotent demo seed | Stable seed IDs + skip when marker team exists |

## Metrics

| Metric | Value |
|--------|------:|
| CRM roles | 3 |
| API route modules | 7 |
| Automated tests | 178 |
| Seed companies | 4 |
| Seed deals | 5 |

## Live demo

- **Local:** See `demo-guide.md`
- **Deployed:** Not deployed — portfolio demonstrates local excellence

## Repository structure

```
portfolio-saas-crm/
├── apps/web/          # TanStack Start UI
├── apps/server/       # Elysia API
├── packages/db/       # Schema, repos, seed
├── packages/auth/     # Better Auth + permissions
└── specs/001-saas-crm/ # Spec Kit source of truth
```

## What I'd do next

- Add axe-core CI for automated accessibility regression
- Deploy preview environment with managed Postgres
- Email notification simulation for activity types

## Links

- Validation report: `VALIDATION_REPORT.md`
- Demo guide: `demo-guide.md`
- Testing: `docs/testing.md`
