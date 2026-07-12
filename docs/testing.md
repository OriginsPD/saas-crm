# Testing Guide

## Overview

Portfolio SaaS CRM uses Bun test across unit, integration, and e2e layers. Authorization and validation are tested server-side; UI tests focus on role navigation, forms, and critical workflows.

## Commands

| Command | Scope |
|---------|-------|
| `bun run test:unit` | DB repositories, auth permissions |
| `bun run test:integration` | DB scope SQL + Elysia API routes |
| `bun run test:e2e` | React component workflows (web) |
| `bun run test` | All three layers |
| `bun run quality:all` | format, lint, typecheck, test, build |

## Unit tests

**Packages:** `@portfolio-saas-crm/db`, `@portfolio-saas-crm/auth`

| Area | Location |
|------|----------|
| Schema and enums | `packages/db/src/tests/*.test.ts` |
| Validation helpers | companies, contacts, deals, tasks, activities |
| Authorization scope | `packages/db/src/authorization/scope.ts` |
| Permission matrix | `packages/auth/src/permissions.test.ts` |
| Admin user rules | `packages/db/src/tests/admin-users.test.ts` |
| Seed fixtures | `packages/db/src/tests/integration/seed.test.ts` |

## Integration tests

**DB:** repository scope predicates (admin, manager, representative)

**Server:** route-level auth, validation, and cross-user denial

| Module | File |
|--------|------|
| Authz | `apps/server/src/tests/integration/authz.test.ts` |
| Companies/contacts | `companies-contacts.test.ts` |
| Deals | `deals.test.ts` |
| Tasks/activity | `tasks-activities.test.ts` |
| Reports | `reports.test.ts` |
| Admin users | `admin-users.test.ts` |

## End-to-end tests

Component-level e2e in `apps/web/src/tests/e2e/`:

- CRM shell navigation by role
- Companies, contacts, forms, validation
- Deal pipeline and stage rules
- Tasks, activity timeline
- Reports dashboard
- Admin user management panel

## Accessibility verification

Automated axe runner not added (out of scope). Manual audit checklist:

| Check | Status | Evidence |
|-------|--------|----------|
| Form labels | Pass | All primary forms use `Label` + `htmlFor` |
| Error announcements | Pass | `role="alert"` on server/form errors |
| Permission denied | Pass | e2e `permission denied state is accessible` |
| Focus visibility | Pass | shadcn focus rings on buttons/inputs |
| Semantic landmarks | Pass | Shell uses nav/main structure |
| Reduced motion | Pass | No required motion for task completion |

## Visual audit

| Surface | Status | Notes |
|---------|--------|-------|
| Dashboard | Pass | Metric cards, scoped labels |
| Pipeline board | Pass | Stage columns, no nested card clutter |
| Data tables | Pass | Search, scope badges, empty states |
| Forms | Pass | Inline validation, loading states |
| Admin users | Pass | Role/status controls with labels |

No unresolved P0/P1 visual defects. Future improvement: dedicated screenshot CI.

## Seed verification

```bash
bun run db:start
bun run db:migrate
bun run db:seed
```

Re-run is idempotent (skips when seed team exists).

## Full gate before review

```bash
bun run quality:all
```

See `VALIDATION_REPORT.md` for latest executed evidence.
