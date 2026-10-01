# Getting started

Use Cremona blocks in a React app (Vite, Next.js…): install, load the
stylesheet, render a block, then the details a real app runs into — panels,
dark mode and themes, reduced motion, images, Server Components and your own
CSS.

Know what you are installing first. Every block is a **preview composition**:
an animated, `aria-hidden` illustration that takes content props (`label`,
`value`, `segments`…) but no handlers, `ref` or `children`. They come in three
scales:

| Scale | Blocks | Use |
|---|---|---|
| illustration | `metrics/*`, `charts/*`, `ai/*`, `states/*`… (every category not listed below) | product artwork: KPI cards, charts, scenes, empty states |
| real-size | `components/*`, `forms/*`, `mobile/*`, `notices/*`, `ecommerce/product-card`, `ecommerce/order-row`, `ecommerce/checkout-summary` | UI at its real size (12–16 px text): templates to derive your own components from |
| miniature | `sections/*`, `layouts/*`, `ecommerce/product-grid`, `ecommerce/cart-drawer` | thumbnail-scale wireframes (7–10 px text): illustrations of a page, never a page |

The MCP server reports this as each block's `scale`.

A form field, a sortable table or a dialog you ship is **derived** from a block,
not the block itself: see [Preview compositions vs production UI](react.md#preview-compositions-vs-production-ui).

Tested with React 19.3 and 18.3, Next.js 16.3 (Turbopack and webpack), Vite 8.3,
TypeScript 6.0 (`strict`, `noUncheckedIndexedAccess`), motion 13.4 and
lucide-react 1.49. The stylesheet is Tailwind v4 output (cascade layers, `oklch()`
colours, `color-mix()`): Safari 16.4+, Chrome 111+, Firefox 128+.

## 1. Install

```bash
npm i @cremona/blocks @cremona/tokens motion lucide-react
```

`react` and `react-dom` (18.2+ or 19), `motion` (12 or 13) and `lucide-react`
(1.47+) are peer dependencies: your app provides the one copy every
block shares, which is what lets your `MotionConfig` reach them.
`@cremona/core` and `@cremona/react` come with `@cremona/blocks`; add them
yourself only when your own code imports them (a derived component does).

## 2. Load the stylesheet, once

`@cremona/tokens` ships three stylesheets. Load one, once:

| Your app | Stylesheet |
|---|---|
| no Tailwind, no CSS framework (a new Vite or Next.js app) | `css/cremona.css`, below |
| its own Tailwind CSS v4 build (create-next-app's default) | `css/tailwind.css`, inside that build: [section 9](#9-your-own-css-or-tailwind) |
| CSS of its own that must keep working (Bootstrap, a theme, an existing app) | `css/cremona.scoped.css`, with the blocks inside a `.cremona` element: [Next to other CSS](design-system.md#next-to-other-css) |

```tsx
// Vite: src/main.tsx — Next.js: app/layout.tsx
import "@cremona/tokens/css/cremona.css";
```

`cremona.css` holds the Inter Variable font (its seven `.woff2` files sit next
to it; Vite and Next.js bundle them), the tokens of the 9 themes in light and
dark, Tailwind's preflight reset and every utility class the blocks use. The
blocks need no Tailwind build. Its reset applies to the whole page.

Remove what the app template ships, because it overrides the same names:

- **Vite**: delete `src/index.css` and `src/App.css` and their imports.
- **create-next-app**: without Tailwind, delete `app/globals.css` and its
  import. With Tailwind (the default), do not load `cremona.css`: turn
  `app/globals.css` into the stylesheet of [section 9](#9-your-own-css-or-tailwind).
  The Geist `next/font` setup can go: blocks use Inter.

Those rules are unlayered, so they beat the layered ones in `cremona.css`
whatever their specificity: blocks lose their padding, fall back to Arial, or
turn invisible in OS dark mode.

## 3. Render a block

```tsx
import { Users } from "lucide-react";
import { StatCard } from "@cremona/blocks/metrics/stat-card";

<div style={{ height: "12rem" }}>
  <StatCard
    fill
    gradient={false}
    icon={Users}
    label="Active users"
    value="12,481"
    change="+8.1%"
    period="vs last week"
    trend="up"
  />
</div>
<p className="sr-only">Active users: 12,481, up 8.1% on last week.</p>
```

- **Import path**: `@cremona/blocks/<category>/<file>`, one entry per block
  (ESM and types), exporting the component named after the block
  (`charts/donut` → `Donut`) and its props type (`DonutProps`); a few names
  differ (`sections/headers` → `Header`, `states/error` → `ErrorState`). The
  gallery's *Copy React* and the MCP `get_block` give the exact line.
- **Size**: a block fills the box you give it. Give that box a height.
- **Content**: pass every text prop. The defaults are demo copy ("Pro Plan",
  "of 100GB"), so a prop you leave out shows it. Data goes in props too:
  `values` for a line chart, `segments` for a donut, `rows` for a table. Each
  block's props, with types and defaults, are in the _Props_ table of its
  gallery page; how blocks treat real data is in
  [Block data props](react.md#block-data-props). An empty array renders
  empty, never as the demo data.
- **Language**: interface text the content props do not reach (buttons,
  column headers, status words) takes a `labels` object, and `locale="fr-FR"`
  formats the numbers and dates a block computes — see
  [Labels and locale](react.md#labels-and-locale).
- **Accessibility**: the block's root is `aria-hidden`. Say what it shows in
  text next to it ([what blocks guarantee and what you add](accessibility.md)).
- **Animation**: `animated={false}` (the default) renders the final state.
  `animated` plays the entrance when the block scrolls into view
  (`trigger="inView"`); `trigger="mount"` plays it on mount.

The full props contract is in [react.md](react.md#props-contract). The next
examples lay the page out with Tailwind classes; without Tailwind, use CSS of
your own ([section 9](#9-your-own-css-or-tailwind)).

## 4. Panels: `fill` and `gradient={false}`

Out of the box a block renders as it does in the gallery: centred, with side
padding and a capped width. In an app grid, pass `fill` so it occupies its box,
and `gradient={false}` so its rainbow glow does not spill outside the card:

```tsx
<div className="grid gap-4 lg:grid-cols-3">
  <div className="h-80">
    <Gauge fill gradient={false} title="Uptime" badge="30 days" percent={99} value="99.2%" label="SLA met" change="+0.4%" />
  </div>
  <div className="h-80">
    <Donut fill gradient={false} title="Sprint load" badge="Week 40" centerValue="90 d" centerLabel="planned" segments={segments} />
  </div>
  <div className="h-80">
    <WorldMap fill markers={offices} />
  </div>
</div>
```

Components take the box their own way — cards fill it, controls take its full
width at the top, badges stay centred. Details and caveats:
[Using a block as a panel](react.md#using-a-block-as-a-panel),
[the components layer](react.md#the-components-layer) and
[Gotchas](react.md#gotchas).

## 5. Dark mode and themes

Both are classes on `<html>`: `dark` for dark mode, and `theme-<name>` for the
eight themes besides the default — `claude-plus`, `light-green`, `zen`,
`sakura`, `tiesen`, `deep-purple`, `indigo-clean`, `brutalism` (see
[design-system.md](design-system.md)). Apply them before the first paint, or the
page flashes light first: put the design system's
[anti-flash script](design-system.md#dark-mode) first in `<head>`. It reads the
choice from `localStorage` (`cremona-appearance`, `cremona-theme`) and follows
the OS setting by default.

- **Vite**: in the `<head>` of `index.html`.
- **Next.js**: render it in the root layout (the script as a string,
  `appearanceScript`), and mark `<html>` so React accepts the classes it adds
  before hydration:

  ```tsx
  <html lang="en" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
    </head>
    <body>{children}</body>
  </html>
  ```

A toggle flips the class and saves the choice under the same key:

```ts
const dark = document.documentElement.classList.toggle("dark");
document.documentElement.style.colorScheme = dark ? "dark" : "light";
try {
  localStorage.setItem("cremona-appearance", dark ? "dark" : "light");
} catch {
  // storage blocked: the choice lasts for the page
}
```

`dark` on an inner element renders that subtree with the dark tokens of the
page's theme, in a light page too.

## 6. Reduced motion

Wrap the app once:

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">{app}</MotionConfig>
```

For users who ask for reduced motion, entrance transforms then jump to their
end state and fades remain; looping animations pause on their own (also
off-screen and in a hidden tab). In Next.js,
`MotionConfig` can wrap `{children}` directly in `app/layout.tsx`: motion ships
it as a client component.

## 7. Placeholder images

Some blocks show demo photos from `/media/placeholders/`:
`ecommerce/product-card`, `order-row` and `cart-drawer` by default,
`components/avatar` with its deprecated `img` prop, and the photo variants of
`images/*`. The images ship in the package; copy them into the directory your
app serves at its root:

```bash
cp -R node_modules/@cremona/blocks/public/media public/
```

Vite and Next.js both serve `public/` at `/`. Where a block takes an image
prop, pass your own image instead.

## 8. Next.js App Router and Server Components

Every block module starts with `"use client"`, so a Server Component — a
`page.tsx` that exports `metadata`, say — imports and renders blocks directly.
Do not mark the page `"use client"` to use a block.

What crosses from a Server Component to a block must be serializable: strings,
numbers, booleans, plain objects and arrays, JSX elements. A **function** does
not — and icon components are functions:

```tsx
// app/page.tsx (Server Component)
<StatCard icon={Users} … />
// → build error: Functions cannot be passed directly to Client Components…
```

Keep the icon choice on the client side, in a module of your own:

```tsx
// app/kpi.tsx
"use client";

import { Activity, ShoppingCart, Users } from "lucide-react";
import { StatCard, type StatCardProps } from "@cremona/blocks/metrics/stat-card";

const icons = { users: Users, orders: ShoppingCart, sessions: Activity };

export function Kpi({ icon, ...props }: Omit<StatCardProps, "icon"> & { icon: keyof typeof icons }) {
  return <StatCard fill gradient={false} icon={icons[icon]} {...props} />;
}
```

```tsx
// app/page.tsx (Server Component)
<Kpi icon="users" label="Active users" value="12,481" change="+8.1%" period="vs last week" trend="up" />
```

The same applies to any prop typed as a component (`LucideIcon`,
`ComponentType`) or a callback.

Blocks render the same markup on the server and in the browser, so static
prerendering and hydration are clean. Their ids (SVG gradients, label and ARIA
references) come from `useId`, unique within one React root: with several
roots on one page — islands, micro-frontends — give each its own
`identifierPrefix` ([SSR / RSC notes](react.md#ssr--rsc-notes)).

## 9. Your own CSS, or Tailwind

`cremona.css` contains the classes the blocks use, and nothing else. A class you
write in your own markup gets a rule only if some block happens to use it too:
do not rely on it.

**Without Tailwind**, style your layout with CSS of your own (plain CSS, CSS
modules…) on Cremona's tokens, so it follows the theme and dark mode:

```css
.panel-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); }
.toolbar button {
  color: var(--foreground);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.8);
}
```

**With Tailwind CSS v4** (create-next-app's default), let your build compile the
blocks' classes along with yours, and do not load `cremona.css`: two Tailwind
outputs on one page override each other class by class (its `sm:grid-cols-2`
would beat your `lg:grid-cols-4`). `@cremona/tokens/css/tailwind.css` brings
what Cremona adds to Tailwind — the Inter font, the tokens of the 9 themes, the
theme mapping (`bg-card`, `text-muted-foreground`, the radius and weight
scales), the `dark` variant on the `.dark` class, the `data-*` state variants, a
few utilities and the base styles — without Tailwind itself:

```css
/* app/globals.css (Next.js) — src/index.css (Vite with @tailwindcss/vite) */
@import "tailwindcss";
@import "@cremona/tokens/css/tailwind.css";
@source "../node_modules/@cremona/blocks/dist";
```

- `@source` points Tailwind at the compiled blocks, which it does not scan on
  its own (`node_modules`); the path is relative to the stylesheet. To compile
  only the blocks you use, list their folders instead
  (`@source "../node_modules/@cremona/blocks/dist/metrics/stat-card";`).
- Delete the template's `:root`, `@theme inline`, `prefers-color-scheme` and
  `body` rules: `tailwind.css` defines the same names (`--background`,
  `--foreground`…).
- The blocks render as with `cremona.css`, and your markup shares their
  values: `bg-card`, `rounded-3xl` or `font-medium` (510) resolve to Cremona's,
  and your `dark:` classes follow the `.dark` class.
- `@tailwindcss/vite` and `@tailwindcss/postcss` rebase the font URLs, so Vite
  and Next.js bundle the Inter files from `node_modules`.

Checked with Vite 8.3 + `@tailwindcss/vite` 4.3 and Next.js 16.3 (Turbopack and
webpack) + `@tailwindcss/postcss` 4.3, from the packed packages: every element of
18 blocks gets the computed style it has with `cremona.css`, in light and dark
(Next.js writes a few colours and gradient stops in another notation).

**With CSS of its own** that must keep working (Bootstrap, a theme, an existing
app), load `@cremona/tokens/css/cremona.scoped.css` instead of `cremona.css` and
render the blocks inside an element with the `cremona` class: the page and the
blocks then keep their own styles. See
[Next to other CSS](design-system.md#next-to-other-css).

## Next

- [react.md](react.md) — props, triggers, panels, gotchas, deriving a component.
- [design-system.md](design-system.md) — tokens, themes, fonts.
- [accessibility.md](accessibility.md) — what blocks guarantee, what your app adds.
- [mcp.md](mcp.md) — the MCP server, for AI sessions that build with Cremona.
