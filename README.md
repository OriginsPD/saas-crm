# portfolio-saas-crm

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Elysia, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Elysia** - Type-safe, high-performance framework
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Environment Setup

Copy `.env.example` to the environment files used by the scaffold. Keep real `.env` files out of git.

Required local values:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle and the API |
| `BETTER_AUTH_SECRET` | Better Auth signing secret; must be at least 32 characters |
| `BETTER_AUTH_URL` | API/auth origin, default `http://localhost:3000` |
| `CORS_ORIGIN` | Web origin allowed by the API, default `http://localhost:3001` |
| `VITE_SERVER_URL` | Web client API base URL |
| `NODE_ENV` | `development`, `test`, or `production` |

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Start the scaffolded Docker database:

```bash
bun run db:start
```

2. Apply schema changes:

```bash
bun run db:generate
bun run db:migrate
```

For early scaffold validation before migrations exist, use:

```bash
bun run db:push
```

Seed demo CRM data after migrations:

```bash
bun run db:seed
```

Demo accounts (local development only):

| Role | Email | Password |
|------|-------|----------|
| administrator | admin@example.test | DemoAdmin123! |
| sales_manager | manager@example.test | DemoManager123! |
| sales_representative | rep@example.test | DemoRep123! |

Then run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Portfolio and validation

| Document | Purpose |
|----------|---------|
| `demo-guide.md` | Demo walkthrough and accounts |
| `VALIDATION_REPORT.md` | Full quality gate evidence |
| `docs/testing.md` | Test strategy and a11y audit |
| `portfolio/case-study.md` | Portfolio narrative |
| `portfolio/upwork-description.md` | Client-facing summary |

Run final gate: `bun run quality:all`

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@portfolio-saas-crm/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Run checks: `bun run check`
- Check formatting: `bun run format:check`
- Lint only: `bun run lint`
- Type check: `bun run typecheck`
- Run current test placeholders: `bun run test`
- Full local quality gate: `bun run quality:all`

## Project Structure

```
portfolio-saas-crm/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   └── server/      # Backend API (Elysia)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run typecheck`: Alias for `check-types`
- `bun run format`: Write Biome formatting
- `bun run format:check`: Check Biome formatting
- `bun run lint`: Run Biome lint
- `bun run test`: Run configured unit, integration, and e2e commands
- `bun run quality:all`: Run formatting, linting, type checking, tests, and build
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:seed`: Seed local demo users and CRM records
- `bun run db:studio`: Open database studio UI
- `bun run check`: Run Biome formatting and linting
