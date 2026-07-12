# Tasks: SaaS CRM

**Input**: Design documents from `specs/001-saas-crm/`

**Prerequisites**: `spec.md`, `plan.md`, `data-model.md`, `authorization-matrix.md`, `api-contract.md`, `test-strategy.md`

**First task**: `T-001-001`

## Task Format

```yaml
id: T-001-001
feature: foundation-authenticated-shell
title: Configure normalized quality scripts
status: pending
dependencies: []
files: []
acceptanceCriteria: []
tests: []
qualityGates: []
```

## Phase 1: Setup And Quality Baseline

### T-001-001

```yaml
id: T-001-001
feature: foundation-quality
title: Configure normalized quality scripts
status: completed
dependencies: []
files:
  - package.json
acceptanceCriteria:
  - Root package.json exposes format:check, lint, typecheck, test:unit, test:integration, test:e2e, quality:all scripts.
  - Scripts map to existing scaffold commands or documented no-op placeholders only when matching test files are absent.
  - Existing build and check-types scripts still work.
tests:
  - typecheck
qualityGates:
  - bun run typecheck
```

### T-001-002

```yaml
id: T-001-002
feature: foundation-environment
title: Document local environment and demo bootstrap
status: completed
dependencies:
  - T-001-001
files:
  - .env.example
  - README.md
  - specs/001-saas-crm/quickstart.md
acceptanceCriteria:
  - Required auth, CORS, and database variables are documented.
  - Local startup flow references database start, migration, seed, API, and web apps.
  - No secrets are committed.
tests:
  - documentation review
qualityGates:
  - bun run format:check
```

## Phase 2: Foundation - Authenticated Shell

### T-002-001

```yaml
id: T-002-001
feature: foundation-authenticated-shell
title: Add CRM profile roles and team schema
status: completed
dependencies:
  - T-001-001
files:
  - packages/db/src/schema/crm.ts
  - packages/db/src/schema/index.ts
  - packages/db/src/tests/crm-schema.test.ts
acceptanceCriteria:
  - CRM profile, team, and role/status enums are modeled.
  - CRM profile links to Better Auth user.
  - Schema exports are available from packages/db.
tests:
  - unit
qualityGates:
  - bun run test:unit
  - bun run typecheck
```

### T-002-002

```yaml
id: T-002-002
feature: foundation-authenticated-shell
title: Implement role and scope permission helpers
status: completed
dependencies:
  - T-002-001
files:
  - packages/auth/src/permissions.ts
  - packages/auth/src/permissions.test.ts
acceptanceCriteria:
  - Administrator, manager, and representative grants match authorization matrix.
  - Default deny behavior is tested.
  - Scope helpers distinguish all, team-owned, and own/assigned access.
tests:
  - unit
qualityGates:
  - bun run test:unit
  - bun run typecheck
```

### T-002-003

```yaml
id: T-002-003
feature: foundation-authenticated-shell
title: Add authenticated profile API and protected route middleware
status: completed
dependencies:
  - T-002-002
files:
  - apps/server/src/modules/authz/profile.ts
  - apps/server/src/modules/authz/middleware.ts
  - apps/server/src/index.ts
  - apps/server/src/tests/integration/authz.test.ts
acceptanceCriteria:
  - GET /api/crm/me returns current CRM profile and permissions.
  - Unauthenticated CRM API requests return 401.
  - Disabled user access is denied.
tests:
  - integration
qualityGates:
  - bun run test:integration
  - bun run typecheck
```

### T-002-004

```yaml
id: T-002-004
feature: foundation-authenticated-shell
title: Build role-aware CRM shell
status: completed
dependencies:
  - T-002-003
files:
  - apps/web/src/components/crm-shell/*
  - apps/web/src/routes/_auth/route.tsx
  - apps/web/src/routes/_auth/dashboard.tsx
acceptanceCriteria:
  - Navigation reflects administrator, manager, and representative permissions.
  - Loading, empty, and permission-denied shell states exist.
  - Layout works at desktop, tablet, and mobile breakpoints.
tests:
  - e2e
  - accessibility
qualityGates:
  - bun run test:e2e
  - bun run build
```

## Phase 3: Company And Contact Management

### T-003-001

```yaml
id: T-003-001
feature: companies-contacts
title: Add company and contact schema with repositories
status: completed
dependencies:
  - T-002-002
files:
  - packages/db/src/schema/crm.ts
  - packages/db/src/repositories/companies.ts
  - packages/db/src/repositories/contacts.ts
  - packages/db/src/tests/companies-contacts.test.ts
acceptanceCriteria:
  - Companies and contacts match data-model.md.
  - Repository queries apply authorization scope.
  - Contact validation enforces email-or-phone rule.
tests:
  - unit
  - integration
qualityGates:
  - bun run test:unit
  - bun run test:integration
```

### T-003-002

```yaml
id: T-003-002
feature: companies-contacts
title: Expose companies and contacts API routes
status: completed
dependencies:
  - T-003-001
files:
  - apps/server/src/modules/companies/*
  - apps/server/src/modules/contacts/*
  - apps/server/src/index.ts
  - apps/server/src/tests/integration/companies-contacts.test.ts
acceptanceCriteria:
  - API contract endpoints for companies and contacts are implemented.
  - Invalid input returns field errors.
  - Cross-user access is rejected server-side.
tests:
  - integration
  - authorization
qualityGates:
  - bun run test:integration
```

### T-003-003

```yaml
id: T-003-003
feature: companies-contacts
title: Build company and contact list/detail/forms
status: completed
dependencies:
  - T-003-002
files:
  - apps/web/src/routes/_auth/companies/*
  - apps/web/src/routes/_auth/contacts/*
  - apps/web/src/components/forms/*
  - apps/web/src/components/data-table/*
acceptanceCriteria:
  - Users can create and edit companies and contacts.
  - Search/filter, empty state, validation error state, and archive action exist.
  - Manager and representative scopes are visible in UI behavior.
tests:
  - e2e
  - accessibility
qualityGates:
  - bun run test:e2e
  - bun run build
```

## Phase 4: Deal Pipeline

### T-004-001

```yaml
id: T-004-001
feature: deal-pipeline
title: Add deal schema, stage transitions, and repositories
status: completed
dependencies:
  - T-003-001
files:
  - packages/db/src/schema/crm.ts
  - packages/db/src/repositories/deals.ts
  - packages/db/src/tests/deals.test.ts
acceptanceCriteria:
  - Deal fields and stages match data-model.md.
  - Stage transitions validate close metadata.
  - Pipeline totals are queryable by authorization scope.
tests:
  - unit
  - integration
qualityGates:
  - bun run test:unit
  - bun run test:integration
```

### T-004-002

```yaml
id: T-004-002
feature: deal-pipeline
title: Expose deal and pipeline API routes
status: completed
dependencies:
  - T-004-001
files:
  - apps/server/src/modules/deals/*
  - apps/server/src/tests/integration/deals.test.ts
acceptanceCriteria:
  - Deal list, detail, create, update, and stage mutation endpoints work.
  - Stage changes record activity.
  - Unauthorized deal mutation is rejected.
tests:
  - integration
  - authorization
qualityGates:
  - bun run test:integration
```

### T-004-003

```yaml
id: T-004-003
feature: deal-pipeline
title: Build pipeline UI and deal detail workflow
status: completed
dependencies:
  - T-004-002
files:
  - apps/web/src/routes/_auth/deals/*
  - apps/web/src/components/pipeline/*
acceptanceCriteria:
  - Users can create deals, view pipeline by stage, move stages, and close deals.
  - Pipeline totals update after mutations.
  - Empty, loading, error, and permission states exist.
tests:
  - e2e
  - accessibility
qualityGates:
  - bun run test:e2e
  - bun run build
```

## Phase 5: Tasks And Activity Timeline

### T-005-001

```yaml
id: T-005-001
feature: tasks-activity
title: Add tasks and activities data layer
status: completed
dependencies:
  - T-004-001
files:
  - packages/db/src/schema/crm.ts
  - packages/db/src/repositories/tasks.ts
  - packages/db/src/repositories/activities.ts
  - packages/db/src/tests/tasks-activities.test.ts
acceptanceCriteria:
  - Tasks and activities match data-model.md.
  - Activity timeline sorts reverse chronological.
  - Task completion sets completion timestamp.
tests:
  - unit
  - integration
qualityGates:
  - bun run test:unit
  - bun run test:integration
```

### T-005-002

```yaml
id: T-005-002
feature: tasks-activity
title: Add tasks and activity API/UI flows
status: completed
dependencies:
  - T-005-001
files:
  - apps/server/src/modules/tasks/*
  - apps/server/src/modules/activities/*
  - apps/web/src/routes/_auth/tasks/*
  - apps/web/src/components/activity/*
acceptanceCriteria:
  - Users can create, complete, and reopen tasks.
  - Users can log activity on companies, contacts, and deals.
  - Related timelines show activity and task events.
tests:
  - integration
  - e2e
qualityGates:
  - bun run test:integration
  - bun run test:e2e
```

## Phase 6: Reporting And Administration

### T-006-001

```yaml
id: T-006-001
feature: manager-reporting
title: Implement scoped report queries and dashboard UI
status: completed
dependencies:
  - T-005-001
files:
  - packages/db/src/repositories/reports.ts
  - apps/server/src/modules/reports/*
  - apps/web/src/routes/_auth/reports/*
  - apps/web/src/components/dashboard/*
acceptanceCriteria:
  - Managers see team pipeline, task, and activity metrics.
  - Representatives see own metrics only.
  - Report filters preserve authorization scope.
tests:
  - unit
  - integration
  - e2e
qualityGates:
  - bun run test:unit
  - bun run test:integration
  - bun run test:e2e
```

### T-006-002

```yaml
id: T-006-002
feature: admin-user-management
title: Implement admin user management
status: completed
dependencies:
  - T-002-003
files:
  - apps/server/src/modules/admin/*
  - apps/web/src/routes/_auth/admin/*
  - apps/server/src/tests/integration/admin-users.test.ts
acceptanceCriteria:
  - Administrators can list users, update role/team, and enable or disable users.
  - Non-admin requests are denied server-side.
  - Disabled users lose protected access.
tests:
  - integration
  - e2e
qualityGates:
  - bun run test:integration
  - bun run test:e2e
```

## Phase 7: Seed Data, Validation, And Portfolio Evidence

### T-007-001

```yaml
id: T-007-001
feature: demo-data
title: Add credible CRM seed data
status: completed
dependencies:
  - T-006-002
files:
  - packages/db/src/seed/*
  - package.json
  - README.md
acceptanceCriteria:
  - Seed script creates demo users, team, companies, contacts, deals, tasks, and activities.
  - Demo account credentials are documented without real secrets.
  - Seed can run on clean local database.
tests:
  - integration
qualityGates:
  - bun run test:integration
```

### T-007-002

```yaml
id: T-007-002
feature: final-validation
title: Complete validation and portfolio documentation
status: completed
dependencies:
  - T-007-001
files:
  - docs/testing.md
  - VALIDATION_REPORT.md
  - BLOCKER_REPORT.md
  - portfolio/case-study.md
  - portfolio/upwork-description.md
  - README.md
acceptanceCriteria:
  - Full validation report includes commands, exit codes, and evidence.
  - Demo guide and portfolio case study exist.
  - Final visual and accessibility audit findings are resolved or documented.
tests:
  - full_quality
qualityGates:
  - bun run quality:all
```

## Dependencies & Execution Order

```text
T-001-001
└── T-001-002
    └── T-002-001
        └── T-002-002
            └── T-002-003
                ├── T-002-004
                ├── T-003-001 -> T-003-002 -> T-003-003
                │   └── T-004-001 -> T-004-002 -> T-004-003
                │       └── T-005-001 -> T-005-002
                │           └── T-006-001
                └── T-006-002
                    └── T-007-001 -> T-007-002
```

## Parallel Opportunities

- T-001-002 can proceed after T-001-001 while T-002-001 starts if no file conflict.
- UI shell T-002-004 can proceed after profile API, while company/contact data work begins.
- Reporting and admin slices can proceed after foundational authorization and relevant data dependencies.

## Implementation Notes

- Follow one task per Cursor execution cycle.
- Write tests first where practical.
- Commit only passing work when factory config permits.
- Use `bun run factory implement --task <id> --execute` to set active task.
- Stop at failed quality gate and enter repair.
