# Validation Report

> Project: **portfolio-saas-crm** (`saas-crm`)  
> Generated: 2026-07-11T23:45:00.000Z  
> Scope: project (T-007-002 final validation)

## Summary

| Result | Gates passed | Gates failed | Duration |
|--------|:------------:|:------------:|---------:|
| PASS | 7 | 0 | ~169s |

## Environment

| Field | Value |
|-------|-------|
| Commit | `dcea44b` |
| Branch | `main` |
| Runtime | Bun 1.3.14 |
| Validator | Factory validation agent |

## Gate results

| Gate | Command | Exit code | Pass | Evidence |
|------|---------|:---------:|:----:|----------|
| format | `bun run format:check` | 0 | ✅ | 164 files checked after `bun run format` |
| lint | `bun run lint` | 0 | ✅ | Nursery `useSortedClasses` infos only; no errors |
| typecheck | `bun run typecheck` | 0 | ✅ | db, auth, server, web, ui packages |
| unit | `bun run test:unit` | 0 | ✅ | 56 pass (49 db + 7 auth) |
| integration | `bun run test:integration` | 0 | ✅ | 88 pass (14 db + 74 server) |
| e2e | `bun run test:e2e` | 0 | ✅ | 34 pass across 6 files |
| build | `bun run build` | 0 | ✅ | server tsdown + web vite client/ssr |

## Test totals

| Layer | Tests | Failures |
|-------|------:|---------:|
| Unit | 56 | 0 |
| Integration | 88 | 0 |
| E2E | 34 | 0 |
| **Total** | **178** | **0** |

## Authorization evidence

Integration suite covers:

- Unauthenticated 401 on protected routes
- Disabled CRM profile 403
- Representative cross-user record denial
- Administrator full access
- Admin-only `/api/admin/*` enforcement

## Accessibility and visual audit

Documented in `docs/testing.md`. No blocking findings. Manual WCAG 2.1 AA checklist satisfied for primary flows.

## Failures

None.

## Certification

All required gates executed with commands above. Overall result: **PASS**

Signed: Validation Agent · 2026-07-11T23:45:00.000Z
