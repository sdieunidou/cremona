# React adapter

## Install/imports

```tsx
import "@cremona/tokens/css/cremona.css"; // once, app-wide
import { StatCard } from "@cremona/blocks/src/metrics/stat-card/react.js";
import { Line } from "@cremona/blocks/src/charts/line/react.js";
```

Blocks depend only on: `react`, `motion/react`, `lucide-react`, `@cremona/core`
(constants/types), `@cremona/react` (`useInView`). They are `aria-hidden`
decorations — pair them with real, accessible UI.

## Props contract

Every visual extends `VisualProps`:

| Prop | Default | Meaning |
|---|---|---|
| `animated` | `false` | play the entrance timeline. `false` = static final state |
| `trigger` | `"inView"` | `"mount"` (immediately), `"inView"` (once at 50% visible), `"inViewRepeat"` (replays) |
| `className` | — | merged onto the scene root |

Cross-block style props (when present in the POC): `fadeOut` (mask fade at the
card bottom), `isometric` (3D tilt), `gradient` (rainbow glow + veil).

Per-block content props come from the POC defaults (e.g. `label`, `value`,
`change`, `trend` for stat-card). **The exact prop shape per variant** is in
each block's `preview-props.json` — values like `"lucide:Users"` mean "pass the
lucide-react icon component with that name".

```tsx
<StatCard
  animated
  trigger="inViewRepeat"
  icon={Users}
  label="Active Users"
  value="12,481"
  change="+8.1%"
  period="vs last week"
  trend="up"
/>
```

## Composing your own previews

```tsx
import { PreviewFrame, PreviewGrid } from "@cremona/react/preview-frame";
// (gallery ships its own; host apps can use @cremona/core FRAME_HEIGHTS/gridCols)
<PreviewGrid cols={2}>
  <PreviewFrame label="default">
    <StatCard animated trigger="inViewRepeat" />
  </PreviewFrame>
</PreviewGrid>
```

## SSR / RSC notes

- Blocks render deterministically server-side (that's how parity is verified).
- `useId` gradient ids are stable per render tree; ids differ between trees —
  safe to render many blocks on one page.
- Images use POC-relative placeholder paths (`../../media/placeholders/…` in
  goldens); in the library they resolve to your host's `/media/placeholders/…`
  when you copy the `media/` folder to your public dir (see gallery `public/`).
- All blocks are client components in Next.js terms (they use refs/effects) —
  add `"use client"` at your import boundary.

## Hooks

`useInView(ref, { once, initial, margin, amount })` — port of the POC hook;
`observeInView(targets, onEnter, options)` for non-React contexts.
