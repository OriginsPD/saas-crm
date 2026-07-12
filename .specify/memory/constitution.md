# Portfolio SaaS CRM Constitution

## Core Principles

### I. Specification Is Source Of Truth

All implementation work must trace to `specs/` artifacts. Catalog entries provide starting intent, but feature specifications, plans, and tasks define executable scope. If implementation and spec diverge, update the spec or block the task before coding.

### II. Server-Side Authorization

Role permissions must be enforced on server routes and data access paths. Client navigation and UI hiding are usability helpers only. Tests must cover unauthenticated access, role violations, and cross-user data access.

### III. Evidence-Based Quality

No work is complete without executable evidence. Formatting, linting, type checking, tests, database migration verification, production build, accessibility checks, and authorization tests must be run when applicable and recorded in validation artifacts.

### IV. Vertical Slices

Tasks should deliver small user-visible slices across data model, API/server behavior, UI, and tests. Avoid implementing all database work, all API work, or all UI work as isolated phases unless the spec explicitly requires it.

### V. Professional Portfolio UX

The CRM should demonstrate polished dashboard design, clear hierarchy, credible sample data, responsive layouts, and accessible interactions. Taste Skill guidance applies to visual design phases, but accessibility, security, and business rules override aesthetics.

## Additional Constraints

- Stack: TanStack Start frontend, Elysia backend, Bun runtime, Better Auth, PostgreSQL, Drizzle, Biome, Evlog.
- Database mutations must use validated inputs and preserve tenant/user ownership boundaries.
- Demo data must be credible for a small B2B sales team.
- No production credentials, tokens, or real customer data may be committed.
- `.env.example` must document required local variables.

## Development Workflow

1. Read active spec, plan, task, and constitution before coding.
2. Implement one bounded task at a time.
3. Add or update tests with each task.
4. Run targeted checks first, then applicable quality gates.
5. Record validation evidence before marking work complete.
6. Stop at `READY_FOR_REVIEW`; human approval is required before publication.

## Governance

This constitution applies to all generated project work. Changes require a documented reason in the relevant spec or plan artifact, plus validation that quality, accessibility, and authorization standards remain intact.

**Version**: 1.0.0 | **Ratified**: 2026-07-11 | **Last Amended**: 2026-07-11
