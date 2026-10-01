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

Per-block content and data props default to the gallery's demo content
(`label`, `value`, `change`, `trend` for stat-card). Each block's generated
props reference lists them with their types, defaults and descriptions: the
_Props_ table of its gallery page, `get_block`'s `api`, or `api.json` in the
block's folder; [Block data props](#block-data-props) says how blocks treat
real data. **The exact props of each variant** are in the block's
`preview-props.json` — values like `"lucide:Users"` mean "pass the lucide-react
icon component with that name", and
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
   `ref`, no `children` — `components/table` renders the `columns` and `rows`
   you give it, and its checkboxes toggle, but nothing reaches your code.

So a block cannot become a form field, a sortable table or an editable grid.
There are two correct ways to use one.

### The components layer

`components/*` render at their real size and take JSON-serializable content
props whose defaults reproduce the gallery's demo content — pass yours:

| Block | Content props |
|---|---|
| `accordion` | `items`, `active` (the item open on first render) |
| `breadcrumb` | `items` (labels, or `{ label, href }` links) |
| `button` | `label`, `variant`, `size`, `icon`, `href` (renders a link styled as a button), `loading` + `loadingText`, `disabled`; the icon-only sizes (`icon`, `icon-sm`) show the icon and use `label` as the `aria-label` |
| `card` | `title`, `description`, `badge`, `rows`, `footer`, `action` + `actionHref` |
| `command` | `catalog` (groups of items with icon, shortcut, keywords), `placeholder`, `emptyText`, `emptyHint` |
| `dialog` | `title`, `description`, `variant` (`"destructive"` is an alertdialog), `actionLabel`, `cancelLabel`, `fields`, `changes` |
| `input` | `label`, `placeholder`, `hint`, `errorText`, `invalid`, `disabled`, `defaultValue` |
| `select` | `options` (values, or `{ value, label }`), `value`, `label`, `placeholder`, `errorText`, `invalid`, `disabled` |
| `table` | `columns`, `rows` (text, two-line or status-pill cells), `caption`, `checkboxes`, `loading` + `loadingRows` |
| `tabs` | `items` (label, icon and body per tab), `active`, `label` (the tab list's name) |
| `tooltip`, `toast`, `kbd` | `content`, `side`, `triggerLabel`; `title`, `description`, `action`, `variant`, `dismissible`; `keys`, `caption` |

Inside the preview they behave like the real thing — keyboard focus with one
ring recipe (`focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-ring`, inset with `-outline-offset-2` on list and menu
items), arrow keys in `command`, `select`, `tabs`, checkboxes and switches
that toggle, ids from `useId` — but the state stays inside the block. Keep
that ring recipe when you derive one.

With `fill` (see [Using a block as a panel](#using-a-block-as-a-panel)) each
kind takes the box its own way: cards fill it (`card`, the `command` palette,
whose list then scrolls); controls take its full width at the top (`button`,
`input`, `select`, `switch`, `toast`…); `badge`, `avatar` and `kbd` stay
centred at their size; `dialog` stays centred at its size over a scrim that
fills the box.

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

## Block data props

Every block has a generated props reference: each prop's type, default and
description, read from its source into
`packages/blocks/src/<category>/<file>/api.json`. The gallery shows it as the
_Props_ table at the bottom of each block page, `get_block` returns it as
`api`, and the TypeScript declarations carry the same JSDoc. This section is
the contract those tables do not spell out: how blocks treat real data.

- Every text and data prop defaults to the gallery's demo content, which only
  fills in for a prop you leave out: pass your own.
- An empty array renders empty, never as the demo data — charts, data and
  status blocks say so with their `emptyLabel`, search blocks with
  `labels.empty`.
- Values outside a prop's range (NaN, a negative count, an unknown enum value)
  render a neutral fallback instead of breaking the block.
- Icon props take a lucide component (`icon={Users}`) and, where the type says
  so, an element; the kits take icon keys (`icon: "share"`) instead, which
  stay serializable.

### Charts and metrics

- `charts/line`, `charts/sparkline` and `metrics/trend` take `values` in their
  own unit, scaled to `min`..`max` (default: the series' range), or `points`,
  heights from 0 to 1 — `points` outside 0–1 are rescaled like `values`.
  Non-finite samples are skipped and the line joins across the gap; one sample
  draws a flat line; `line` keeps at most 8 `ticks`.
- `charts/bar` hangs negative `items` from a zero baseline and draws no bar for
  0 or NaN; `charts/donut` gives zero, negative and non-finite `segments` no
  share, and a segment without `color` the next chart colour; `charts/funnel`
  reads negative counts as 0 and counts from a million compact (`1.2M`, en-US);
  `charts/heatmap` draws a non-finite value as an empty, outlined cell.
- `charts/gauge` clamps the arc to 0–100 while `value` (default: the rounded
  `percent`) shows the real figure; a non-finite `percent` draws no arc and
  reads "—". A zone's `className` is a text colour class: the arc strokes
  `currentColor`.
- `positive: "down"` (bar, line, sparkline, funnel, gauge, heatmap,
  stat-card) makes a fall the good news, drawn green: churn, latency, costs. A
  `change` that starts with `-` or `−` reads as a fall.

### Data, status and payments

- `data/query`: no `conditions` hides the WHERE panel; without `columns`, the
  `rows` set the column count. `data/import`: a mapping without `target` reads
  `skipLabel`. `data/table`: rows are objects read by each column's `key`; an
  `avatar` column also shows `initials` and `subtitle`, a `badge` column
  colours `active` and `pending`.
- `status/uptime-bar`: `incidents` and `outages` are day indexes (0 = oldest;
  the last of `days` is today). `status` defaults to today's — an outage or an
  incident on the last day, else operational — except for the demo window
  (neither prop passed), which reads "Major outage". `uptime` defaults to the
  share of days with neither.
- `status/health-check`: an item's `status` is `operational`, `degraded` or
  `down`; another value renders neutral, with its own text.
- `status/resource-monitor`: a series without `jitter` is drawn as given
  (fractions 0–1 or percentages 0–100), its last sample the reading; with
  `jitter`, it is a simulated live signal that keeps scrolling while animated.
- `payments/usage-meter`: from `warnAt` on, the meter turns to the warning
  colour, and destructive at a `usedRatio` of 1; an item's `color` is a `bg-*`
  class or any CSS colour.

### Connections

`connections/converge` (`nodes`, up to 4), `flow` (`sources`, `transforms` and
`destinations`: three, two and three slots), `pipeline` (`logo`, `inputs`,
`outputs`) and `sync` (`pairs` of `[left, right]`, up to 4) take each node as a
lucide icon component, drawn at the node's icon size, or any element. A missing
node is an empty, dashed slot that no pulse goes to; `logo={null}` draws no hub.

### States

`states/empty`, `error`, `maintenance` and `not-found` become real screens when
you pass `title`, `description` or `actions`. The illustration, still
`aria-hidden`, sits above an accessible heading (`titleAs`: `h2` by default,
`h1`, `h3` or `p`), the text and a row of actions,
`{ label, href?, onClick? }` — a link with `href`, a button otherwise; the
first one is the primary action. `className` then applies to that column.

```tsx
<NotFound
  fill
  titleAs="h1"
  title="Page not found"
  description="This page moved or never existed."
  actions={[{ label: "Back home", href: "/" }, { label: "Search", href: "/search" }]}
/>
```

`states/error` exports `ErrorState` (`ErrorStateProps`) and `sections/error`
exports `ErrorSection`; both modules keep `Error` as a deprecated alias.
`onClick` is a function, which a Server Component cannot pass: use `href` there.

### Sections

Section wireframes draw bars where text would go; a text prop draws your text
in place of its bars. List props — pricing `plans`, stats `values`, faq
`items`, features `features`, process `steps`, timeline `items`, team
`members`, logos `logos` — take strings or objects, and most also a count (up
to 12) of blank items. Testimonials take their `quotes` marks (`["« ", " »"]`
in French), comments a preformatted `count`.

### Images, keyboard, search, notifications

- `images/carousel`: `activeIndex` (default 1) centres that slide and lights its
  dot, the neighbours wrap around `slides`; `count`, the number of dots,
  defaults to `slides.length`. A slide's `alt` defaults to its `title`; in
  `images/gallery`, `title` names the tile and `alt` describes the photo when
  it should differ.
- `keyboard/half`: `keymap: "azerty"` lays out the French left half; `labels`
  maps key names to captions (`{ shift: "maj", "caps lock": "verr. maj" }`)
  while `keys` keep using the key names.
- `search/command-palette` and `search/results`: an item's `icon` is a lucide
  component or an element; a palette over 8 items is clipped with a fade;
  `labels` holds the footer hints and the empty text.
- `notifications/list`: an item's `icon` is a kind (`message`, `heart`,
  `follow`, `pr`, `star`); `notifications/toast` has an `error` variant;
  `notifications/bell` reads "99+" above 99.

### Kits: forms, ecommerce, mobile, notices

- A `labels` object overrides any of the kit's English strings, and tokens in
  them (`{step}`, `{total}`, `{count}`, `{score}`, `{rating}`, `{email}`) are
  replaced.
- Icons are keys mapped inside the block (`icon: "share"`), so every prop is
  serializable, from a Server Component too.
- `ecommerce/cart-drawer` and `checkout-summary` take amounts as numbers: line
  totals, subtotal, discount, tax (on the discounted subtotal) and total are
  computed, rounded to cents and formatted with
  `Intl.NumberFormat(locale, { style: "currency", currency })`.
- `forms/login` `providers={[]}` hides the social buttons and the divider;
  `notices/callout` `link=""` and `notices/update-banner` `linkLabel=""` hide
  the link.
- `mobile/tab-bar` `dark`, `layouts/mobile-app-shell` `dark` and
  `layouts/marketing-shell` `darkHero` put the `dark` class on the block's own
  element: that subtree takes the dark tokens of the page's theme, in a light
  page too ([Dark mode](design-system.md#dark-mode)).

## Using a block as a panel

By default a visual renders for the gallery: the preview frame centres it
(`flex items-center justify-center … px-2`) and the card inside caps at a
`max-w-*` that varies from block to block (`max-w-72`, `max-w-80`,
`max-w-96`…). Drop three in a grid and you get three widths, three left edges
and three top edges.

`fill` turns the frame into a plain box the visual occupies entirely: no side
padding, no module cap, and the card stretched to the box's height (the card
wrapper becomes `h-full flex flex-col`, the card `flex-1`). Stages with a fixed
aspect keep it, never distorted: the `geo/world-map` and `geo/pin-drop` maps
and the `devices/tablet` and `devices/laptop` frames are contained in the box
(as large as fits, centred); other fixed-size stages (connections, the credit
card, file and avatar stacks…) stay at their natural size, centred.

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

Give a panel the height its content needs: below it, the content is clipped.
Taller than `h-72` (18rem): `data/query` (about 330 px), `data/filters` (about
320 px), `data/import` (about 310 px), `payments/usage-meter` and
`status/health-check`. A `connections/*` stage needs about 185–200 px of
height.

On the client, after hydration, blocks adapt to small boxes without changing
their server markup:

- fixed-size stages scale down to fit their box — `states/*`,
  `search/semantic` and `keyboard/half` (CSS `scale`, by width and height,
  `useFitScale`), and the 416 × 288 canvases of `ai/retrieval`, `api/*` and
  `git/branch-graph` (CSS `zoom`, by width);
- a block taller than twice the viewport still plays its entrance: the
  `inView` and `inViewRepeat` triggers wait for the largest share of the block
  that fits in the viewport, up to half of it.

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
