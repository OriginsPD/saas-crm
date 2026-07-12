# Architecture

## Overview

Portfolio SaaS CRM uses the scaffolded Better-T-Stack monorepo. The architecture separates shared data/auth packages from API modules and web UI routes.

```text
apps/web (TanStack Start)
  -> calls apps/server Elysia API
  -> uses Better Auth client
  -> imports packages/ui primitives

apps/server (Elysia)
  -> handles /api/auth via Better Auth
  -> exposes /api/crm and /api/admin modules
  -> enforces authorization before database access

packages/auth
  -> Better Auth configuration
  -> CRM permission helpers

packages/db
  -> Drizzle schema, migrations, repositories, seed data

packages/ui
  -> shared UI primitives and styling
```

## Module Boundaries

| Module | Owns | Must not own |
|--------|------|--------------|
| `packages/db` | Schema, migrations, repositories, seed fixtures | HTTP concerns or React UI |
| `packages/auth` | Auth config, role permission helpers | Feature UI or report rendering |
| `apps/server` | API routes, request validation, authorization enforcement | Raw UI state |
| `apps/web` | Routes, layout, components, client interactions | Direct database access |
| `packages/ui` | Shared primitives | Domain business logic |

## Request Flow

1. Web route loads authenticated session.
2. API request carries session cookie.
3. Elysia route obtains auth user.
4. CRM profile is loaded from database.
5. Authorization helper resolves role and scope.
6. Repository applies scope predicates.
7. Response returns sanitized data shape.

## Data Access Strategy

- Use repositories for each aggregate: companies, contacts, deals, tasks, activities, reports, admin users.
- Repositories accept an authorization scope object instead of raw user IDs.
- Mutations validate input before database write.
- Activity records are created in the same logical operation as relevant mutations where practical.

## UI Strategy

- Build shared CRM shell with role-aware navigation.
- Use layout primitives for dashboard cards, data tables, forms, timelines, and empty states.
- Keep route components focused on composition; data fetching and mutations live in route helpers or service modules.
- Apply Taste Skill during shell, dashboard, table, form, and final visual audit work.

## Observability

- Preserve Evlog integration.
- Log mutation type, actor, route, outcome, and error category.
- Redact email and sensitive values in logs.

## Security

- Deny by default.
- Client UI never substitutes for server authorization.
- `.env.example` documents required values; `.env` remains ignored.
- No raw commands from user-maintained metadata.

## Migration Plan

1. Add CRM schema tables and enums.
2. Generate Drizzle migrations.
3. Seed data script (`packages/db/src/seed/`, `bun run db:seed`) — **complete**
4. Verify migration and seed on fresh local database — **complete**
5. Update docs with setup commands.

## Rollback

- Schema changes are isolated to generated migrations.
- Slice commits can be reverted independently if tests reveal regressions.
- Failed tasks go through factory repair rather than continuing with broken state.
