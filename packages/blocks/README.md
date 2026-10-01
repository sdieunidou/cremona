# @cremona/blocks

160 animated React blocks — metrics, charts, AI scenes, states, dashboards,
components, forms, mobile, ecommerce, marketing sections… — themed by
[`@cremona/tokens`](https://www.npmjs.com/package/@cremona/tokens) and animated
with [motion](https://motion.dev). Browse them in the gallery of the
[Cremona repository](https://github.com/sdieunidou/cremona).

Every block is a **preview composition**: an `aria-hidden` illustration that
takes content props but no handlers, `ref` or `children`. Charts, KPI cards and
scenes are used as-is next to a text equivalent; `components/*`, `forms/*`,
`mobile/*`, `notices/*` and the ecommerce product card, order row and checkout
summary are real-size templates to derive interactive components from;
`sections/*`, `layouts/*`, `ecommerce/product-grid` and `cart-drawer` are
miniature wireframes.

## Install

```bash
npm i @cremona/blocks @cremona/tokens motion lucide-react
```

Peer dependencies: `react` and `react-dom` 18.2+ or 19, `motion` 12 or 13,
`lucide-react` 1.47+.

## Use

```tsx
import "@cremona/tokens/css/cremona.css"; // once, in the app entry
import { Donut } from "@cremona/blocks/charts/donut";

<div style={{ height: "18rem" }}>
  <Donut
    fill
    gradient={false}
    title="Storage"
    badge="Team"
    centerValue="61%"
    centerLabel="used"
    segments={[
      { label: "Documents", value: 38, color: "var(--color-chart-1)" },
      { label: "Media", value: 23, color: "var(--color-chart-2)" },
      { label: "Free", value: 39, color: "var(--color-chart-3)" },
    ]}
  />
</div>
```

- One entry per block: `@cremona/blocks/<category>/<file>`, ESM with types,
  exporting the component and its props type (`Donut`, `DonutProps`). The
  type declarations keep the props' JSDoc; the gallery shows every block's
  props as a table, with types and defaults.
- Every entry starts with `"use client"`: Next.js Server Components render
  blocks directly, with serializable props. Pass component props such as
  `icon={Users}` from a client module.
- `animated` plays the entrance (`trigger`: `"inView"`, `"mount"`,
  `"inViewRepeat"`); the default is the static final state.
- `fill` + `gradient={false}` turn a block into an app panel.
- Dark mode: `.dark` on `<html>`; themes: `.theme-<name>` on `<html>`.
- Reduced motion: wrap the app in `<MotionConfig reducedMotion="user">`.

## Placeholder images

Blocks that show a demo photo by default load it from `/media/placeholders/…`.
The images ship in this package; copy them into your public directory:

```bash
cp -R node_modules/@cremona/blocks/public/media public/
```

## Tailwind

The blocks need no Tailwind build: `@cremona/tokens/css/cremona.css` holds
every class they use. If your app runs its own Tailwind v4 build, load
`cremona.css` before your stylesheet and give your theme Cremona's variants,
theme and base layer — see
[Your own CSS, or Tailwind](https://github.com/sdieunidou/cremona/blob/main/docs/getting-started.md#9-your-own-css-or-tailwind).

## Documentation

- [Getting started](https://github.com/sdieunidou/cremona/blob/main/docs/getting-started.md) — a new React or Next.js app, step by step
- [React adapter](https://github.com/sdieunidou/cremona/blob/main/docs/react.md) — props, triggers, panels, gotchas, deriving a component
- [Design system](https://github.com/sdieunidou/cremona/blob/main/docs/design-system.md) — tokens, themes, fonts

`catalog.json` lists every block with its description and variants.

MIT license.
