# API Contract

Base path: `http://localhost:3000/api`

Auth path: `/api/auth/*` handled by Better Auth.

All CRM endpoints require authenticated session unless explicitly noted.

## Shared Response Shapes

```ts
type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

## Profile

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/me` | Current user profile, role, navigation permissions | all authenticated |

## Companies

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/companies` | List/search/filter scoped companies | all authenticated |
| POST | `/crm/companies` | Create company | all authenticated |
| GET | `/crm/companies/:id` | Company detail with contacts, deals, tasks, activity | scoped |
| PATCH | `/crm/companies/:id` | Update company | scoped |
| POST | `/crm/companies/:id/archive` | Archive company | scoped |

### Company Payload

```ts
type CompanyInput = {
  name: string;
  domain?: string;
  industry?: string;
  size?: "startup" | "smb" | "mid_market" | "enterprise";
  status?: "prospect" | "active" | "archived";
  notes?: string;
};
```

## Contacts

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/contacts` | List/search/filter scoped contacts | all authenticated |
| POST | `/crm/contacts` | Create contact | all authenticated |
| GET | `/crm/contacts/:id` | Contact detail | scoped |
| PATCH | `/crm/contacts/:id` | Update contact | scoped |
| POST | `/crm/contacts/:id/archive` | Archive contact | scoped |

### Contact Payload

```ts
type ContactInput = {
  companyId: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  status?: "active" | "archived";
};
```

## Deals

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/deals` | List/filter scoped deals | all authenticated |
| POST | `/crm/deals` | Create deal | all authenticated |
| GET | `/crm/deals/pipeline` | Pipeline grouped by stage | all authenticated |
| GET | `/crm/deals/:id` | Deal detail | scoped |
| PATCH | `/crm/deals/:id` | Update deal | scoped |
| POST | `/crm/deals/:id/stage` | Move deal stage and record activity | scoped |

### Deal Payload

```ts
type DealInput = {
  companyId: string;
  title: string;
  valueCents: number;
  currency?: "USD";
  stage: "prospecting" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  expectedCloseDate?: string;
  contactIds?: string[];
};
```

## Tasks

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/tasks` | List scoped tasks | all authenticated |
| POST | `/crm/tasks` | Create task | all authenticated |
| PATCH | `/crm/tasks/:id` | Update task | scoped |
| POST | `/crm/tasks/:id/complete` | Complete task | scoped |
| POST | `/crm/tasks/:id/reopen` | Reopen task | scoped |

## Activity

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/activity` | List scoped activity | all authenticated |
| POST | `/crm/activity` | Log activity | all authenticated |

## Reports

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/crm/reports/pipeline` | Pipeline totals and counts | all authenticated, scoped |
| GET | `/crm/reports/performance` | Team or own performance | all authenticated, scoped |
| GET | `/crm/reports/tasks` | Task completion and overdue counts | all authenticated, scoped |

## Admin

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/admin/users` | List users and CRM profiles | administrator |
| POST | `/admin/users` | Create demo user/profile | administrator |
| PATCH | `/admin/users/:id/role` | Change user role/team | administrator |
| PATCH | `/admin/users/:id/status` | Activate/disable user | administrator |

## Error Codes

| Code | Meaning |
|------|---------|
| `UNAUTHENTICATED` | No valid session |
| `FORBIDDEN` | Role/scope denied |
| `NOT_FOUND` | Record missing or inaccessible |
| `VALIDATION_ERROR` | Invalid input |
| `CONFLICT` | Duplicate or invalid state transition |
| `INTERNAL_ERROR` | Unexpected server error |
