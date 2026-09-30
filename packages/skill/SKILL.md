---
name: cremona
description: Build animated UI with Cremona — 160 animated visual blocks in 37 categories (product illustrations, real-size components and kits, miniature section and layout wireframes), a 9-theme light/dark design system, React + Stimulus adapters, consumable via MCP tools or direct repo reads. Use when the user asks to use Cremona, add a visual/component/layout, build marketing/dashboard/app UI from Cremona, port new visuals, or work with the cremona repo.
---

# Cremona — animated visual blocks

Cremona is a library of **160 animated UI compositions** ("visuals") with a
**design system** (9 themes × light/dark). Every variant's server render is
locked by a golden reference: parity tests compare the SSR DOM structurally
(tags, attributes, sorted classes, text), not pixels. Blocks exist in two
adapters:

- **React** (`@cremona/blocks` + `@cremona/react`) — motion-based animations, the primary adapter.
- **Stimulus** (`@cremona/stimulus`) — the same static markup + the `cremona-visual` controller, for Symfony/Hotwire apps.

## What's inside: three scales

Every block has a `scale` (MCP `list_blocks`, `search_blocks`, `get_block`):

- **illustration** — `ai/*`, `metrics/*`, `charts/*`, `states/*` and every other
  POC category: animated product artwork (miniature mocks of UI).
- **real-size** — `components/*` (button, input, badge, card, tabs, dialog,
  dropdown-menu, command, tooltip, accordion, progress, skeleton, avatar,
  breadcrumb, alert, switch, checkbox, select, pagination, kbd, table, toast),
  `forms/*` (login, signup, onboarding-wizard, settings-form, feedback),
  `mobile/*` (tab-bar, app-bar, action-sheet, list-rows), `notices/*`
  (cookie-banner, callout, update-banner) and `ecommerce/*` product-card,
  order-row, checkout-summary: 12–16 px text, templates to derive real UI from.
- **miniature** — `sections/*` (hero, pricing, faq, footers… 23 marketing
  sections), `layouts/*` (dashboard, docs, marketing, auth, settings,
  mobile-app shells), `ecommerce/product-grid` and `ecommerce/cart-drawer`:
  thumbnail-scale wireframes (7–10 px text). Use them as illustrations, never
  as a page, a section or a page skeleton.

## Workflow: pick the right entry point

1. **MCP server available?** (`cremona` tools: `list_categories`, `list_blocks`,
   `search_blocks`, `get_block`, `get_golden`, `get_themes`, `get_theme`,
   `get_css`, `get_controller`, `get_design_system`, `validate`, `get_guide`;
   from a cremona checkout also the authoring tools `add_category` and
   `add_block`, which the published `npx -y @cremona/mcp` server does not register)
   → use the tools. `get_block` returns the install line, the import, exact
   variant props and the React source (add `include: ["stimulus"]` for the
   Stimulus templates); `get_css` returns the stylesheet's path and import line.
2. **No MCP, repo available?** Read the same data from the filesystem:
   - Catalog: `packages/blocks/catalog.json` (37 categories, names, descriptions)
   - Per block: `packages/blocks/src/<category>/<file>/`
     - `block.json` (metadata + variant labels)
     - `preview-props.json` (exact props per variant; `"lucide:X"` = lucide-react icon)
     - `react.tsx` (React implementation)
     - `golden/<slug>.html` (SSR render reference)
   - Stimulus templates: `packages/stimulus/templates/<category>/<file>/<slug>.html` + `manifest.json`
   - Design tokens: `packages/tokens/css/cremona.css` (complete stylesheet, compiled by `pnpm build:css`), `css/themes.css` (tokens only), `themes.json`

## Using blocks in a React app (Next.js, Vite, …)

```bash
npm i @cremona/blocks @cremona/tokens motion lucide-react react react-dom
```

```tsx
import "@cremona/tokens/css/cremona.css"; // once, in the app entry
import { StatCard } from "@cremona/blocks/metrics/stat-card";
```

1. The stylesheet holds the fonts, all tokens and every utility class the blocks
   use — no Tailwind build required. A class that no block uses has no rule in
   it: code you write around the blocks needs your own CSS or Tailwind build.
2. Dark mode: toggle `.dark` on `<html>`; theme: add `.theme-<name>` (see `themes.json`).
3. Render `<StatCard animated trigger="inView" />`. Props:
   - `animated` (default false = static final state), `trigger`: `"mount" | "inView" | "inViewRepeat"`
   - `fill` (default false): fill the box instead of centring a capped-width
     card — use it for any block that is a panel in a layout
   - `fadeOut`, `isometric`, `gradient` — the three cross-block style props
   - per-block copy props (see `preview-props.json` for exact shapes)
4. Icons come from `lucide-react`. For reduced motion, wrap the app in
   `<MotionConfig reducedMotion="user">` (from `motion/react`).

### Blocks are preview compositions, not production components

Every block has `aria-hidden="true"` on its root, sits in the gallery's preview
frame (which centres a `max-w-*` card in whatever box you give it), and takes
content props — no `onClick`, no `ref`, no `children`. `components/button`
renders one button with one label.

- **As-is**, for illustration (charts, stat cards, empty states): give it a
  sized box, pass real data instead of the demo defaults, and add a text
  equivalent next to it since the root is `aria-hidden`.
- **Derived**, for anything interactive: take the source (`get_block` with
  `include: ["react"]`, or `packages/blocks/src/<category>/<block>/react.tsx`),
  remove the preview frame wrapper and the `useInView` plumbing, add
  children/handlers/ref/ARIA/keyboard, and **keep** the class strings and the
  `motion` variants. Rewriting from the class strings silently drops every
  entrance animation in the library.

`docs/react.md` has the full recipe, the props contract and the gotchas.

## Using blocks in a Symfony app (Stimulus)

1. Import CSS (same as above) and register controllers:
   ```js
   import { registerCremona } from "@cremona/stimulus";
   registerCremona(yourStimulusApp);
   ```
2. Copy the variant markup you need from
   `packages/stimulus/templates/<category>/<file>/<slug>.html`
   (see `manifest.json` for labels). Markup is identical to the React render.
3. The root carries `data-controller="cremona-visual"`; the controller plays the
   entrance animation on scroll (values: `trigger`, `duration`, `stagger`, `delay`).
4. Theme switching: `data-controller="cremona-theme"` on `<html>` (values
   `appearance`, `theme`; the choice persists to localStorage when storage is
   available; API: `toggle()`, `apply()`).

## Creating new visuals (categories, blocks, variants)

- Read `docs/authoring-guide.md` (new visuals) or `docs/porting-guide.md`
  (POC visuals) — the full contracts: anatomy, motion conventions, parity testing.
- Scaffold with MCP `add_block`/`add_category` (it refuses an existing key), then
  implement + test from `packages/blocks`: `pnpm vitest run test/generate-goldens.test.tsx`
  (writes only missing goldens), then `pnpm vitest run test/<category>-<file>.parity.test.tsx`.
- Every block MUST pass golden parity; `pnpm validate` checks that each block has a
  `react.tsx`, a golden, a preview-props entry and a Stimulus template per variant,
  and a parity test.
- From the repo root: `pnpm generate:stimulus` after changes, then `pnpm check`.

## Design system quick facts

- Tokens: full shadcn-style semantic set (`--background` … `--sidebar-ring`, `--chart-1..5`, `--radius`), plus status tokens `--success`, `--warning`, `--info` (each with `-foreground`) and `--destructive-foreground` — use them instead of palette colors.
- 9 themes: `default`, `claude-plus`, `light-green`, `zen`, `sakura`, `tiesen`,
  `deep-purple`, `indigo-clean`, `brutalism` — each with light + dark.
- Default theme: neutral in light and dark; the warm "Claude-like" dark is `claude-plus`.
- Font: Inter Variable. Motion: `motion/react`, springs stiffness 300–420 damping 14–18.
- Preview stage height by variant `size`: `xs` h-48, `sm` h-64, `md` h-96 (default),
  `lg` h-[28rem], `xl` h-[32rem]; footer label; grid `lg:grid-cols-2`.

## Hard rules

- Never hand-edit generated files: `packages/blocks/src/*/*/golden/**`,
  `preview-props.json`, `packages/stimulus/templates/**`, `packages/tokens/css/cremona.css`.
- Never bypass parity tests. The renders ARE the product.
- Keep class strings intact when porting or deriving: parity compares the DOM
  structure, the classes and the text.
- Don't add runtime deps to blocks; icons = `lucide-react`, motion = `motion/react`.
