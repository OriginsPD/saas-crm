# Authorization Matrix

## Roles

| Role | Description |
|------|-------------|
| administrator | Full CRM and user administration access. |
| sales_manager | Team oversight, team data management, reporting. |
| sales_representative | Own assigned CRM records and daily sales activity. |

## Permission Matrix

| Resource / Action | Administrator | Sales Manager | Sales Representative |
|-------------------|---------------|---------------|----------------------|
| Sign in/out | Allow | Allow | Allow |
| View own profile | Allow | Allow | Allow |
| Manage users | Allow | Deny | Deny |
| Change roles | Allow | Deny | Deny |
| Disable users | Allow | Deny | Deny |
| View all teams | Allow | Own/team only | Deny |
| Manage teams | Allow | Deny | Deny |
| View companies | All | Team-owned | Own/assigned |
| Create companies | Allow | Allow | Allow |
| Edit companies | All | Team-owned | Own/assigned |
| Archive companies | All | Team-owned | Own/assigned when no active deals |
| View contacts | All | Team-owned | Own/assigned |
| Create contacts | Allow | Allow | Allow |
| Edit contacts | All | Team-owned | Own/assigned |
| Archive contacts | All | Team-owned | Own/assigned |
| View deals | All | Team-owned | Own/assigned |
| Create deals | Allow | Allow | Allow |
| Edit deals | All | Team-owned | Own/assigned |
| Move deal stage | All | Team-owned | Own/assigned |
| Close deal | All | Team-owned | Own/assigned |
| View tasks | All | Team-owned | Assigned/created/related own records |
| Create tasks | Allow | Team-owned assignees | Self or own records |
| Complete tasks | All | Team-owned | Assigned/created |
| View activity | All | Team-owned | Own/assigned related records |
| Create activity | Allow | Allow | Allow for own/assigned records |
| View reports | All | Team reports | Own reports |
| Export reports | Allow | Team reports | Deny |

## Server-Side Enforcement Rules

- Authentication required for every `/api/crm/*` and `/api/admin/*` route.
- Role and scope checks occur before database mutation.
- Repository queries must include scope predicates derived from authenticated profile.
- Denied requests return `403` without leaking existence of inaccessible records when possible.
- Unauthenticated requests return `401`.
- Disabled users cannot access protected API or UI.

## Ownership Scope

| Scope | Definition |
|-------|------------|
| all | No owner/team filter, administrator only. |
| team-owned | Records owned by profiles in manager team or assigned to manager team. |
| own/assigned | Records owned by profile, assigned to profile, or explicitly related to profile-owned records. |

## Required Authorization Tests

- Unauthenticated user cannot access CRM API.
- Sales representative cannot read another representative's private deal.
- Sales representative cannot mutate team report filters to access another team.
- Sales manager cannot manage users.
- Sales manager can view team pipeline but not unrelated team data.
- Administrator can change role and disabled status.
- Disabled user cannot access dashboard after status change.
