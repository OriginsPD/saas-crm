# Test Strategy

## Goals

- Prove role-based CRM workflows work end to end.
- Prove server-side authorization, not client-only hiding.
- Keep tests focused on portfolio-critical behavior.
- Produce executable evidence for final validation.

## Unit Tests

| Area | Coverage |
|------|----------|
| Authorization helpers | Role grants, owner scope, team scope, deny-by-default |
| Validation | Company, contact, deal, task, activity inputs |
| Domain transforms | Deal stage transitions, task completion, report aggregations |
| UI helpers | Formatting currency, dates, status labels |

## Integration Tests

| Area | Coverage |
|------|----------|
| Auth/session | Protected routes require valid session |
| Repositories | Scoped queries for admin, manager, representative |
| API routes | CRUD and validation for CRM resources |
| Authorization | Cross-user access denied server-side |
| Database | Migration and seed data verification |

## End-To-End Tests

Critical flows:

1. Sign in as administrator, open admin dashboard, change user role.
2. Sign in as sales representative, create company and contact.
3. Create deal and move through pipeline stage.
4. Create and complete follow-up task.
5. Log activity and verify timeline.
6. Sign in as sales manager, review team reporting.
7. Attempt denied access as sales representative and verify permission state.

## Accessibility Checks

- Keyboard navigation through sign-in, shell, table, form, and modal flows.
- Visible focus states.
- Form labels and error messages.
- Semantic landmarks.
- Touch targets on mobile.
- No obvious contrast failures.
- Reduced motion support where animation exists.

## Visual Validation

Screenshots or recordings required for:

- Principal desktop dashboard.
- Principal mobile dashboard/list.
- Deal pipeline.
- Company/contact table.
- Primary create/edit form.
- Empty state.
- Validation error state.
- Permission denied state.

## Quality Gates

Required before `READY_FOR_REVIEW`:

```bash
bun run format:check
bun run lint
bun run typecheck
bun run test:unit
bun run test:integration
bun run test:e2e
bun run build
```

Actual scripts may differ and must be normalized in `package.json` during implementation.

## Evidence

Final validation report must include command, exit code, timestamp, and relevant output excerpt for each gate.
