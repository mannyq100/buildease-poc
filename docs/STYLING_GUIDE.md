# BuildEase Frontend Styling Guide

A concise, practical style book for building consistent, mobile‑first UIs across BuildEase. It reflects the real tokens and decisions in `tailwind.config.ts` and shadcn/radix usage in this codebase.

---

## Core Principles
- Mobile-first: design for small screens first, then enhance.
- Construction-focused: professional, trustworthy; earthy neutrals with bold action accents.
- Simplicity: prioritize clarity, readable density, and obvious affordances.
- Consistency: reuse primitives/components before creating new ones.
- Accessibility: keyboard-first, visible focus, sufficient contrast.

---

## Design Tokens (Tailwind)

### Colors
Primary brand and status colors are extended in Tailwind.

- Primary (BuildEase Blue): `bg-primary` `text-primary` — `#2B6CB0`
- Accent (BuildEase Orange): `bg-accent` `text-accent` — `#ED8936`
- Earth tones: `buildease-earth-50 … 950` for subtle surfaces and dividers
- Brand scales:
  - `buildease-blue-50 … 950` (trust/professional cues)
  - `buildease-orange-50 … 950` (calls-to-action)
- Status palette:
  - Pending: `text-status-pending`, `bg-status-pending`
  - In Progress: `text-status-in-progress`, `bg-status-in-progress`
  - Completed: `text-status-completed`, `bg-status-completed`

System surfaces (prefer these for dark/light support):
- Backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-sidebar`
- Text: `text-foreground`, `text-card-foreground`
- Borders: `border-border`, `ring-ring`

Usage guidance:
- Use `bg-background`/`text-foreground` for page shells. Do not hardcode white/black.
- Use `bg-card shadow-card rounded-lg` for cards; `shadow-card-hover` on hover.
- Emphasize actions with `bg-primary text-white` (primary) or `bg-accent text-white` (secondary emphasis).

### Typography
Tailwind font scale is tuned for field readability.

Key sizes (from config):
- `text-xs` 12px / 18px
- `text-sm` 14px / 20px
- `text-base` 16px / 24px
- `text-lg` 18px / 16px line-height (compact headings)
- `text-xl` 20px / 16px, medium weight (section titles)
- `text-2xl` 24px / 16px, semibold (page titles)
- Construction-specific:
  - `text-construction-caption` ≈ 13px, medium
  - `text-construction-body` ≈ 15px
  - `text-construction-heading` ≈ 22px, semibold

Guidance:
- Page title: `text-2xl md:text-3xl font-semibold`
- Section heading: `text-xl font-medium`
- Body: `text-construction-body text-muted-foreground`
- Avoid more than 3 sizes on a screen to preserve hierarchy.

### Spacing
Extended spacing keys:
- Content gutters: `p-content` (24px), `p-content-lg` (32px), `p-content-xl` (40px)
- Sections: `py-section` (48px), `py-section-lg` (64px)
- Fine step: `4.5` (18px)
- Safe inset for mobile: `pb-safe`

Container:
- Centered with `container` and default `px-8` (2rem) at large screens.

### Radius & Shadows
- Radius: `rounded-lg`, `rounded-md`, `rounded-sm` mapped to CSS vars for theming.
- Shadows: `shadow-card` for resting, `shadow-card-hover` on hover/focus.

### Motion
Predefined keyframes and utilities:
- Accordions: `data-[state=open]:animate-accordion-down` / `data-[state=closed]:animate-accordion-up`
- Slow ambient: `animate-slow-spin`, `animate-float`
- Keep durations subtle (150–250ms) and ease-out/in-out; avoid over-animating primary flows.

---

## Theming & Dark Mode
- Dark mode is class-based: `<html class="dark">` toggled by theme provider.
- Always use semantic tokens: `bg-background`, `text-foreground`, `border-border`.
- Avoid hardcoding `#fff`/`#000`; prefer tokens to maintain dual-theme support.

---

## Components (shadcn + Radix)

### Guidelines
- Prefer existing primitives in `src/components/ui/*` or established patterns in `src/components`.
- Variants via `class-variance-authority` (CVA). Add variants to existing component before making new ones.
- Composition > deep props: wrap primitives to create semantic components (e.g., `ProjectCard`, `FormSection`).

### Buttons
- Primary action: `bg-primary text-white hover:bg-primary-darker`
- Secondary action: neutral surface with `border-border hover:bg-muted`
- Destructive: `bg-destructive text-destructive-foreground`
- Include visible focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### Inputs & Forms
- Inputs: `bg-background border-border focus:ring-2 focus:ring-ring`.
- Labels: `text-sm font-medium text-foreground` with `mb-1`.
- Help/error text: `text-xs text-muted-foreground` / `text-xs text-destructive`.
- Field groups: use `gap-4` on mobile, `gap-6` on desktop.
- Validation: react-hook-form + zod; show errors under fields.
- Radix Select: never use empty string as Item value (Radix constraint). Use `'ai-recommend'` for placeholders.

### Cards & Surfaces
- Base: `bg-card text-card-foreground rounded-lg shadow-card`
- Hoverable: add `transition-shadow hover:shadow-card-hover`
- Dense lists: `divide-y divide-border`

### Navigation & Layout
- Page shell: `min-h-screen bg-background text-foreground`.
- Section blocks: `py-section` with an inner `container`.
- Grids: mobile-first single column; at `md` use `grid-cols-2`; at `lg`/`xl` expand as needed.

---

## Status & Feedback
Use status colors for chips, badges, and progress indicators.

Examples:
```tsx
// Badge
<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-status-in-progress text-white">
  In Progress
</span>

// Progress bar (Radix Progress)
<div className="h-2 w-full rounded bg-muted">
  <div className="h-2 rounded bg-status-completed" style={{ width: '64%' }} />
</div>
```

Notifications: use `sonner` with concise titles and actionable descriptions.

---

## Responsive Patterns
- Tap targets: min height `h-10` (40px) on mobile touch areas.
- Typography: avoid <12px on mobile; use `text-sm` and above.
- Spacing: prioritize `gap-4` and above for touch-friendly grouping.
- Tables: prefer cards or stacked rows on mobile; use `md:grid`/`lg:table` patterns.

---

## Accessibility
- Focus: always include focus-visible rings on interactive elements.
- Contrast: ensure text meets WCAG AA; prefer tokens to maintain theme contrast.
- Labels: associate `Label` with control `id`.
- ARIA: use Radix primitives which provide base a11y; augment with `aria-live` for async feedback.

---

## Iconography
- Use `lucide-react`. Sizes: 16 (dense), 20 (default), 24 (emphasis).
- Maintain `stroke-[1.5]` look; avoid heavy fills except for illustrations.

---

## Data Visualization
- Recharts: keep to 1–2 series on mobile.
- Colors: use brand scales — pending (blue), in-progress (orange), completed (green). Keep backgrounds neutral (`bg-card`).
- Axes/labels: `text-xs text-muted-foreground` for secondary info.

---

## Example Blocks

### Page Section
```tsx
<section className="py-section bg-background">
  <div className="container">
    <header className="mb-6">
      <h2 className="text-2xl font-semibold">Project Overview</h2>
      <p className="text-construction-body text-muted-foreground">Key metrics and recent activity</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="bg-card rounded-lg shadow-card p-content transition-shadow hover:shadow-card-hover">
        {/* Card content */}
      </div>
    </div>
  </div>
</section>
```

### Form Field
```tsx
<div className="space-y-1.5">
  <label htmlFor="budget" className="text-sm font-medium text-foreground">Budget</label>
  <input id="budget" className="w-full h-10 px-3 rounded-md bg-background border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
  <p className="text-xs text-muted-foreground">Enter the total budget for this project.</p>
</div>
```

### Status Chip
```tsx
<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-status-pending text-white">
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  Pending
</span>
```

---

## Do / Don’t
- Do use semantic tokens and shadcn primitives.
- Do keep hierarchy simple: title, section, body.
- Do keep touch targets >= 40px.
- Don’t invent new colors when tokens exist.
- Don’t use empty Radix Select values; use `'ai-recommend'`.
- Don’t hardcode light/dark colors; rely on variables.

---

## Extending the System
When you need a new variant or token:
1. Check for an existing component or token.
2. If missing, add a CVA variant to an existing component first.
3. If truly new, create a small, focused component in `src/components` with:
   - Exported component at top, then subcomponents/helpers.
   - Types in `src/types` when shared.
   - Story or example usage in the PR description.

---

## References
- Tailwind config: `tailwind.config.ts`
- UI components: `src/components` and `components.json`
- Design tokens in use across layouts: `App.tsx`, `index.css`

This guide should be treated as living documentation — evolve it as the product grows.
