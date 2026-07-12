# Brandkit generation (agent)

1. Attach **brandkit** skill in Cursor.
2. Read `brand-brief.md` in this directory.
3. Generate:
   - `brand-kit.png` — full identity board (logo, palette, type, UI mockup panel)
   - `logo-mark.svg` — header/auth logo mark
4. Write `brand-system.md` with:
   - Primary / secondary / accent hex values
   - Font families (display + body)
   - Logo usage rules
5. Apply tokens to `packages/ui/src/styles/globals.css` CSS variables.
6. Use logo in landing header + auth shell.
7. Set `generated: true` in `brand-manifest.json`.

**Standard:** modern, professional, trust-first. No generic AI-purple gradients.
