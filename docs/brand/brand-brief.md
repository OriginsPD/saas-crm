# Brand Brief — SaaS CRM

> Project: **saas-crm**  
> Run **brandkit** skill to generate `brand-kit.png`, `logo-mark.svg`, and `brand-system.md`.

## Category

Multi-role CRM for companies, contacts, deals, tasks, and sales activity. > **Note:** Starting point only. Domain rules, authorization matrix, and acceptance criteria > require specification via Spec Kit before implementation.

## Audience

Professional business users evaluating a credible, modern product.

## Emotional promise

Trustworthy, capable, polished — not generic AI startup.

## Visual world

- Modern professional SaaS
- Restrained motion (gpt-taste only on landing hero if selected)
- shadcn/ui primitives + custom brand tokens

## Symbol logic (for logo)

Infer from domain: growth, pipeline, connection, clarity, or workflow completion.

## Deliverables

| Asset | Format | Usage |
|-------|--------|-------|
| Brand kit board | PNG | Reference for full identity |
| Logo mark | SVG | Site header, auth shell, favicon source |
| Brand system doc | Markdown | Colors, typography, spacing rules |

## Apply to code

1. Map palette → CSS variables in `packages/ui/src/styles/globals.css`
2. Place `logo-mark.svg` in `apps/web/public/brand/`
3. Reference logo in `site-header.tsx` and `auth-shell.tsx`
4. Document Design Read in `docs/design-profile.json`

## Avoid

- AI-purple gradient meshes
- Generic glassmorphism
- Inter + slate-900 defaults without intention
