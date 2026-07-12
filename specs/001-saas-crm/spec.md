# Feature Specification: SaaS CRM

**Feature Branch**: `001-saas-crm`

**Created**: 2026-07-11

**Status**: Draft

**Input**: Portfolio catalog entry `saas-crm`

## Product Summary

Portfolio SaaS CRM is a multi-role customer relationship management platform for small B2B sales teams. It demonstrates authentication, role-based authorization, relational data modeling, dashboard design, and automated testing through realistic workflows for companies, contacts, deals, tasks, activity history, reporting, and user management.

## Target Users And Roles

- **Administrator**: Configures users, roles, permissions, and system-level demo data.
- **Sales Manager**: Oversees team pipeline, reviews reporting, manages assigned reps, and audits activity.
- **Sales Representative**: Maintains owned companies, contacts, deals, tasks, and sales activity.

## Explicit Exclusions

- Real payment processing.
- Production email delivery.
- Native mobile application.
- Multi-region deployment.
- Third-party CRM integrations.
- AI lead scoring.
- Public self-service customer portal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticate And Enter Role-Specific Workspace (Priority: P1)

Users sign in and land on a workspace appropriate to their role. Unauthorized users cannot access protected CRM pages.

**Why this priority**: All CRM workflows require identity, sessions, and role enforcement.

**Independent Test**: Can be tested by signing in as each seeded role and verifying the role-specific dashboard, navigation, and access restrictions.

**Acceptance Scenarios**:

1. **Given** a valid administrator account, **When** the user signs in, **Then** the admin dashboard and user management navigation are visible.
2. **Given** a valid sales manager account, **When** the user signs in, **Then** the manager sees team pipeline and reporting navigation.
3. **Given** a valid sales representative account, **When** the user signs in, **Then** the representative sees owned accounts, deals, tasks, and activity.
4. **Given** an unauthenticated visitor, **When** they request a protected CRM page, **Then** they are redirected or denied without data leakage.

---

### User Story 2 - Manage Companies And Contacts (Priority: P1)

Sales users maintain company records and associated contacts with enough detail to support pipeline work.

**Why this priority**: Companies and contacts are foundational CRM entities used by deals, tasks, and activity history.

**Independent Test**: Can be tested by creating a company, adding contacts, editing fields, searching the list, and verifying relational links.

**Acceptance Scenarios**:

1. **Given** a signed-in sales representative, **When** they create a company with required fields, **Then** it appears in the company list and detail page.
2. **Given** a company exists, **When** the user adds a contact, **Then** the contact is linked to the company and appears on both contact and company views.
3. **Given** invalid required fields, **When** the user submits a company or contact form, **Then** inline validation errors explain required corrections.
4. **Given** a sales manager, **When** they view team companies, **Then** records owned by their team are visible according to authorization rules.

---

### User Story 3 - Maintain Deal Pipeline (Priority: P1)

Sales representatives track deals through stage-based pipeline states with value, expected close date, owner, company, contacts, and activity.

**Why this priority**: Pipeline management is the core portfolio workflow and demonstrates relational state changes.

**Independent Test**: Can be tested by creating a deal, moving it between stages, updating value and probability, and verifying pipeline totals.

**Acceptance Scenarios**:

1. **Given** a company exists, **When** a sales representative creates a deal, **Then** it appears in pipeline stage, company detail, and reporting summaries.
2. **Given** a deal in an open stage, **When** the owner moves it to another stage, **Then** stage history and updated totals are recorded.
3. **Given** a deal reaches closed-won or closed-lost, **When** the user saves the stage, **Then** close date and final outcome are reflected in reports.
4. **Given** a user without permission, **When** they attempt to mutate another user's restricted deal, **Then** the server rejects the request.

---

### User Story 4 - Manage Tasks And Activity Timeline (Priority: P2)

Sales users create follow-up tasks and record activities so account history is visible.

**Why this priority**: Tasks and activities show workflow completeness beyond CRUD screens.

**Independent Test**: Can be tested by adding calls, notes, emails, and follow-up tasks to a deal or company.

**Acceptance Scenarios**:

1. **Given** a deal or company, **When** a user logs a call, email, note, or meeting, **Then** the activity appears in chronological timeline.
2. **Given** a task has a due date and owner, **When** it is created, **Then** it appears in the assignee's task list and related entity timeline.
3. **Given** a task is completed, **When** the user marks it done, **Then** completion is timestamped and reporting updates.

---

### User Story 5 - View Team Performance Reporting (Priority: P2)

Managers view pipeline totals, conversion rates, win/loss summaries, overdue tasks, and activity volume.

**Why this priority**: Reporting demonstrates aggregation, dashboard design, and manager-specific authorization.

**Independent Test**: Can be tested using seeded team data and verifying report numbers against known fixture records.

**Acceptance Scenarios**:

1. **Given** manager role, **When** they open reporting, **Then** team pipeline value, deal counts by stage, and activity summaries are visible.
2. **Given** a sales representative role, **When** they open reporting, **Then** they see only their own performance data unless otherwise permitted.
3. **Given** filters by date range and owner, **When** filters are applied, **Then** reports update and preserve accessible data boundaries.

---

### User Story 6 - Administer Users And Permissions (Priority: P2)

Administrators manage demo users, assign roles, and verify permission boundaries.

**Why this priority**: The portfolio must show role-based access and system administration.

**Independent Test**: Can be tested by changing a user's role and verifying access changes without modifying code.

**Acceptance Scenarios**:

1. **Given** administrator role, **When** they invite or create a user, **Then** the user is listed with role and status.
2. **Given** administrator role, **When** they change a user's role, **Then** server-side permissions reflect the new role on the next request.
3. **Given** non-admin role, **When** they request user management routes or mutations, **Then** access is denied.

## Edge Cases

- Duplicate company names are allowed only when domain, owner, or other distinguishing fields differ; exact duplicates warn before save.
- Contacts may exist without email only if phone or alternate identifier is present.
- Deals cannot move to closed-won or closed-lost without required closing metadata.
- Deleting a company with active deals is blocked; archiving is preferred.
- Activity timestamps use server time and display in local browser time.
- Empty states show useful next actions instead of blank tables.
- Large tables paginate or virtualize to keep interaction responsive.
- Expired sessions redirect without losing unsaved form input when practical.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide authenticated access using Better Auth sessions.
- **FR-002**: System MUST define roles: administrator, sales_manager, sales_representative.
- **FR-003**: System MUST enforce role permissions on server-side routes and mutations.
- **FR-004**: Users MUST be able to create, view, edit, archive, search, and filter companies.
- **FR-005**: Users MUST be able to create, view, edit, archive, search, and filter contacts.
- **FR-006**: Contacts MUST support association with one primary company and optional deal involvement.
- **FR-007**: Users MUST be able to create and maintain deals linked to companies, contacts, owners, values, probabilities, close dates, and stages.
- **FR-008**: System MUST provide a stage-based pipeline view with totals by stage.
- **FR-009**: System MUST record deal stage changes in activity history.
- **FR-010**: Users MUST be able to create, assign, complete, and filter tasks.
- **FR-011**: Tasks MUST support relation to company, contact, or deal where applicable.
- **FR-012**: Users MUST be able to log sales activities including note, call, email, and meeting.
- **FR-013**: Activity timeline MUST display events in reverse chronological order with actor and timestamp.
- **FR-014**: Sales managers MUST be able to view team performance dashboards and reports.
- **FR-015**: Sales representatives MUST see only permitted personal or assigned-team data.
- **FR-016**: Administrators MUST be able to manage users, roles, and account status.
- **FR-017**: System MUST seed credible demo data and documented demo accounts.
- **FR-018**: System MUST include validation errors for invalid forms and protected mutations.
- **FR-019**: System MUST provide loading, empty, error, and success states for primary workflows.
- **FR-020**: System MUST generate validation evidence before reaching review.

### Non-Functional Requirements

- **NFR-001**: Primary pages MUST render responsively at 320px, 768px, and 1280px widths.
- **NFR-002**: Accessibility target is WCAG 2.1 AA.
- **NFR-003**: Primary dashboard interactions SHOULD complete within two seconds on local demo data.
- **NFR-004**: No known browser console errors may remain in primary workflows.
- **NFR-005**: Audit-relevant mutations MUST capture actor, timestamp, and affected entity.
- **NFR-006**: Data access MUST fail closed when user ownership or role cannot be established.
- **NFR-007**: `.env.example` MUST document all required local variables.

### Authorization Requirements

- **AR-001**: Unauthenticated users may access only public sign-in and health-safe public assets.
- **AR-002**: Administrators may manage all CRM data and users.
- **AR-003**: Sales managers may view and report on team data, reassign team-owned records, and review activity.
- **AR-004**: Sales representatives may manage records they own or are assigned to.
- **AR-005**: Cross-user mutation attempts must be rejected by server-side authorization.
- **AR-006**: Authorization tests must cover each role and at least one denied path per protected resource.

### Test Requirements

- **TR-001**: Unit tests MUST cover validation, authorization helpers, and domain transformations.
- **TR-002**: Integration tests MUST cover authentication, protected server routes, database repositories, and role violations.
- **TR-003**: End-to-end tests MUST cover sign-in, company/contact management, deal pipeline, task completion, manager report, and admin role management.
- **TR-004**: Accessibility checks MUST cover keyboard navigation, labels, focus states, semantic landmarks, and obvious contrast failures.
- **TR-005**: Migration verification MUST run when schema changes are introduced.

### Key Entities

- **User**: Authenticated actor with name, email, role, status, team relationship, and audit metadata.
- **Team**: Grouping used for manager visibility and representative assignment.
- **Company**: Organization with name, domain, industry, size, lifecycle status, owner, contacts, deals, tasks, and activity.
- **Contact**: Person associated with a company, with name, title, communication fields, status, owner, deals, tasks, and activity.
- **Deal**: Sales opportunity with title, company, contacts, value, stage, probability, close date, owner, outcome, tasks, and activity.
- **PipelineStage**: Ordered deal state such as prospecting, qualified, proposal, negotiation, closed-won, closed-lost.
- **Task**: Follow-up item with title, due date, priority, assignee, status, and optional related entity.
- **Activity**: Timeline event with type, subject, notes, actor, timestamp, and related entity.
- **ReportMetric**: Aggregated read model for dashboard and reporting views.

## Design Brief

- **Application type**: Authenticated SaaS CRM dashboard.
- **Target users**: Small B2B sales teams; daily operational users who need speed, confidence, and clear prioritization.
- **Domain**: Customer relationship management, sales pipeline, tasks, reporting.
- **Desired visual tone**: Trust-first, polished, data-rich, modern B2B SaaS; no generic dark mesh hero.
- **Information density**: Medium-high for dashboards and tables; calmer detail pages and forms.
- **Primary workflows**: Sign in, manage companies/contacts, move deals, complete tasks, review manager reports, administer users.
- **Accessibility expectations**: WCAG 2.1 AA, keyboard-accessible tables/forms/modals, visible focus, reduced-motion support.
- **Desktop and mobile requirements**: Desktop-first dashboard at 1280px; tablet usable at 768px; mobile supports core lists, detail views, and forms at 320px.
- **Allowed visual references**: Stripe-style clarity, Linear-style density, modern CRM dashboard patterns.
- **Prohibited design patterns**: Placeholder gray boxes, generic AI-purple gradients, cards inside cards inside cards, icon-only unlabeled actions, lorem ipsum.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A demo user can sign in and reach their role-specific dashboard in under two minutes from clean setup.
- **SC-002**: A sales representative can create a company, contact, deal, task, and activity in one end-to-end flow.
- **SC-003**: A manager can verify team pipeline value and stage counts from seeded data.
- **SC-004**: An administrator can change a user role and observe access changes without code changes.
- **SC-005**: Authorization tests pass for unauthenticated access, role violation, and object ownership violation.
- **SC-006**: Formatting, linting, type checking, unit tests, integration tests, e2e tests, production build, and applicable accessibility checks pass before review.

## Assumptions

- Demo runs as a single-tenant portfolio app with seeded users and data.
- Email delivery is simulated or documented; no external email provider required for core demo.
- Payment features are out of scope.
- Reports use local relational data and do not require external analytics services.
- Representative visibility is owner-based; manager visibility is team-based.
- The project may add task-specific libraries only when justified by plan and tests.

## Unresolved Questions

No blocking questions. Non-blocking assumptions are documented in `assumptions.md` and may be revised during planning.
