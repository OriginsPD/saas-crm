# Traceability Matrix

Project: `saas-crm`

## Catalog Required Outcomes

| Catalog outcome | Specification coverage | Acceptance coverage | Test coverage |
|-----------------|------------------------|---------------------|---------------|
| Manage companies and contacts. | User Story 2; FR-004, FR-005, FR-006; Company and Contact entities | Company creation, contact linking, form validation, manager visibility | Unit validation tests; integration repository/route tests; e2e company/contact flow |
| Maintain deals in stage-based pipeline. | User Story 3; FR-007, FR-008, FR-009; Deal and PipelineStage entities | Deal creation, stage movement, close outcome, denied cross-user mutation | Unit stage transition tests; integration authorization tests; e2e pipeline flow |
| View team performance. | User Story 5; FR-014, FR-015; ReportMetric entity | Team pipeline totals, role-scoped reports, date/owner filters | Unit report aggregation tests; integration report route tests; e2e manager reporting flow |
| Manage users and permissions. | User Story 6; FR-016; AR-001 through AR-006; User and Team entities | User creation, role change, non-admin denial | Unit permission tests; integration auth/role tests; e2e admin role management flow |

## Capabilities Coverage

| Capability | Spec reference |
|------------|----------------|
| authentication | User Story 1; FR-001; AR-001 |
| role_based_access | User Stories 1, 5, 6; FR-002, FR-003; AR-001 through AR-006 |
| company_management | User Story 2; FR-004; Company entity |
| contact_management | User Story 2; FR-005, FR-006; Contact entity |
| deal_pipeline | User Story 3; FR-007 through FR-009; Deal and PipelineStage entities |
| tasks | User Story 4; FR-010, FR-011; Task entity |
| activity_timeline | User Story 4; FR-012, FR-013; Activity entity |
| reporting | User Story 5; FR-014, FR-015; ReportMetric entity |

## Portfolio Focus Coverage

| Focus | Planned evidence |
|-------|------------------|
| business_workflows | End-to-end flows for company/contact, pipeline, task, report, admin. |
| relational_data_modeling | Data model with users, teams, companies, contacts, deals, tasks, activities, reports. |
| dashboard_design | Design brief and Taste Skill review during UI implementation. |
| authorization | Authorization matrix, server-side enforcement, role violation tests. |
| automated_testing | Unit, integration, e2e, accessibility, and quality gate evidence. |
