# React adapter

## Install/imports

```tsx
import "@cremona/tokens/css/cremona.css"; // once, app-wide
import { StatCard } from "@cremona/blocks/src/metrics/stat-card/react.js";
import { Line } from "@cremona/blocks/src/charts/line/react.js";
```

Blocks depend only on: `react`, `motion/react`, `lucide-react`, `@cremona/core`
(constants/types), `@cremona/react` (`useInView`).

Blocks are **preview compositions**, not production components — read
[Preview compositions vs production UI](#preview-compositions-vs-production-ui)
before building an app screen with them.

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

## Preview compositions vs production UI

Every block is written for the gallery. Three consequences, none of them
obvious from the import:

1. its root is `aria-hidden="true"` — the content does not exist for a screen
   reader;
2. that root is a **preview frame**
   (`relative isolate flex size-full items-center justify-center overflow-hidden px-2`)
   that centres a `max-w-*` card inside whatever box you give it;
3. it takes **content** props (`label`, `value`, `items`…) but no `onClick`, no
   `ref`, no `children` — `components/button` renders one button with one
   label, `components/table` renders four fixed rows.

So a block cannot become a form field, a sortable table or an editable grid.
There are two correct ways to use one.

### Use it as-is, for illustration

Charts, stat cards and empty states are decorative by nature. Give the block a
sized box and pair it with a text equivalent, since its root is `aria-hidden`:

```tsx
<div className="h-72">
  <Donut
    title="Charge par semaine"
    centerValue="90 j"
    segments={segments}   // your data, never the demo defaults
    animated
    trigger="mount"
  />
</div>
<p className="sr-only">Charge par semaine : 90 j. {/* … */}</p>
```

### Derive it, for anything interactive

Do **not** rewrite the component from its class strings: you lose the entrance
variants, the easings and the details that make it feel finished — the spring
on the switch knob (`stiffness: 400, damping: 28`), the tooltip arrow, the
`layoutId` indicator that slides between tabs, the 150 ms offset between a card
and its rows.

Start from the source instead. `get_block` returns the complete, self-contained
TSX (`include: ["react"]`), or copy `packages/blocks/src/<category>/<block>/react.tsx`.
Then apply the same three edits every time:

| | |
|---|---|
| **remove** | the preview frame wrapper and its `aria-hidden="true"`, and the `useInView` plumbing (`inViewOnce` / `inViewRepeat` / `state`) |
| **add** | real props — `children`, handlers, forwarded `ref`, ARIA, keyboard |
| **keep** | everything else: class strings, `motion` variants, transitions, SVG markup |

```tsx
// before — packages/blocks/src/components/button/react.tsx
<div ref={ref} aria-hidden="true" className={cn("relative isolate flex size-full …")}>
  <motion.div variants={animated ? entrance : undefined} {...state}>
    <button type="button" className={cn("group/button inline-flex …", variantClasses[variant], sizeClasses[size])}>
      <span>{label}</span>
    </button>
  </motion.div>
</div>

// after — your ui/button.tsx
<button
  ref={ref}
  type={type}
  disabled={disabled || loading}
  className={cn("group/button inline-flex …", variantClasses[variant], sizeClasses[size], className)}
  {...rest}
>
  {children}
</button>
```

Keep a header comment naming the source block and what you changed: the
derivation stays auditable, and you can re-sync when the block moves.

## Gotchas

- **`gradient` veils the bottom of the card.** The rainbow glow ships with a
  `bg-background/75 mask-t-from-50%` veil over the bottom 64 px, which fades
  anything sitting there — the donut's legend, the bar chart's axis labels.
  Pass `gradient={false}` on data panels and keep the glow for one hero card.
- **`trigger="mount"` replays on every remount.** In a filtered list that
  re-keys its children, the entrance runs again on each change. Prefer
  `"inView"` (the default, once) unless the panel really is mounted once.
- **Screenshot tests must wait out the choreography.** Entrances chain up to
  ~1.3 s (the donut reveals its centre at 1.1 s and its legend at 1.2 s).
  Playwright's `reducedMotion` disables transforms but not opacity, so a
  capture taken at `networkidle` shows half-drawn charts.

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
