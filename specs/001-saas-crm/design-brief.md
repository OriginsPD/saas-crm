# Design Brief

## Design Read

Reading this as: authenticated B2B SaaS CRM for sales operators and managers, with trust-first dashboard polish, leaning toward a dense but calm enterprise SaaS system.

## Required Fields

| Field | Value |
|-------|-------|
| Application type | Authenticated SaaS CRM dashboard |
| Target users | Small B2B sales teams, sales managers, sales representatives, administrators |
| Domain | Sales pipeline, account management, task follow-up, activity tracking, reporting |
| Desired visual tone | Trust-first, polished, modern B2B SaaS; credible and calm under data density |
| Information density | Medium-high for dashboards and tables; calmer forms and detail pages |
| Primary workflows | Sign in, manage companies/contacts, move deals, complete tasks, review reports, administer users |
| Accessibility expectations | WCAG 2.1 AA, visible focus, keyboard workflows, labeled controls, reduced motion support |
| Desktop and mobile requirements | Desktop-first at 1280px; tablet usable at 768px; mobile supports lists/details/forms at 320px |
| Allowed visual references | Stripe clarity, Linear density, modern CRM dashboards |
| Prohibited design patterns | Generic AI-purple gradients, stock mesh backgrounds, placeholder gray boxes, cards-inside-cards nesting, icon-only controls without labels |

## Taste Skill Dials

| Dial | Value | Rationale |
|------|-------|-----------|
| DESIGN_VARIANCE | 6 | Professional SaaS should feel polished without distracting from workflows. |
| MOTION_INTENSITY | 3 | CRM users need speed and clarity; motion only for feedback and hierarchy. |
| VISUAL_DENSITY | 7 | Dashboards and tables require useful density while preserving scanability. |

## UI Quality Requirements

- Primary navigation must make role scope obvious.
- Dashboard hierarchy: key metrics, pipeline health, task pressure, recent activity, detail tables.
- Tables must support readable density, sorting/filtering where specified, and designed empty states.
- Forms must include labels, helper text where useful, inline validation, loading state, and success/error feedback.
- Mobile layouts must prioritize search, lists, detail summaries, and key actions.
- Charts must not rely on color alone; labels or legends are required.
- Every primary page must define loading, empty, error, and permission-denied states.
