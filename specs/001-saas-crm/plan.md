# Implementation Plan: SaaS CRM

**Branch**: `001-saas-crm` | **Date**: 2026-07-11 | **Spec**: `specs/001-saas-crm/spec.md`

**Input**: Feature specification from `specs/001-saas-crm/spec.md`

## Summary

Implement a professional portfolio CRM as vertical slices on the existing Better-T-Stack scaffold. The app will extend Better Auth users with CRM roles and teams, add Drizzle CRM schema, expose Elysia API modules for companies, contacts, deals, tasks, activities, reports, and admin users, and build a TanStack Start dashboard UI with tested role-specific workflows.

## Technical Context

**Language/Version**: TypeScript 6 on Bun 1.3.14

**Primary Dependencies**: TanStack Start, React 19, Elysia, Better Auth, Drizzle ORM, PostgreSQL, TailwindCSS, Biome, Evlog, shared shadcn UI primitives

**Storage**: PostgreSQL via Docker; Drizzle schema and migrations in `packages/db`

**Testing**: Bun test for unit/integration; e2e runner to be introduced in a task only if not scaffolded; accessibility checks added as project quality command

**Target Platform**: Local portfolio demo web app with API server and database

**Project Type**: Monorepo web application

**Performance Goals**: Primary local dashboard and list pages respond within two seconds on seeded demo data

**Constraints**: Server-side authorization for all protected data; WCAG 2.1 AA; dry-run publication; no real external services required

**Scale/Scope**: Demo-scale B2B sales team: 3 roles, several users, 20-50 companies, 50-150 contacts, 30-80 deals, tasks, and activities

## Constitution Check

| Gate | Status | Plan response |
|------|--------|---------------|
| Specification source of truth | Pass | All scope maps to `spec.md` and `traceability.md`. |
| Server-side authorization | Pass | API routes and repository helpers enforce role/team/owner scope. |
| Evidence-based quality | Pass | Tasks include tests and quality gates. |
| Vertical slices | Pass | Slices deliver auth shell, CRM data, pipeline, tasks, reports, admin, finalization. |
| Portfolio UX | Pass | Design brief and Taste Skill audit required during UI tasks. |

## Project Structure

### Documentation

```text
specs/001-saas-crm/
├── spec.md
├── assumptions.md
├── traceability.md
├── design-brief.md
├── plan.md
├── data-model.md
├── authorization-matrix.md
├── api-contract.md
├── test-strategy.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/server/src/
├── index.ts
├── modules/
│   ├── authz/
│   ├── companies/
│   ├── contacts/
│   ├── deals/
│   ├── tasks/
│   ├── activities/
│   ├── reports/
│   └── admin/
└── tests/
    ├── integration/
    └── helpers/

apps/web/src/
├── routes/
│   ├── _auth/
│   │   ├── dashboard.tsx
│   │   ├── companies/
│   │   ├── contacts/
│   │   ├── deals/
│   │   ├── tasks/
│   │   ├── reports/
│   │   └── admin/
│   └── login.tsx
├── components/
│   ├── crm-shell/
│   ├── dashboard/
│   ├── data-table/
│   └── forms/
└── tests/
    └── e2e/

packages/db/src/
├── schema/
│   ├── auth.ts
│   ├── crm.ts
│   └── index.ts
├── repositories/
├── seed/
└── tests/

packages/auth/src/
├── index.ts
└── permissions.ts
```

**Structure Decision**: Preserve Better-T-Stack monorepo boundaries. Keep persistence in `packages/db`, authorization helpers in `packages/auth`, API modules in `apps/server`, and UI workflows in `apps/web`.

## Feature Slices

### Slice 001 — Authenticated Application Shell

- Extend user role/team metadata.
- Add server-side permission helpers.
- Build role-aware CRM shell and navigation.
- Seed demo users.
- Tests: auth helpers, protected route denial, role navigation e2e.

### Slice 002 — Company And Contact Management

- Add company/contact schema, repositories, API routes, list/detail/forms.
- Implement search, filters, archive, validation, empty/error states.
- Tests: validation, repository relations, API authorization, e2e create/edit.

### Slice 003 — Deal Pipeline

- Add deals and pipeline stages.
- Build pipeline board/list and deal detail.
- Record stage change activity.
- Tests: stage transitions, totals, authorization, e2e move deal.

### Slice 004 — Tasks And Activity Timeline

- Add tasks and activities.
- Build task list, completion flow, and related entity timelines.
- Tests: task assignment, activity chronology, e2e completion.

### Slice 005 — Manager Reporting

- Add report query services.
- Build dashboard metrics, filters, charts/tables.
- Tests: aggregation correctness, scoped report access, e2e manager report.

### Slice 006 — Admin User Management

- Add user management screens and role/status mutations.
- Ensure non-admin denial.
- Tests: role update, access change, e2e admin flow.

### Slice 007 — Finalization And Portfolio Evidence

- Add normalized quality scripts.
- Complete docs, demo guide, validation report, portfolio case study.
- Run full quality gates and visual/accessibility audit.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Better Auth role data not present by default | Store app role/team fields in CRM profile table linked to auth user. |
| Authorization leakage across users | Centralize permission checks and repository scope filters; test denied paths. |
| Large UI scope | Use vertical slices and reusable shell/table/form primitives. |
| Missing e2e/a11y tooling | Add task-scoped dependencies only when justified by tests and documented in `test-strategy.md`. |
| Spec Kit/factory state mismatch | Use `bun run factory next --json` each cycle. |

## Rollback Considerations

- Schema changes should be migration-backed; test migrations before finalization.
- Each slice should commit only after passing targeted gates.
- Failed feature tasks transition to repair rather than broad rollback.

## Quality Command Plan

Add normalized scripts during implementation:

```json
{
  "format:check": "biome check .",
  "lint": "biome lint .",
  "typecheck": "bun run check-types",
  "test:unit": "bun test tests/unit packages/*/src/**/*.test.ts",
  "test:integration": "bun test tests/integration apps/server/src/tests/integration",
  "test:e2e": "bun test apps/web/src/tests/e2e",
  "quality:all": "bun run format:check && bun run lint && bun run typecheck && bun run test:unit && bun run test:integration && bun run build"
}
```

Scripts must be adjusted to actual test locations as they are created.
