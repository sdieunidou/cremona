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
| real-size | `components/*`, `forms/*`, `mobile/*`, `notices/*`, most of `ecommerce/*` | UI at its real size (12–16 px text): templates to derive your own components from |
| miniature | `sections/*`, `layouts/*`, `ecommerce/product-grid`, `ecommerce/cart-drawer` | thumbnail-scale wireframes (7–10 px text): illustrations of a page, never a page |

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

```tsx
// Vite: src/main.tsx — Next.js: app/layout.tsx
import "@cremona/tokens/css/cremona.css";
```

`cremona.css` holds the Inter Variable font (its seven `.woff2` files sit next
to it; Vite and Next.js bundle them), the tokens of the 9 themes in light and
dark, Tailwind's preflight reset and every utility class the blocks use. The
blocks need no Tailwind build.

Remove what the app template ships, because it overrides the same names:

- **Vite**: delete `src/index.css` and `src/App.css` and their imports.
- **create-next-app**: without Tailwind, delete `app/globals.css` and its
  import. With Tailwind (the default), keep only `@import "tailwindcss";` in
  it — delete the `:root`, `@theme inline`, `prefers-color-scheme` and `body`
  rules — and finish with [Your own CSS, or Tailwind](#9-your-own-css-or-tailwind).
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
  (`charts/donut` → `Donut`) and its props type (`DonutProps`). The gallery's
  *Copy React* and the MCP `get_block` give the exact line.
- **Size**: a block fills the box you give it. Give that box a height.
- **Content**: pass every text prop. The defaults are demo copy ("Pro Plan",
  "of 100GB"), so a prop you leave out shows it.
- **Accessibility**: the block's root is `aria-hidden`. Say what it shows in
  text next to it.
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

Details and caveats: [Using a block as a panel](react.md#using-a-block-as-a-panel)
and [Gotchas](react.md#gotchas).

## 5. Dark mode and themes

Both are classes on `<html>`: `dark` for dark mode, and `theme-<name>` for the
eight themes besides the default — `claude-plus`, `light-green`, `zen`,
`sakura`, `tiesen`, `deep-purple`, `indigo-clean`, `brutalism` (see
[design-system.md](design-system.md)). Apply them before the first paint, or the
page flashes light first. With the choice kept in `localStorage`, and the OS
setting as the default:

```html
<script>
  (function () {
    var root = document.documentElement;
    var saved = localStorage.getItem("appearance") || "system";
    var dark = saved === "dark" || (saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    var theme = localStorage.getItem("theme");
    if (theme) root.classList.add("theme-" + theme);
  })();
</script>
```

- **Vite**: put it in the `<head>` of `index.html`.
- **Next.js**: render it in the root layout (the function above as a string,
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

A toggle only flips the class and saves the choice:

```ts
const dark = document.documentElement.classList.toggle("dark");
document.documentElement.style.colorScheme = dark ? "dark" : "light";
localStorage.setItem("appearance", dark ? "dark" : "light");
```

## 6. Reduced motion

Wrap the app once:

```tsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">{app}</MotionConfig>
```

For users who ask for reduced motion, entrance transforms then jump to their
end state and fades remain; looping animations pause on their own. In Next.js,
`MotionConfig` can wrap `{children}` directly in `app/layout.tsx`: motion ships
it as a client component.

## 7. Placeholder images

A few blocks fall back to demo photos under `/media/placeholders/`
(`components/avatar`, `ecommerce/product-card`, `ecommerce/order-row`,
`ecommerce/cart-drawer`…). The images ship in the package; copy them into the
directory your app serves at its root:

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
prerendering and hydration are clean. SVG gradient ids come from `useId`,
unique within one React root.

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

**With Tailwind CSS v4** (create-next-app's default), the page carries two
Tailwind stylesheets that define the same class names, and on the same class
the one loaded last wins. Loaded after yours, `cremona.css` breaks your
responsive classes (its `sm:grid-cols-2` beats your `lg:grid-cols-4`); loaded
before yours without more setup, your build redefines the blocks' `border`,
`rounded-*` and `font-*` classes with Tailwind's defaults. The setup that keeps
both right:

1. Import `cremona.css` **before** your own stylesheet:

   ```tsx
   // app/layout.tsx
   import "@cremona/tokens/css/cremona.css";
   import "./globals.css";
   ```

2. In your stylesheet, after `@import "tailwindcss";`, paste everything that
   follows the `@source` lines of
   [`packages/tokens/src/cremona.css`](../packages/tokens/src/cremona.css): the
   `dark` and `data-*` variants, the `no-scrollbar` utility, the `@theme` and
   `@theme inline` blocks (font, weights, radius scale, the semantic colours)
   and the `@layer base` rules. Your build then compiles the classes you share
   with the blocks to the same values, `bg-card` or `text-muted-foreground`
   work in your markup, and your `dark:` classes follow the `.dark` class.
3. Keep the template's `:root` and `body` rules out (step 2 of this guide).

## Next

- [react.md](react.md) — props, triggers, panels, gotchas, deriving a component.
- [design-system.md](design-system.md) — tokens, themes, fonts.
- [mcp.md](mcp.md) — the MCP server, for AI sessions that build with Cremona.
