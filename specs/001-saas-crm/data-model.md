# Data Model

## Entity Relationship Summary

```text
User 1---1 CrmProfile
Team 1---* CrmProfile
CrmProfile 1---* Company (owner)
Company 1---* Contact
Company 1---* Deal
Deal *---* Contact (deal_contacts)
Company/Contact/Deal 1---* Task
Company/Contact/Deal 1---* Activity
```

## Entities

### CrmProfile

Application-level profile linked to Better Auth user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| userId | text | yes | FK to auth `user.id`, unique |
| role | enum | yes | administrator, sales_manager, sales_representative |
| teamId | text | no | FK to Team |
| status | enum | yes | active, disabled |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### Team

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| name | text | yes | Unique in demo tenant |
| managerProfileId | text | no | Manager profile |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### Company

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| name | text | yes | Display name |
| domain | text | no | Website/domain |
| industry | text | no | Report/filter field |
| size | enum | no | startup, smb, mid_market, enterprise |
| status | enum | yes | prospect, active, archived |
| ownerProfileId | text | yes | FK to CrmProfile |
| notes | text | no | Internal notes |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### Contact

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| companyId | text | yes | FK to Company |
| firstName | text | yes | |
| lastName | text | yes | |
| title | text | no | |
| email | text | no | At least email or phone required |
| phone | text | no | At least email or phone required |
| status | enum | yes | active, archived |
| ownerProfileId | text | yes | FK to CrmProfile |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### Deal

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| companyId | text | yes | FK to Company |
| ownerProfileId | text | yes | FK to CrmProfile |
| title | text | yes | |
| valueCents | integer | yes | Non-negative |
| currency | text | yes | Default USD |
| stage | enum | yes | prospecting, qualified, proposal, negotiation, closed_won, closed_lost |
| probability | integer | yes | 0-100 |
| expectedCloseDate | date | no | Required before closing |
| closedAt | timestamp | no | Set for closed stages |
| lossReason | text | no | Required for closed_lost |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### DealContact

Join table linking contacts to deals.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| dealId | text | yes | FK to Deal |
| contactId | text | yes | FK to Contact |
| role | text | no | champion, decision_maker, influencer |

### Task

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| title | text | yes | |
| description | text | no | |
| assigneeProfileId | text | yes | FK to CrmProfile |
| relatedCompanyId | text | no | FK to Company |
| relatedContactId | text | no | FK to Contact |
| relatedDealId | text | no | FK to Deal |
| dueDate | date | no | |
| priority | enum | yes | low, medium, high |
| status | enum | yes | open, completed |
| completedAt | timestamp | no | |
| createdAt | timestamp | yes | Server-generated |
| updatedAt | timestamp | yes | Server-generated |

### Activity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | text | yes | Primary key |
| type | enum | yes | note, call, email, meeting, stage_change, task_completed |
| subject | text | yes | |
| body | text | no | |
| actorProfileId | text | yes | FK to CrmProfile |
| relatedCompanyId | text | no | FK to Company |
| relatedContactId | text | no | FK to Contact |
| relatedDealId | text | no | FK to Deal |
| occurredAt | timestamp | yes | Server-generated or user-provided |
| createdAt | timestamp | yes | Server-generated |

## Validation Rules

- Company name required; archived companies cannot receive new open deals.
- Contact requires first and last name plus at least email or phone.
- Deal value must be non-negative.
- Deal probability must be 0-100.
- Closed-won and closed-lost deals require `closedAt`.
- Closed-lost deals require `lossReason`.
- Task completion sets `completedAt`; reopening clears it.
- Activity related entity must include at least one of company, contact, or deal.

## Reporting Read Models

Reports can be query-derived rather than persisted initially:

- Pipeline value by stage.
- Deal count by stage and owner.
- Win/loss count by date range.
- Overdue open tasks by assignee.
- Activity count by type and owner.

## Seed Data Requirements

- One administrator.
- One sales manager.
- Two or more sales representatives.
- One team with manager and representatives.
- At least 20 companies, 50 contacts, 30 deals, 40 tasks, and 60 activities.
- Data should include empty states only in isolated demo views, not global blank database.
