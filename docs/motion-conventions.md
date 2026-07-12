# Motion conventions (motion.dev)

Generated React web projects use [Motion](https://motion.dev) (`motion` package) for landing and marketing animation when **gpt-taste** is selected.

## Import

```tsx
import { motion, useReducedMotion } from "motion/react";
import { editorialEase, heroItemVariants, heroStaggerVariants } from "@/lib/motion";
```

## Rules

1. **Landing/marketing only** — no motion on auth forms or dense dashboards unless spec requires it.
2. **`useReducedMotion()`** — skip `initial` / `whileInView` when user prefers reduced motion.
3. **Hero** — stagger via `heroStaggerVariants` + `heroItemVariants` in `@/lib/motion`.
4. **Scroll reveals** — `whileInView` with `viewport={{ once: true }}`, not scroll listeners.
5. **Ease** — use `editorialEase` from `@/lib/motion` for gpt-taste polish.

## gpt-taste extension

When expanding landing sections:

- Pin/stack/scrub only when spec calls for cinematic marketing — default is restrained `whileInView`.
- Keep typography readable; motion supports hierarchy, never competes with it.
- Test with reduced motion enabled in OS settings.

## Dependency

Installed in `apps/web` on init when `ui.frontFacingPages.motion.installMotionPackage` is true.
