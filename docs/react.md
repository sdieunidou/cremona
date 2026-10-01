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
lucide-react 1.47+); `@cremona/core` (types, `cn`, `frameClasses`,
constants) and `@cremona/react` (`useInView`, `useLoopActive`, `useFitScale`…)
come as dependencies ([Shared helpers](#shared-helpers)).
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
| `className` | — | added to the root's classes (see [Gotchas](#gotchas) for overrides) |

Cross-block style props, on the blocks with a card wrapper: `fadeOut` (mask
fade at the card bottom), `isometric` (3D tilt), `gradient` (rainbow glow +
veil).

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
   reader (the copy of `states/*` screens is the exception:
   [States](#states));
2. that root is a **preview frame**
   (`relative isolate flex size-full items-center justify-center overflow-hidden px-2`)
   that centres a `max-w-*` card inside whatever box you give it;
3. it takes **content** props (`label`, `value`, `items`…) but no `onClick`, no
   `ref`, no `children` — `components/table` renders the `columns` and `rows`
   you give it, and its checkboxes toggle, but nothing reaches your code.

So a block cannot become a form field, a sortable table or an editable grid.
There are two correct ways to use one.

### The components layer

`components/*` render at their real size and take their content as props —
strings, arrays and plain objects, with lucide components for icons — whose
defaults reproduce the gallery's demo content: pass yours.

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

The other components (`alert`, `avatar`, `badge`, `checkbox`, `dropdown-menu`,
`pagination`, `progress`, `skeleton`, `switch`) take their content the same
way. Every component's full props are in the _Props_ table of its gallery page
and in `get_block`'s `api`.

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
| **remove** | the preview frame wrapper and its `aria-hidden="true"`; the `useInView` plumbing (`inViewOnce` / `inViewRepeat` / `state`); the `noFocus` spreads (`tabIndex: -1` and a `mousedown` `preventDefault`) and the `tabIndex={-1}` that keep preview controls out of the tab order |
| **add** | real props — `children`, handlers, forwarded `ref`, ARIA, keyboard |
| **keep** | everything else: class strings (the focus recipe included), `motion` variants, transitions, SVG markup, and the `useLoopActive` gate on every loop |

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

A loop you keep — a spinner, a pulse, a typing caret — stays behind
`useLoopActive(ref, enabled)`, so it pauses off-screen, in a hidden tab and
under reduced motion; pass `true` for a loading spinner that is the state
itself, `animated` for decoration ([Shared helpers](#shared-helpers)).

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

- A `labels` object overrides any of the kit's English strings; placeholders
  such as `{step}`, `{score}` and `{rating}` in them, and `{count}` in
  product-grid's `countLabel`, are replaced.
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

## Labels and locale

A block renders its own interface text (buttons, column headers, status words,
units, placeholders, `aria-label`s) in English and formats the numbers and
dates it computes itself as `en-US`. Two optional props change that, so a
French — or any non-English — interface uses the blocks without editing them:

| Prop | Default | Meaning |
|---|---|---|
| `labels` | English | `Partial<XLabels>`: the interface text you want to change; every key you leave out keeps its English default |
| `locale` | `"en-US"` | BCP 47 tag for the numbers, percentages, currencies, dates and plurals the block formats itself |

Without them a block renders exactly what the gallery shows. Content stays in
the content props it already had (`title`, `emptyLabel`, `unit`, `items`,
`rows`…): `labels` only covers the text no other prop reaches.

```tsx
import { Filters, filtersDefaultLabels } from "@cremona/blocks/data/filters";

<Filters
  title="Filtres"
  unit="clients"
  total={2480}
  rules={rules}
  addLabel="Ajouter un filtre"
  labels={{ where: "Où", and: "Et", clear: "Effacer", of: "sur {total} {unit}" }}
  locale="fr-FR"
/>;
// filtersDefaultLabels → { where: "Where", and: "And", clear: "Clear", of: "of {total} {unit}" }
```

- **Which blocks.** The _Props_ table of each block page lists its `labels`
  and `locale` props; the English defaults are exported next to the component
  as `xDefaultLabels`, typed by an `XLabels` interface
  (`filtersDefaultLabels: FiltersLabels`, `uptimeBarDefaultLabels`…). Blocks
  whose visible text changes have a `french` variant in the gallery: its
  "Copy React" snippet is a complete French example.
- **Placeholders.** `{name}` in a label is replaced by a value
  (`"of {total} {unit}"`, `"{count} rows"`, `"Page {page} of {total}"`), so the
  word order is yours. Each key's description lists its placeholders.
- **Plurals.** A count comes as a pair of keys, `x` and `xOne`
  (`rows` / `rowsOne`, `daysAgo` / `daysAgoOne`). The block uses `xOne` when
  `new Intl.PluralRules(locale).select(count)` is `"one"` — French uses the
  singular for 0 and 1 — and `x` otherwise. Languages with more plural forms
  get `x` for every count that is not "one".
- **Status and enum words** are keyed by the value they translate
  (`labels={{ operational: "Opérationnel", degraded: "Dégradé" }}`); the value
  keeps its colour.
- **`locale`** drives `Intl.NumberFormat` (grouping, decimal separator, the
  space before `%`, compact notation such as `1,2 M`), `Intl.PluralRules` and
  `Intl.DateTimeFormat` (month and weekday names). Dates are built and
  formatted in UTC, and no block reads the clock while rendering, so the
  server and the browser print the same text.
- **Pre-formatted strings are yours.** Props such as `value="$48.2k"`,
  `change="+12%"` or `latency="42 ms"` are shown as given: format them with the
  same locale before passing them.
- **`aria-label`s follow `labels` too**, even inside the `aria-hidden` preview
  root: they matter as soon as you derive a component from the block.
- `geo/world-map`'s `labels` is a boolean (marker labels on or off): it shows
  no interface text of its own.

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
- **`className` adds classes; it does not replace the block's.** `cn` joins
  class names without resolving conflicts, so between your `p-0` and the
  root's `px-2` the rule that comes later in the stylesheets wins, whatever
  the order in the attribute. Put size, margins and position on a wrapper
  element of your own. To change one of the block's classes, use your Tailwind
  build's important modifier (`px-0!`) or a more specific selector of your
  own.
- **`trigger="mount"` replays on every remount.** In a filtered list that
  re-keys its children, the entrance runs again on each change. Prefer
  `"inView"` (the default, once) unless the panel really is mounted once.
- **Screenshot tests must wait out the choreography.** Entrances chain over one
  to two seconds (the donut reveals its centre at 1.1 s and its legend at
  1.2 s; `ai/prompt-box` types its prompt first and finishes its toolbar at
  about 1.8 s).
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
- Ids — SVG gradients, masks and clip paths, and the `for` and `aria-*`
  references of the components and kits — come from `useId`: unique within one
  React root, so many blocks can share it. Separate roots number their ids from
  the same start: with several roots on one page (islands, micro-frontends, a
  root per widget that a Stimulus controller mounts), two blocks get the same
  ids, and a gradient or a label resolves into the other root. Give each root
  its own `identifierPrefix`, the same on the server and in the browser:

  ```tsx
  createRoot(el, { identifierPrefix: "pricing-" }).render(<Pricing />);
  // server-rendered root
  renderToString(<Pricing />, { identifierPrefix: "pricing-" });
  hydrateRoot(el, <Pricing />, { identifierPrefix: "pricing-" });
  ```
- Blocks that show a demo photo by default load it from
  `/media/placeholders/…`; the images ship in `@cremona/blocks/public/media/`,
  to copy into your app's public directory
  ([getting-started.md](getting-started.md#7-placeholder-images)).
- Every block module starts with `"use client"`: import blocks from Server
  Components freely, with serializable props. A component-typed prop
  (`icon={Users}`) cannot cross that boundary — pass it from a client module of
  your own ([the pattern](getting-started.md#8-nextjs-app-router-and-server-components)).
- `geo/globe` and `geo/world-map` draw their land dots from
  `@cremona/core/land-mask`, a subpath of `@cremona/core`: a copied source
  resolves it through the package's `exports`.

## Reduced motion

Wrap the app once in motion's `MotionConfig`:

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">{app}</MotionConfig>
```

For users who ask for reduced motion, entrance transforms then jump to their
end state (fades remain). Looping animations stop on their own: blocks run them
only while `useLoopActive` allows it.

## Shared helpers

Blocks import only `react`, `motion/react`, `lucide-react`, `@cremona/core` and
`@cremona/react`; a component derived from one uses the same helpers.

`@cremona/react` (React 18.2+ or 19):

| Export | Use |
|---|---|
| `useInView(ref, { once, initial, margin, amount })` | `true` while the element is in view (from its first entry with `once`). `amount` is the share that must show (`0.5` in blocks), capped at the share the element can show. Blocks start their entrance with it |
| `observeInView(targets, onEnter, options)` | the same observer outside React; `onEnter` may return a cleanup, run when the target leaves — without one, the target is observed until its first entry |
| `useLoopActive(ref, enabled)` | `true` while a loop should run: `enabled`, the element intersects the viewport, the page is visible and the user does not ask for reduced motion. `true` on the server and while hydrating, so server markup shows the looping state. Blocks gate every loop with it — `enabled` is `animated`, or `true` for a spinner that is the loading state — and render a resting frame when it is `false` |
| `usePrefersReducedMotion()` | the `prefers-reduced-motion: reduce` media query; `false` on the server and while hydrating |
| `useFitScale(frame, stage, layout?)` | scales `stage` down (CSS `scale`, never up) to fit `frame`'s content box, again when either resizes or `layout` changes; client-only |

`@cremona/core` (framework-agnostic; `@cremona/react` re-exports `cn` and its
types):

| Export | Use |
|---|---|
| `VisualProps`, `TriggerMode` | the props every block takes (`animated`, `trigger`, `fill`, `className`) |
| `cn(...classes)` | joins the truthy class names; it does not resolve conflicting utilities (see [Gotchas](#gotchas)) |
| `frameClasses(fill)` | a block root's classes: the preview frame, or a plain box with `fill` |
| `toFractions(points, values?, min?, max?)` | a series as heights from 0 to 1, `null` for a missing value: the contract of `line`, `sparkline` and `trend` |
| `FRAME_HEIGHTS`, `gridCols(cols)` | the gallery's stage height per variant `size`, and its grid columns |
| `ISO_HIDDEN`, `ISO_VISIBLE`, `ISO_TRANSITION`, `RAINBOW_GRADIENT`, `EASE_OUT` | the isometric transform and its transition, the glow gradient, the entrance easing |
| `BlockMeta`, `VariantDef` | the shape of a block's `block.json` |
| `@cremona/core/land-mask` | `isLand(lat, lng)`, `landMask()` and the `LAND_MASK_*` constants: the land mask the `geo/*` maps draw from |
