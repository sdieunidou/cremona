# React adapter

## Install/imports

```bash
npm i @cremona/blocks @cremona/tokens motion lucide-react
```

```tsx
import "@cremona/tokens/css/cremona.css"; // once, app-wide
import { StatCard } from "@cremona/blocks/metrics/stat-card";
import { Line, type LineProps } from "@cremona/blocks/charts/line";
```

One entry per block, `@cremona/blocks/<category>/<file>`: compiled ESM with its
type declarations, starting with `"use client"`. `react`, `react-dom`, `motion`
and `lucide-react` are peer dependencies (React 18.2+ or 19, motion 12 or 13,
lucide-react 1.47+); `@cremona/core` (constants, types, `cn`, `frameClasses`)
and `@cremona/react` (`useInView`, `useLoopActive`) come as dependencies.
Tested with React 19.3 and 18.3, Next.js 16.3, Vite 8.3, TypeScript 6.0,
motion 13.4 and lucide-react 1.49. The setup of a new app — stylesheet, dark
mode, images, Server Components, Tailwind — is in
[getting-started.md](getting-started.md).

Blocks are **preview compositions**, not production components — read
[Preview compositions vs production UI](#preview-compositions-vs-production-ui)
before building an app screen with them.

## Props contract

Every visual extends `VisualProps`:

| Prop | Default | Meaning |
|---|---|---|
| `animated` | `false` | play the entrance timeline. `false` = static final state |
| `trigger` | `"inView"` | `"mount"` (immediately), `"inView"` (once at 50% visible), `"inViewRepeat"` (replays) |
| `fill` | `false` | fill the box instead of sitting in the preview frame — see [Using a block as a panel](#using-a-block-as-a-panel) |
| `className` | — | merged onto the scene root |

Cross-block style props (when present in the POC): `fadeOut` (mask fade at the
card bottom), `isometric` (3D tilt), `gradient` (rainbow glow + veil).

Per-block content props come from the POC defaults (e.g. `label`, `value`,
`change`, `trend` for stat-card). **The exact prop shape per variant** is in
each block's `preview-props.json` — values like `"lucide:Users"` mean "pass the
lucide-react icon component with that name", and
`{ "$element": "lucide:Users", "props": { "className": "size-4" } }` means "pass
the element `<Users className="size-4" />`".

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
    title="Load per week"
    badge="Week 40"
    centerValue="90 d"
    centerLabel="planned"
    segments={segments}   // your data, never the demo defaults
    animated
    trigger="mount"
  />
</div>
<p className="sr-only">Load per week: 90 days planned. {/* … */}</p>
```

### Derive it, for anything interactive

Do **not** rewrite the component from its class strings: you lose the entrance
variants, the easings and the details that make it feel finished — the spring
on the switch knob (`stiffness: 400, damping: 28`), the tooltip arrow, the
`layoutId` indicator that slides between tabs, the 150 ms offset between a card
and its rows.

Start from the source instead: copy
`packages/blocks/src/<category>/<block>/react.tsx` into your app, or take it
from the MCP `get_block`. It imports `@cremona/core` and `@cremona/react`, so
install them next to motion and lucide-react
(`npm i @cremona/core @cremona/react @cremona/tokens motion lucide-react`), and
keep its first line, `"use client"`, in a Next.js app. Then apply the same
three edits every time:

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

## Using a block as a panel

By default a visual renders for the gallery: the preview frame centres it
(`flex items-center justify-center … px-2`) and the card inside caps at a
`max-w-*` — 10 different values across the 118 blocks that cap. Drop three in a
grid and you get three widths, three left edges and three top edges.

`fill` turns the frame into a plain box the visual occupies entirely: no side
padding, no module cap, and the card stretched to the box's height (the card
wrapper becomes `h-full flex flex-col`, the card `flex-1`). Stages with a fixed
aspect — maps, devices, scenes — keep it: they are centred and contained in the
box, not distorted.

```tsx
<div className="grid gap-3 lg:grid-cols-3">
  <div className="h-72">
    <Gauge fill gradient={false} title="Health" badge="Live" percent={43} value="43%" label="Degraded" change="-12%" />
  </div>
  <div className="h-72">
    <Donut fill gradient={false} title="Storage" badge="Team" centerValue="61%" centerLabel="used" segments={segments} />
  </div>
  <div className="h-72"><YourOwnCard /></div>
</div>
```

Three panels, one width, one top edge, one bottom edge.

`fill` only lifts the **module** cap. Caps that shape content stay —
`charts/gauge` keeps the `max-w-56` on its arc, so a filled gauge is a wider
card around the same dial, not a stretched one.

Pair it with `gradient={false}`: the glow is drawn outside the card, in the gap
`fill` removes (see Gotchas).

## Gotchas

- **`gradient` is a gallery effect. Turn it off in an app.** It does two things,
  and both assume the card is floating on the gallery's preview background:
  - the rainbow glow sits at `bottom-0` with a `blur-sm`, so it is drawn
    **outside the card**, in the gap between the card and the edge of the
    block's box. In a preview stage that gap is generous and it reads as a
    halo; in a panel sized to its content it escapes the frame and reads as a
    colour leak;
  - a `bg-background/75 mask-t-from-50%` veil over the bottom 64 px fades the
    card into that glow — and with it the donut's legend and the bar chart's
    axis labels.

  `gradient={false}` on anything that is a panel rather than an illustration.
  Keeping it on "just one hero card" does not work either: the leak is then the
  only thing that differs between otherwise identical tiles.
- **A block centres a capped-width card in your box** — unless you pass `fill`.
  See [Using a block as a panel](#using-a-block-as-a-panel).
- **`trigger="mount"` replays on every remount.** In a filtered list that
  re-keys its children, the entrance runs again on each change. Prefer
  `"inView"` (the default, once) unless the panel really is mounted once.
- **Screenshot tests must wait out the choreography.** Entrances chain up to
  ~1.3 s (the donut reveals its centre at 1.1 s and its legend at 1.2 s).
  Playwright's `reducedMotion` disables transforms but not opacity, so a
  capture taken at `networkidle` shows half-drawn charts.

## Composing your own previews

There is no preview-frame component to import: the gallery's lives in
`apps/gallery/src/components/preview-frame.tsx`. `@cremona/core` exports what it
is built from — `FRAME_HEIGHTS` (stage height per variant `size`) and `gridCols`:

```tsx
import { FRAME_HEIGHTS, gridCols, cn } from "@cremona/core";

<div className={cn("grid grid-cols-1 gap-2", gridCols(2))}>
  <div className="flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20">
    <div className={cn("flex grow items-center gap-2", FRAME_HEIGHTS.md)}>
      <StatCard animated trigger="inViewRepeat" />
    </div>
  </div>
</div>
```

## SSR / RSC notes

- Blocks render deterministically server-side (that's how parity is verified).
- SVG gradient/mask ids come from `useId`: unique within one React root, so
  many blocks can share a page. With several roots on one page (islands,
  micro-frontends), give each root its own `identifierPrefix`.
- Blocks that show a demo photo by default load it from
  `/media/placeholders/…`; the images ship in `@cremona/blocks/public/media/`,
  to copy into your app's public directory
  ([getting-started.md](getting-started.md#7-placeholder-images)).
- Every block module starts with `"use client"`: import blocks from Server
  Components freely, with serializable props. A component-typed prop
  (`icon={Users}`) cannot cross that boundary — pass it from a client module of
  your own ([the pattern](getting-started.md#8-nextjs-app-router-and-server-components)).

## Reduced motion

Wrap the app once in motion's `MotionConfig`:

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">{app}</MotionConfig>
```

For users who ask for reduced motion, entrance transforms then jump to their
end state (fades remain). Looping animations stop on their own: blocks run them
only while `useLoopActive` allows it.

## Hooks

- `useInView(ref, { once, initial, margin, amount })` — port of the POC hook;
  `observeInView(targets, onEnter, options)` for non-React contexts.
- `useLoopActive(ref, enabled)` — `true` while a looping animation should run:
  `enabled`, the element intersects the viewport, the page is visible and the
  user does not ask for reduced motion. It is `true` on the server and while
  hydrating, so a block's server markup stays its looping state.
- `usePrefersReducedMotion()` — the media query, `false` on the server and while
  hydrating.
