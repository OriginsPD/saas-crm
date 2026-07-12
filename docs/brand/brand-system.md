# Brand System — SaaS CRM

> Source: brandkit board (`brand-kit.png`) · Applied to `packages/ui/src/styles/globals.css`

## Design Read

Reading this as: B2B SaaS CRM for sales teams, with a trust-first professional language, leaning toward shadcn/ui + navy/teal identity.

## Logo

| Asset | Path | Usage |
|-------|------|-------|
| Logo mark | `docs/brand/logo-mark.svg` | Header, auth shell, favicon source |
| Brand board | `docs/brand/brand-kit.png` | Reference deck |

**Mark meaning:** Connected nodes — pipeline stages, relationships, team coordination.

## Color palette

| Token | Hex | Role |
|-------|-----|------|
| Navy | `#1e3a5f` | Primary brand, headers |
| Teal | `#0d9488` | Primary action, links, focus |
| Teal light | `#5eead4` | Accent highlights |
| Slate 50 | `#f8fafc` | Page background |
| Slate 900 | `#0f172a` | Body text |
| Slate 500 | `#64748b` | Muted text |
| Border | `#e2e8f0` | Cards, dividers |

## Typography

| Role | Family | Notes |
|------|--------|-------|
| Display + UI | DM Sans | Professional, readable at dashboard density |
| Mono (optional) | ui-monospace | Metrics, IDs |

## UI rules

- Landing + auth share header logo and primary teal CTA
- Dashboard keeps shadcn structure; brand via tokens not one-off colors
- Motion: restrained on auth; optional hero motion per gpt-taste on landing only
- No AI-purple gradients

## CSS variables applied

See `:root` in `packages/ui/src/styles/globals.css` — primary mapped to navy/teal scale.
