# Quickstart

## Prerequisites

- Bun 1.3.14+
- Docker Desktop
- PostgreSQL via scaffolded Docker setup

## Install

```bash
bun install
```

## Environment

Copy `.env.example` to local environment files used by the scaffold. Required values:

```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/portfolio-saas-crm
BETTER_AUTH_SECRET=replace-with-at-least-32-character-local-secret
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
VITE_SERVER_URL=http://localhost:3000
NODE_ENV=development
```

Never commit `.env` files.

## Database

```bash
bun run db:start
bun run db:generate
bun run db:migrate
```

Seed command will be added during implementation:

```bash
bun run db:seed
```

## Develop

```bash
bun run dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:3000`

## Demo Accounts

Local demo credentials (not production secrets):

| Role | Email | Password |
|------|-------|----------|
| administrator | admin@example.test | DemoAdmin123! |
| sales_manager | manager@example.test | DemoManager123! |
| sales_representative | rep@example.test | DemoRep123! |

## Baseline Validation

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

Full quality gate:

```bash
bun run quality:all
```
