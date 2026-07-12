# Motion React automation reference

Canonical pattern catalog for [`motion`](https://motion.dev) / `motion/react` in factory-generated React web projects.

## Purpose and refresh

- Generated: 2026-07-12T02:13:01.728Z
- Platform: react
- Example count: 199
- Regenerate: `bun run references:motion` from factory root

Agents must consult this file before implementing non-trivial animation or interaction motion.

## Motion+ policy

53 examples reference Motion+ APIs or premium source.

- Do **not** assume Motion+ source code is available in this repository.
- Treat Motion+ entries as **interaction references** — infer UX intent, reimplement with free APIs or simpler patterns.
- Do **not** invent premium Motion+ APIs (`AnimateView`, curtains, etc.) without spec approval and license.

## Reuse tiers

| Tier | Count | Meaning |
|------|-------|---------|
| direct | 49 | Copy/adapt freely with `motion/react` |
| adapt | 97 | Adapt pattern; verify APIs and a11y |
| interaction-reference-only | 53 | Motion+ or inaccessible — UX reference only |

## Project-type selectors

### SaaS / CRM / dashboard / admin / ops

Signals: crm, saas, dashboard, admin, inventory, booking, finance, report, ops
Prefer categories: Layout animations, Loading, Lists, Dialog, Forms, Navigation, Base UI, Radix, Interactions, Buttons
Avoid by default: Cursor, Experimental, Page transitions, Game UI, Ticker
Preferred patterns:
- layout animation
- shared layout animation
- enter and exit transitions
- smooth tabs
- skeleton loading
- progress indicators
- toast notifications
- animated status badges
- number trends
- sheets and dialogs
- reorder animations

### Marketing / landing / portfolio hero

Signals: portfolio, marketing, landing, hero, creative, ai
Prefer categories: Heros, Scroll, Basics, Layout animations, Buttons, Navigation, Loading
Allow (marketing only): Carousel, Text, Page transitions
Avoid by default: Cursor, Experimental, Game UI
Preferred patterns:
- hero stagger
- whileInView section reveals
- header entrance
- restrained scroll highlights

### Portfolio / editorial / immersive

Signals: editorial, blog, content, immersive
Prefer categories: Scroll, Text, Page transitions, Carousel, Layout animations
Allow (marketing only): Cursor, Experimental, Ticker
Avoid by default: Game UI

## Operational preferred patterns

For dashboards, admin portals, CRMs, logistics, and SaaS products, prefer restrained patterns:

- layout animation
- shared layout animation
- enter and exit transitions
- smooth tabs
- skeleton loading
- progress indicators
- toast notifications
- animated status badges
- number trends
- sheets and dialogs
- reorder animations

## Reserved elaborate patterns

Use only for marketing, portfolio, editorial, or immersive experiences when spec calls for them:

- cursor effects
- parallax
- animated text
- page-transition curtains
- experimental visual effects

## Non-negotiable requirements

Every non-trivial animation must:

- respect prefers-reduced-motion / useReducedMotion()
- preserve semantic HTML
- preserve keyboard and focus behavior
- avoid motion-only communication
- avoid unnecessary layout shifts
- remain responsive across supported screen sizes
- test during rapid and interrupted interactions
- work correctly with server rendering and hydration
- provide a clear user-experience benefit

Do not add animation merely to make an interface appear more modern.

Constitution and accessibility rules override this reference.

## Category index

### Base UI (13)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-base-accordion` | Base UI: Accordion | free | adapt | [link](https://motion.dev/examples/react-base-accordion) |
| `react-base-checkbox` | Base UI: Checkbox | free | adapt | [link](https://motion.dev/examples/react-base-checkbox) |
| `react-base-context-menu` | Base UI: Context menu | free | adapt | [link](https://motion.dev/examples/react-base-context-menu) |
| `react-base-dialog` | Base UI: Dialog | free | adapt | [link](https://motion.dev/examples/react-base-dialog) |
| `react-base-menu` | Base UI: Dropdown menu | free | adapt | [link](https://motion.dev/examples/react-base-menu) |
| `react-base-progress` | Base UI: Progress | free | adapt | [link](https://motion.dev/examples/react-base-progress) |
| `react-base-radio` | Base UI: Radio | free | adapt | [link](https://motion.dev/examples/react-base-radio) |
| `react-base-select` | Base UI: Select | free | adapt | [link](https://motion.dev/examples/react-base-select) |
| `react-base-switch` | Base UI: Switch | free | adapt | [link](https://motion.dev/examples/react-base-switch) |
| `react-base-tabs` | Base UI: Tabs | free | adapt | [link](https://motion.dev/examples/react-base-tabs) |
| `react-base-toast` | Base UI: Toast | free | adapt | [link](https://motion.dev/examples/react-base-toast) |
| `react-base-toggle-group` | Base UI: Toggle group | free | adapt | [link](https://motion.dev/examples/react-base-toggle-group) |
| `react-base-tooltip` | Base UI: Tooltip | free | adapt | [link](https://motion.dev/examples/react-base-tooltip) |

### Basics (36)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-animate-activity` | AnimateActivity: Slideshow | free | direct | [link](https://motion.dev/examples/react-animate-activity) |
| `react-animate-presence-modes` | AnimatePresence modes | free | direct | [link](https://motion.dev/examples/react-animate-presence-modes) |
| `react-aspect-ratio` | Aspect ratio | free | direct | [link](https://motion.dev/examples/react-aspect-ratio) |
| `react-bounce-easing` | Bounce easing | free | direct | [link](https://motion.dev/examples/react-bounce-easing) |
| `react-color-interpolation` | Color interpolation | free | direct | [link](https://motion.dev/examples/react-color-interpolation) |
| `react-css-spring` | CSS spring | free | direct | [link](https://motion.dev/examples/react-css-spring) |
| `react-drag` | Drag | free | direct | [link](https://motion.dev/examples/react-drag) |
| `react-drag-constraints` | Drag: Constraints | free | direct | [link](https://motion.dev/examples/react-drag-constraints) |
| `react-drag-lock-direction` | Drag: Lock direction | free | direct | [link](https://motion.dev/examples/react-drag-lock-direction) |
| `react-enter-animation` | Enter animation | free | direct | [link](https://motion.dev/examples/react-enter-animation) |
| `react-exit-animation` | Exit animation | free | direct | [link](https://motion.dev/examples/react-exit-animation) |
| `react-follow-pointer-with-spring` | Follow pointer with spring | free | direct | [link](https://motion.dev/examples/react-follow-pointer-with-spring) |
| `react-gestures` | Gestures | free | direct | [link](https://motion.dev/examples/react-gestures) |
| `react-html-content` | HTML content | free | direct | [link](https://motion.dev/examples/react-html-content) |
| `react-keyframes` | Keyframes | free | direct | [link](https://motion.dev/examples/react-keyframes) |
| `react-keyframes-wildcards` | Keyframe wildcards | free | direct | [link](https://motion.dev/examples/react-keyframes-wildcards) |
| `react-layout-animation` | Layout animation | free | direct | [link](https://motion.dev/examples/react-layout-animation) |
| `react-motion-path` | Motion along a path | free | direct | [link](https://motion.dev/examples/react-motion-path) |
| `react-multifollow-pointer-with-spring` | Drag with spring follow | free | direct | [link](https://motion.dev/examples/react-multifollow-pointer-with-spring) |
| `react-path-drawing` | Path drawing | free | direct | [link](https://motion.dev/examples/react-path-drawing) |
| `react-path-morphing` | Path morphing | free | direct | [link](https://motion.dev/examples/react-path-morphing) |
| `react-reorder-items` | Reorder animation | free | direct | [link](https://motion.dev/examples/react-reorder-items) |
| `react-rotate` | Rotate | free | direct | [link](https://motion.dev/examples/react-rotate) |
| `react-scroll-container` | Element scroll-linked animation | free | direct | [link](https://motion.dev/examples/react-scroll-container) |
| `react-scroll-linked` | Scroll-linked animations | free | direct | [link](https://motion.dev/examples/react-scroll-linked) |
| `react-scroll-linked-with-spring` | Scroll-linked spring animation | free | direct | [link](https://motion.dev/examples/react-scroll-linked-with-spring) |
| `react-scroll-track-element-in-viewport` | Track element within viewport | free | direct | [link](https://motion.dev/examples/react-scroll-track-element-in-viewport) |
| `react-scroll-triggered` | Scroll-triggered animations | free | direct | [link](https://motion.dev/examples/react-scroll-triggered) |
| `react-shared-layout-animation` | Shared layout animation | free | direct | [link](https://motion.dev/examples/react-shared-layout-animation) |
| `react-state-updates` | Animate state | free | direct | [link](https://motion.dev/examples/react-state-updates) |
| `react-transition` | Transition options | free | direct | [link](https://motion.dev/examples/react-transition) |
| `react-use-animation-frame` | Spinning 3D cube | free | direct | [link](https://motion.dev/examples/react-use-animation-frame) |
| `react-use-presence-data` | usePresenceData | free | direct | [link](https://motion.dev/examples/react-use-presence-data) |
| `react-use-time` | useTime | free | direct | [link](https://motion.dev/examples/react-use-time) |
| `react-use-transform` | Value transform & path drawing | free | direct | [link](https://motion.dev/examples/react-use-transform) |
| `react-variants` | Variants | free | direct | [link](https://motion.dev/examples/react-variants) |

### Buttons (6)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-confetti` | Confetti | free | adapt | [link](https://motion.dev/examples/react-confetti) |
| `react-copy-button` | Copy Button | free | adapt | [link](https://motion.dev/examples/react-copy-button) |
| `react-dots-morph-button` | Dots Morph Button | free | adapt | [link](https://motion.dev/examples/react-dots-morph-button) |
| `react-hold-to-confirm` | Hold to confirm | free | adapt | [link](https://motion.dev/examples/react-hold-to-confirm) |
| `react-material-design-ripple` | Material Design: Ripple | free | adapt | [link](https://motion.dev/examples/react-material-design-ripple) |
| `react-multi-state-badge` | Multi state badge | free | adapt | [link](https://motion.dev/examples/react-multi-state-badge) |

### Carousel (15)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-carousel` | Carousel | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel) |
| `react-carousel-autoplay` | Carousel: Autoplay | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-autoplay) |
| `react-carousel-coverflow` | Carousel: Coverflow | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-coverflow) |
| `react-carousel-free-scroll` | Carousel: Free scroll | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-free-scroll) |
| `react-carousel-item-offset` | Carousel: Offset-linked animations | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-item-offset) |
| `react-carousel-lightbox` | Carousel: Lightbox | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-lightbox) |
| `react-carousel-loop` | Carousel: Loop | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-loop) |
| `react-carousel-pagination-arrows` | Carousel: Pagination | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-pagination-arrows) |
| `react-carousel-pagination-page-count` | Carousel: Pagination with page count | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-pagination-page-count) |
| `react-carousel-pagination-scaling` | Carousel: Scaling pagination dots | free | adapt | [link](https://motion.dev/examples/react-carousel-pagination-scaling) |
| `react-carousel-parallax` | Carousel: Parallax | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-parallax) |
| `react-carousel-progress-scrubber` | Carousel: Progress scrubber | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-progress-scrubber) |
| `react-carousel-rtl` | Carousel: RTL | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-rtl) |
| `react-carousel-thumbnail-gallery` | Carousel: Thumbnail gallery | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-thumbnail-gallery) |
| `react-carousel-vertical` | Carousel: Vertical | free | adapt | [link](https://motion.dev/examples/react-carousel-vertical) |

### Clerk (4)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-clerk-card-stack` | Clerk: Card Stack | free | adapt | [link](https://motion.dev/examples/react-clerk-card-stack) |
| `react-clerk-conditional-field` | Clerk: Conditional Field | free | adapt | [link](https://motion.dev/examples/react-clerk-conditional-field) |
| `react-clerk-sign-in` | Clerk: Sign-in-or-up | free | adapt | [link](https://motion.dev/examples/react-clerk-sign-in) |
| `react-clerk-user-button` | Clerk: User Button | free | adapt | [link](https://motion.dev/examples/react-clerk-user-button) |

### Cursor (13)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-bobble-hover` | Bobble hover | free | adapt | [link](https://motion.dev/examples/react-bobble-hover) |
| `react-cursor` | Cursor: Adaptive caret size | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor) |
| `react-cursor-custom-content` | Cursor: Custom content | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor-custom-content) |
| `react-cursor-floating-target` | Cursor: Floating target | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor-floating-target) |
| `react-cursor-follow` | Cursor: Follow | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor-follow) |
| `react-cursor-hover-follow` | Cursor: Image hover | free | adapt | [link](https://motion.dev/examples/react-cursor-hover-follow) |
| `react-cursor-magnetic` | Cursor: Magnetic target | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor-magnetic) |
| `react-cursor-multifollow` | Cursor: Multi-follow | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-cursor-multifollow) |
| `react-cursor-trail` | Cursor trail | free | adapt | [link](https://motion.dev/examples/react-cursor-trail) |
| `react-cursor-trail-velocity` | Cursor trail velocity | free | adapt | [link](https://motion.dev/examples/react-cursor-trail-velocity) |
| `react-ios-pointer` | iOS pointer animation | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ios-pointer) |
| `react-line-graph` | Line graph | free | adapt | [link](https://motion.dev/examples/react-line-graph) |
| `react-magnetic-filings` | Magnetic filings | free | adapt | [link](https://motion.dev/examples/react-magnetic-filings) |

### Dialog (4)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-accordion` | Accordion | free | adapt | [link](https://motion.dev/examples/react-accordion) |
| `react-family-dialog` | Family-style dialog | free | adapt | [link](https://motion.dev/examples/react-family-dialog) |
| `react-modal` | Modal dialog | free | adapt | [link](https://motion.dev/examples/react-modal) |
| `react-modal-shared-layout` | Modal: Shared layout | free | adapt | [link](https://motion.dev/examples/react-modal-shared-layout) |

### Experimental (4)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-apple-intelligence` | Apple Intelligence ripple | free | adapt | [link](https://motion.dev/examples/react-apple-intelligence) |
| `react-apple-watch-home-screen` | Apple Watch Home Screen | free | adapt | [link](https://motion.dev/examples/react-apple-watch-home-screen) |
| `react-conic-gradient-pointer` | Conic gradient pointer | free | adapt | [link](https://motion.dev/examples/react-conic-gradient-pointer) |
| `react-warp-overlay` | Warp overlay | free | adapt | [link](https://motion.dev/examples/react-warp-overlay) |

### Forms (4)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-carousel-ios-exposure-slider` | Carousel: iOS exposure slider | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-carousel-ios-exposure-slider) |
| `react-characters-remaining` | Characters remaining | free | adapt | [link](https://motion.dev/examples/react-characters-remaining) |
| `react-color-picker` | Color picker | free | adapt | [link](https://motion.dev/examples/react-color-picker) |
| `react-ios-slider` | iOS slider | free | adapt | [link](https://motion.dev/examples/react-ios-slider) |

### Game UI (1)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-pokopia-modal` | Pokopia: Modal | free | adapt | [link](https://motion.dev/examples/react-pokopia-modal) |

### Heros (1)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-hero-stagger` | OSS Hero | free | adapt | [link](https://motion.dev/examples/react-hero-stagger) |

### Interactions (6)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-add-to-basket` | Add to basket | free | adapt | [link](https://motion.dev/examples/react-add-to-basket) |
| `react-collision-hover-grid` | Pointer collision detection | free | adapt | [link](https://motion.dev/examples/react-collision-hover-grid) |
| `react-image-reveal-slider` | Image reveal slider | free | adapt | [link](https://motion.dev/examples/react-image-reveal-slider) |
| `react-notifications-stack` | iOS Notifications stack | free | adapt | [link](https://motion.dev/examples/react-notifications-stack) |
| `react-swipe-actions` | Swipe actions | free | adapt | [link](https://motion.dev/examples/react-swipe-actions) |
| `react-tilt-card` | Tilt card | free | adapt | [link](https://motion.dev/examples/react-tilt-card) |

### Layout animations (5)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-app-store` | iOS App Store | free | direct | [link](https://motion.dev/examples/react-app-store) |
| `react-create-button` | Create Button | free | direct | [link](https://motion.dev/examples/react-create-button) |
| `react-ios-app-folder` | iOS App Folder | free | direct | [link](https://motion.dev/examples/react-ios-app-folder) |
| `react-layout-anchor` | Layout Anchor | free | direct | [link](https://motion.dev/examples/react-layout-anchor) |
| `react-notifications-list` | Toast: Notifications list | free | direct | [link](https://motion.dev/examples/react-notifications-list) |

### Lists (4)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-card-stack` | Card stack | free | adapt | [link](https://motion.dev/examples/react-card-stack) |
| `react-infinite-loading` | Infinite loading | free | adapt | [link](https://motion.dev/examples/react-infinite-loading) |
| `react-staggered-grid` | Physical stagger | free | adapt | [link](https://motion.dev/examples/react-staggered-grid) |
| `react-todo-list` | To-do list | free | adapt | [link](https://motion.dev/examples/react-todo-list) |

### Loading (8)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-loading-circle-spinner` | Loading: Circle spinner | free | direct | [link](https://motion.dev/examples/react-loading-circle-spinner) |
| `react-loading-fill-text` | Fill text | free | direct | [link](https://motion.dev/examples/react-loading-fill-text) |
| `react-loading-jumping-dots` | Loading: Jumping dots | free | direct | [link](https://motion.dev/examples/react-loading-jumping-dots) |
| `react-loading-line-reveal` | Loading overlay | free | direct | [link](https://motion.dev/examples/react-loading-line-reveal) |
| `react-loading-progress-bar` | Loading progress bar | free | direct | [link](https://motion.dev/examples/react-loading-progress-bar) |
| `react-loading-ripple` | Loading ripple | free | direct | [link](https://motion.dev/examples/react-loading-ripple) |
| `react-loading-three-dots-pulse` | Loading: Pulse dots | free | direct | [link](https://motion.dev/examples/react-loading-three-dots-pulse) |
| `react-skeleton-shimmer` | Skeleton Shimmer | free | direct | [link](https://motion.dev/examples/react-skeleton-shimmer) |

### Navigation (7)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-command-palette` | Command Palette | free | adapt | [link](https://motion.dev/examples/react-command-palette) |
| `react-context-menu` | Context Menu | free | adapt | [link](https://motion.dev/examples/react-context-menu) |
| `react-floating-action-button` | Floating Action Button | free | adapt | [link](https://motion.dev/examples/react-floating-action-button) |
| `react-mega-menu` | Mega Menu | free | adapt | [link](https://motion.dev/examples/react-mega-menu) |
| `react-radial-menu` | Radial Menu | free | adapt | [link](https://motion.dev/examples/react-radial-menu) |
| `react-smooth-tabs` | Smooth Tabs | free | adapt | [link](https://motion.dev/examples/react-smooth-tabs) |
| `react-tab-select` | Tab select | free | adapt | [link](https://motion.dev/examples/react-tab-select) |

### Overlays (2)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-sheet-modal` | Sheet Modal | free | adapt | [link](https://motion.dev/examples/react-sheet-modal) |
| `react-toast-stack` | Toast: Stacked notifications | free | adapt | [link](https://motion.dev/examples/react-toast-stack) |

### Page transitions (12)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-curtains-blinds` | Curtains: Blinds | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-blinds) |
| `react-curtains-clip-wipe` | Curtains: Clip wipe | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-clip-wipe) |
| `react-curtains-doors` | Curtains: Doors | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-doors) |
| `react-curtains-fade` | Curtains: Fade | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-fade) |
| `react-curtains-iris` | Curtains: Iris | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-iris) |
| `react-curtains-iris-click` | Curtains: Iris from click | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-iris-click) |
| `react-curtains-mixed` | Curtains: Mixed effects | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-mixed) |
| `react-curtains-pixels` | Curtains: Pixels | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-pixels) |
| `react-curtains-scope` | Curtains: Scope | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-scope) |
| `react-curtains-shutter` | Curtains: Shutter | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-shutter) |
| `react-curtains-stagger-wipe` | Curtains: Stagger wipe | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-stagger-wipe) |
| `react-curtains-wipe` | Curtains: Wipe | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-curtains-wipe) |

### Radix (15)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-number-radix-slider` | Radix: Slider with AnimateNumber | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-radix-slider) |
| `react-radix-accordion` | Radix: Accordion | free | adapt | [link](https://motion.dev/examples/react-radix-accordion) |
| `react-radix-checkbox` | Radix: Checkbox | free | adapt | [link](https://motion.dev/examples/react-radix-checkbox) |
| `react-radix-context-menu` | Radix: Context Menu | free | adapt | [link](https://motion.dev/examples/react-radix-context-menu) |
| `react-radix-dialog` | Radix: Dialog | free | adapt | [link](https://motion.dev/examples/react-radix-dialog) |
| `react-radix-dropdown` | Radix: Dropdown Menu | free | adapt | [link](https://motion.dev/examples/react-radix-dropdown) |
| `react-radix-progress` | Radix: Progress | free | adapt | [link](https://motion.dev/examples/react-radix-progress) |
| `react-radix-radio-group` | Radix: Radio Group | free | adapt | [link](https://motion.dev/examples/react-radix-radio-group) |
| `react-radix-select` | Radix: Select | free | adapt | [link](https://motion.dev/examples/react-radix-select) |
| `react-radix-switch` | Radix: Switch | free | adapt | [link](https://motion.dev/examples/react-radix-switch) |
| `react-radix-tabs` | Radix: Tabs | free | adapt | [link](https://motion.dev/examples/react-radix-tabs) |
| `react-radix-toast` | Radix: Toast | free | adapt | [link](https://motion.dev/examples/react-radix-toast) |
| `react-radix-toggle-group` | Radix: Toggle Group | free | adapt | [link](https://motion.dev/examples/react-radix-toggle-group) |
| `react-radix-toolbar` | Radix: Toolbar | free | adapt | [link](https://motion.dev/examples/react-radix-toolbar) |
| `react-radix-tooltip` | Radix: Tooltip | free | adapt | [link](https://motion.dev/examples/react-radix-tooltip) |

### Scroll (8)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-parallax` | Parallax | free | adapt | [link](https://motion.dev/examples/react-parallax) |
| `react-scroll-hide-header` | Scroll Direction: Hide Header | free | adapt | [link](https://motion.dev/examples/react-scroll-hide-header) |
| `react-scroll-highlight` | Scroll highlight | free | adapt | [link](https://motion.dev/examples/react-scroll-highlight) |
| `react-scroll-horizontal` | Scroll Horizontal Gallery | free | adapt | [link](https://motion.dev/examples/react-scroll-horizontal) |
| `react-scroll-image-reveal` | Scroll Image Reveal | free | adapt | [link](https://motion.dev/examples/react-scroll-image-reveal) |
| `react-scroll-text-lines` | Scroll Text Lines | free | adapt | [link](https://motion.dev/examples/react-scroll-text-lines) |
| `react-scroll-velocity-linked-offset` | Scroll velocity: 3D planes | free | adapt | [link](https://motion.dev/examples/react-scroll-velocity-linked-offset) |
| `react-scroll-zoom-hero` | Scroll Zoom Hero | free | adapt | [link](https://motion.dev/examples/react-scroll-zoom-hero) |

### Studio SDK (1)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-bezier-curve-editor` | Bezier curve editor | free | adapt | [link](https://motion.dev/examples/react-bezier-curve-editor) |

### Text (16)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-number-counter` | Number counter | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-counter) |
| `react-number-engagement-stats` | Engagement stats | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-engagement-stats) |
| `react-number-formatting` | Number formatting | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-formatting) |
| `react-number-price-switcher` | Price switcher | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-price-switcher) |
| `react-number-trend` | Number trend | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-number-trend) |
| `react-scramble-text` | Scramble text | free | adapt | [link](https://motion.dev/examples/react-scramble-text) |
| `react-scramble-text-hover` | Scramble text: Hover | free | adapt | [link](https://motion.dev/examples/react-scramble-text-hover) |
| `react-scramble-text-stagger-center` | Scramble text: Stagger from center | free | adapt | [link](https://motion.dev/examples/react-scramble-text-stagger-center) |
| `react-split-text` | Split text | free | adapt | [link](https://motion.dev/examples/react-split-text) |
| `react-split-text-scatter` | Scatter text | free | adapt | [link](https://motion.dev/examples/react-split-text-scatter) |
| `react-split-text-wavy` | Wavy text | free | adapt | [link](https://motion.dev/examples/react-split-text-wavy) |
| `react-text-reveal` | Reveal text effect | free | adapt | [link](https://motion.dev/examples/react-text-reveal) |
| `react-typewriter` | Typewriter | free | adapt | [link](https://motion.dev/examples/react-typewriter) |
| `react-typewriter-change-content` | Typewriter: Change Content | free | adapt | [link](https://motion.dev/examples/react-typewriter-change-content) |
| `react-typewriter-explode` | Typewriter: Exploding Countdown | free | adapt | [link](https://motion.dev/examples/react-typewriter-explode) |
| `react-typewriter-natural-typing` | Typewriter: Natural Typing | free | adapt | [link](https://motion.dev/examples/react-typewriter-natural-typing) |

### Ticker (9)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-ticker` | Ticker | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker) |
| `react-ticker-cursor` | Ticker: Cursor | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-cursor) |
| `react-ticker-draggable` | Ticker: Draggable | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-draggable) |
| `react-ticker-overflow` | Ticker: Overflow | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-overflow) |
| `react-ticker-rtl` | Ticker: RTL | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-rtl) |
| `react-ticker-scroll` | Ticker: Scroll | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-scroll) |
| `react-ticker-text-hover-effect` | Ticker: Text hover effect | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-text-hover-effect) |
| `react-ticker-use-ticker-item` | Ticker: useTickerItem | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-use-ticker-item) |
| `react-ticker-y-axis` | Ticker: Vertical scrolling | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-ticker-y-axis) |

### View (5)

| Slug | Headline | Access | Reuse tier | URL |
|------|----------|--------|------------|-----|
| `react-animate-view-app-store` | AnimateView: App Store | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-animate-view-app-store) |
| `react-animate-view-clip-path` | AnimateView: Clip path | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-animate-view-clip-path) |
| `react-animate-view-reorder` | AnimateView: Reorder items | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-animate-view-reorder) |
| `react-animate-view-toggle` | AnimateView: Toggle | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-animate-view-toggle) |
| `react-animate-view-types` | AnimateView: Transition types | motion-plus | interaction-reference-only | [link](https://motion.dev/examples/react-animate-view-types) |

## Example lookup (alphabetical)

| Slug | Categories | Access | Reuse tier |
|------|------------|--------|------------|
| `react-accordion` | dialog | free | adapt |
| `react-add-to-basket` | interactions | free | adapt |
| `react-animate-activity` | basics | free | direct |
| `react-animate-presence-modes` | basics | free | direct |
| `react-animate-view-app-store` | view | motion-plus | interaction-reference-only |
| `react-animate-view-clip-path` | view | motion-plus | interaction-reference-only |
| `react-animate-view-reorder` | view | motion-plus | interaction-reference-only |
| `react-animate-view-toggle` | view | motion-plus | interaction-reference-only |
| `react-animate-view-types` | view | motion-plus | interaction-reference-only |
| `react-app-store` | layout-animations | free | direct |
| `react-apple-intelligence` | experimental | free | adapt |
| `react-apple-watch-home-screen` | experimental | free | adapt |
| `react-aspect-ratio` | basics | free | direct |
| `react-base-accordion` | base-ui | free | adapt |
| `react-base-checkbox` | base-ui | free | adapt |
| `react-base-context-menu` | base-ui | free | adapt |
| `react-base-dialog` | base-ui | free | adapt |
| `react-base-menu` | base-ui | free | adapt |
| `react-base-progress` | base-ui | free | adapt |
| `react-base-radio` | base-ui | free | adapt |
| `react-base-select` | base-ui | free | adapt |
| `react-base-switch` | base-ui | free | adapt |
| `react-base-tabs` | base-ui | free | adapt |
| `react-base-toast` | base-ui | free | adapt |
| `react-base-toggle-group` | base-ui | free | adapt |
| `react-base-tooltip` | base-ui | free | adapt |
| `react-bezier-curve-editor` | studio-sdk | free | adapt |
| `react-bobble-hover` | cursor | free | adapt |
| `react-bounce-easing` | basics | free | direct |
| `react-card-stack` | lists | free | adapt |
| `react-carousel` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-autoplay` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-coverflow` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-free-scroll` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-ios-exposure-slider` | forms | motion-plus | interaction-reference-only |
| `react-carousel-item-offset` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-lightbox` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-loop` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-pagination-arrows` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-pagination-page-count` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-pagination-scaling` | carousel | free | adapt |
| `react-carousel-parallax` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-progress-scrubber` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-rtl` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-thumbnail-gallery` | carousel | motion-plus | interaction-reference-only |
| `react-carousel-vertical` | carousel | free | adapt |
| `react-characters-remaining` | forms | free | adapt |
| `react-clerk-card-stack` | clerk | free | adapt |
| `react-clerk-conditional-field` | clerk | free | adapt |
| `react-clerk-sign-in` | clerk | free | adapt |
| `react-clerk-user-button` | clerk | free | adapt |
| `react-collision-hover-grid` | interactions | free | adapt |
| `react-color-interpolation` | basics | free | direct |
| `react-color-picker` | forms | free | adapt |
| `react-command-palette` | navigation | free | adapt |
| `react-confetti` | buttons | free | adapt |
| `react-conic-gradient-pointer` | experimental | free | adapt |
| `react-context-menu` | navigation | free | adapt |
| `react-copy-button` | buttons | free | adapt |
| `react-create-button` | layout-animations | free | direct |
| `react-css-spring` | basics | free | direct |
| `react-cursor` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-custom-content` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-floating-target` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-follow` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-hover-follow` | cursor | free | adapt |
| `react-cursor-magnetic` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-multifollow` | cursor | motion-plus | interaction-reference-only |
| `react-cursor-trail` | cursor | free | adapt |
| `react-cursor-trail-velocity` | cursor | free | adapt |
| `react-curtains-blinds` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-clip-wipe` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-doors` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-fade` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-iris` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-iris-click` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-mixed` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-pixels` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-scope` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-shutter` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-stagger-wipe` | page-transitions | motion-plus | interaction-reference-only |
| `react-curtains-wipe` | page-transitions | motion-plus | interaction-reference-only |
| `react-dots-morph-button` | buttons | free | adapt |
| `react-drag` | basics | free | direct |
| `react-drag-constraints` | basics | free | direct |
| `react-drag-lock-direction` | basics | free | direct |
| `react-enter-animation` | basics | free | direct |
| `react-exit-animation` | basics | free | direct |
| `react-family-dialog` | dialog | free | adapt |
| `react-floating-action-button` | navigation | free | adapt |
| `react-follow-pointer-with-spring` | basics | free | direct |
| `react-gestures` | basics | free | direct |
| `react-hero-stagger` | heros | free | adapt |
| `react-hold-to-confirm` | buttons | free | adapt |
| `react-html-content` | basics | free | direct |
| `react-image-reveal-slider` | interactions | free | adapt |
| `react-infinite-loading` | lists | free | adapt |
| `react-ios-app-folder` | layout-animations | free | direct |
| `react-ios-pointer` | cursor | motion-plus | interaction-reference-only |
| `react-ios-slider` | forms | free | adapt |
| `react-keyframes` | basics | free | direct |
| `react-keyframes-wildcards` | basics | free | direct |
| `react-layout-anchor` | layout-animations | free | direct |
| `react-layout-animation` | basics | free | direct |
| `react-line-graph` | cursor | free | adapt |
| `react-loading-circle-spinner` | loading | free | direct |
| `react-loading-fill-text` | loading | free | direct |
| `react-loading-jumping-dots` | loading | free | direct |
| `react-loading-line-reveal` | loading | free | direct |
| `react-loading-progress-bar` | loading | free | direct |
| `react-loading-ripple` | loading | free | direct |
| `react-loading-three-dots-pulse` | loading | free | direct |
| `react-magnetic-filings` | cursor | free | adapt |
| `react-material-design-ripple` | buttons | free | adapt |
| `react-mega-menu` | navigation | free | adapt |
| `react-modal` | dialog | free | adapt |
| `react-modal-shared-layout` | dialog | free | adapt |
| `react-motion-path` | basics | free | direct |
| `react-multi-state-badge` | buttons | free | adapt |
| `react-multifollow-pointer-with-spring` | basics | free | direct |
| `react-notifications-list` | layout-animations | free | direct |
| `react-notifications-stack` | interactions | free | adapt |
| `react-number-counter` | text | motion-plus | interaction-reference-only |
| `react-number-engagement-stats` | text | motion-plus | interaction-reference-only |
| `react-number-formatting` | text | motion-plus | interaction-reference-only |
| `react-number-price-switcher` | text | motion-plus | interaction-reference-only |
| `react-number-radix-slider` | radix | motion-plus | interaction-reference-only |
| `react-number-trend` | text | motion-plus | interaction-reference-only |
| `react-parallax` | scroll | free | adapt |
| `react-path-drawing` | basics | free | direct |
| `react-path-morphing` | basics | free | direct |
| `react-pokopia-modal` | game-ui | free | adapt |
| `react-radial-menu` | navigation | free | adapt |
| `react-radix-accordion` | radix | free | adapt |
| `react-radix-checkbox` | radix | free | adapt |
| `react-radix-context-menu` | radix | free | adapt |
| `react-radix-dialog` | radix | free | adapt |
| `react-radix-dropdown` | radix | free | adapt |
| `react-radix-progress` | radix | free | adapt |
| `react-radix-radio-group` | radix | free | adapt |
| `react-radix-select` | radix | free | adapt |
| `react-radix-switch` | radix | free | adapt |
| `react-radix-tabs` | radix | free | adapt |
| `react-radix-toast` | radix | free | adapt |
| `react-radix-toggle-group` | radix | free | adapt |
| `react-radix-toolbar` | radix | free | adapt |
| `react-radix-tooltip` | radix | free | adapt |
| `react-reorder-items` | basics | free | direct |
| `react-rotate` | basics | free | direct |
| `react-scramble-text` | text | free | adapt |
| `react-scramble-text-hover` | text | free | adapt |
| `react-scramble-text-stagger-center` | text | free | adapt |
| `react-scroll-container` | basics | free | direct |
| `react-scroll-hide-header` | scroll | free | adapt |
| `react-scroll-highlight` | scroll | free | adapt |
| `react-scroll-horizontal` | scroll | free | adapt |
| `react-scroll-image-reveal` | scroll | free | adapt |
| `react-scroll-linked` | basics | free | direct |
| `react-scroll-linked-with-spring` | basics | free | direct |
| `react-scroll-text-lines` | scroll | free | adapt |
| `react-scroll-track-element-in-viewport` | basics | free | direct |
| `react-scroll-triggered` | basics | free | direct |
| `react-scroll-velocity-linked-offset` | scroll | free | adapt |
| `react-scroll-zoom-hero` | scroll | free | adapt |
| `react-shared-layout-animation` | basics | free | direct |
| `react-sheet-modal` | overlays | free | adapt |
| `react-skeleton-shimmer` | loading | free | direct |
| `react-smooth-tabs` | navigation | free | adapt |
| `react-split-text` | text | free | adapt |
| `react-split-text-scatter` | text | free | adapt |
| `react-split-text-wavy` | text | free | adapt |
| `react-staggered-grid` | lists | free | adapt |
| `react-state-updates` | basics | free | direct |
| `react-swipe-actions` | interactions | free | adapt |
| `react-tab-select` | navigation | free | adapt |
| `react-text-reveal` | text | free | adapt |
| `react-ticker` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-cursor` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-draggable` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-overflow` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-rtl` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-scroll` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-text-hover-effect` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-use-ticker-item` | ticker | motion-plus | interaction-reference-only |
| `react-ticker-y-axis` | ticker | motion-plus | interaction-reference-only |
| `react-tilt-card` | interactions | free | adapt |
| `react-toast-stack` | overlays | free | adapt |
| `react-todo-list` | lists | free | adapt |
| `react-transition` | basics | free | direct |
| `react-typewriter` | text | free | adapt |
| `react-typewriter-change-content` | text | free | adapt |
| `react-typewriter-explode` | text | free | adapt |
| `react-typewriter-natural-typing` | text | free | adapt |
| `react-use-animation-frame` | basics | free | direct |
| `react-use-presence-data` | basics | free | direct |
| `react-use-time` | basics | free | direct |
| `react-use-transform` | basics | free | direct |
| `react-variants` | basics | free | direct |
| `react-warp-overlay` | experimental | free | adapt |

