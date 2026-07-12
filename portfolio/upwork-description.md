# Upwork Project Description — Portfolio SaaS CRM

## Title

Full-Stack B2B CRM — React, Elysia, PostgreSQL, Role-Based Access

## Summary

Built a production-quality portfolio CRM for small B2B sales teams. Three roles (administrator, sales manager, sales representative) with server-enforced permissions. Covers companies, contacts, deal pipeline, tasks, activity history, manager reports, and admin user management.

## Deliverables

- Authenticated web app (TanStack Start + React)
- REST-style Elysia API with Better Auth sessions
- PostgreSQL schema via Drizzle ORM + migrations
- Idempotent demo seed script with documented test accounts
- 178 automated tests (unit, integration, e2e)
- Full validation report and demo guide

## Stack

TypeScript · Bun · TanStack Start · Elysia · PostgreSQL · Drizzle · Better Auth · Tailwind · shadcn/ui · Biome

## Highlights for clients

- **Security first:** Authorization enforced on server, not UI-only hiding
- **Test evidence:** Every major workflow covered by integration/e2e tests
- **Clean monorepo:** Separated db, auth, API, and UI packages
- **Demo-ready:** One-command seed populates credible sales data

## Ideal for portfolios showcasing

- SaaS dashboard UX
- CRM / sales pipeline domain modeling
- RBAC and multi-tenant-style scope patterns
- Spec-driven delivery with quality gates

## Demo

Local setup: `bun install` → `db:start` → `db:migrate` → `db:seed` → `dev`

Accounts documented in `demo-guide.md`.
