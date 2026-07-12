# Assumptions

> Project: **Portfolio SaaS CRM** (`saas-crm`)  
> Last updated: 2026-07-11

## Business Assumptions

| ID | Assumption | Impact if wrong |
|----|------------|-----------------|
| A-001 | The CRM is a single-tenant portfolio demo for one fictional company. | Multi-tenant data isolation and tenant admin flows would need additional design, tests, and authorization rules. |
| A-002 | Core value is demonstrating B2B sales workflow depth, not replacing a commercial CRM. | Advanced integrations and enterprise settings remain out of scope. |
| A-003 | Seeded data represents a small sales team with managers and representatives. | Reporting and authorization fixtures would need revision. |
| A-004 | Email delivery can be simulated or documented for local demo. | Real provider integration would add credentials, error handling, and tests. |

## Technical Assumptions

| ID | Assumption | Validation |
|----|------------|------------|
| T-001 | Stack: TanStack Start + Elysia + Bun. | Better-T-Stack scaffold verified. |
| T-002 | Database: PostgreSQL via Docker setup. | `bun run db:start` and migration checks. |
| T-003 | Auth: Better Auth with server-side session checks. | Auth integration and e2e sign-in tests. |
| T-004 | ORM: Drizzle with generated migrations. | Migration verification and repository integration tests. |
| T-005 | UI package uses shared shadcn primitives through `packages/ui`. | Component import and build checks. |

## User Assumptions

| ID | Assumption | Source |
|----|------------|--------|
| U-001 | Primary roles are administrator, sales_manager, and sales_representative. | `PROJECTS.md` |
| U-002 | Sales managers oversee one or more representatives. | CRM domain convention; required reporting outcome. |
| U-003 | Representatives own most day-to-day company, contact, deal, task, and activity work. | `PROJECTS.md` capabilities. |

## Out Of Scope

- Production multi-region deployment.
- Native mobile applications.
- Real payment processing.
- Third-party CRM integrations.
- AI features.
- Public customer portal.
- Real email/SMS delivery unless later specified.

## Dependencies On External Services

| Service | Required | Fallback |
|---------|----------|----------|
| PostgreSQL Docker container | Yes | Local PostgreSQL with matching `DATABASE_URL`. |
| Email provider | No | Documented mock flow or local-only demo. |
| GitHub remote | No | Local portfolio review works without remote publishing. |

## Open Questions

| ID | Question | Status | Resolution |
|----|----------|--------|------------|
| Q-001 | Should demo include real email delivery? | non-blocking | Default to simulated/documented email. |
| Q-002 | Should managers reassign deals across teams? | non-blocking | Default to within-team reassignment only. |
| Q-003 | Should duplicate companies be globally blocked? | non-blocking | Default to warning on exact duplicates, not hard block. |

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | Factory Agent | Initial assumptions from catalog and constitution. |
