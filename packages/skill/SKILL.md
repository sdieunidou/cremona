---
name: cremona
description: Build stunning animated UI with Cremona — 160 golden-verified visuals in 37 categories (blocks, real-size components, layouts, ecommerce, forms, mobile, notices), a 9-theme light/dark design system, React + Stimulus adapters, consumable via MCP tools or direct repo reads. Use when the user asks to use Cremona, add a visual/component/layout, build marketing/dashboard/app UI from Cremona, port new visuals, or work with the cremona repo.
---

# Cremona — animated visual blocks

Cremona is a library of **160 animated UI compositions** ("visuals") with a full
**design system** (9 themes × light/dark), verified pixel-exact against the
original POC by golden SSR tests. Blocks exist in two adapters:

- **React** (`@cremona/blocks` + `@cremona/react`) — motion-based animations, the primary adapter.
- **Stimulus** (`@cremona/stimulus`) — identical static markup + `cremona-visual` controller, for Symfony/Hotwire apps.

## What's inside

- `blocks/*`, `metrics/*`, `charts/*`, `states/*`… — animated product illustrations (miniature mocks)
- `components/*` — REAL-SIZE UI primitives (button, input, badge, card, tabs, dialog, dropdown-menu, command, tooltip, accordion, progress, skeleton, avatar, breadcrumb, alert, switch, checkbox, select, pagination, kbd, table, toast)
- `layouts/*` — page shells as miniature mocks (dashboard, docs, marketing, auth, settings, mobile-app)
- `ecommerce/*` (product-card, cart-drawer, checkout…), `forms/*` (login, signup, wizard…), `mobile/*` (tab-bar, app-bar, action-sheet, list-rows), `notices/*` (cookie-banner, callout, update-banner)

## Workflow: pick the right entry point

1. **MCP server available?** (`cremona` tools: `list_categories`, `list_blocks`,
   `search_blocks`, `get_block`, `get_golden`, `get_themes`, `get_theme`,
   `get_css`, `get_controller`, `get_design_system`, `add_block`, `add_category`,
   `validate`, `get_guide`)
   → use the tools, they give exact props + full React source + Stimulus markup.
2. **No MCP, repo available?** Read the same data from the filesystem:
   - Catalog: `packages/blocks/catalog.json` (37 categories, names, descriptions)
   - Per block: `packages/blocks/src/<category>/<file>/`
     - `block.json` (metadata + variant labels)
     - `preview-props.json` (exact props per variant; `"lucide:X"` = lucide-react icon)
     - `react.tsx` (React implementation)
     - `golden/<slug>.html` (SSR render reference)
   - Stimulus templates: `packages/stimulus/templates/<category>/<file>/<slug>.html` + `manifest.json`
   - Design tokens: `packages/tokens/css/cremona.css` (complete, self-sufficient), `css/themes.css` (tokens only), `themes.json`

## Using blocks in a React app (Next.js, Vite, …)

```bash
# in the host app (or copy source files — blocks are self-contained TSX)
import { StatCard } from "@cremona/blocks/src/metrics/stat-card/react.js";
```

1. Import the design system CSS once: `@cremona/tokens/css/cremona.css`
   (fonts + all tokens + every utility class the blocks use — no Tailwind build required).
2. Dark mode: toggle `.dark` on `<html>`; theme: add `.theme-<name>` (see `themes.json`).
3. Render `<StatCard animated trigger="inView" />`. Props:
   - `animated` (default false = static final state), `trigger`: `"mount" | "inView" | "inViewRepeat"`
   - `fadeOut`, `isometric`, `gradient` — the three cross-block style props
   - per-block copy props (see `preview-props.json` for exact shapes)
4. Icons come from `lucide-react`.

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
   `appearance`, `theme`; persists to localStorage; API: `toggle()`, `apply()`).

## Creating new visuals (categories, blocks, variants)

- Read `docs/authoring-guide.md` (new visuals) or `docs/porting-guide.md`
  (POC visuals) — the full contracts: anatomy, motion conventions, parity testing.
- Scaffold with MCP `add_block`/`add_category`, then implement + test:
  `pnpm vitest run test/<category>-<file>.parity.test.tsx` from `packages/blocks`.
- Every block MUST pass golden parity (or document a `skip` with a reason).
- Regenerate Stimulus templates after changes: `node tools/generate-stimulus.mjs`.
- Validate coherence: `node packages/mcp/scripts/validate.mjs`.

## Design system quick facts

- Tokens: full shadcn-style semantic set (`--background` … `--sidebar-ring`, `--chart-1..5`, `--radius`).
- 9 themes: `default`, `claude-plus`, `light-green`, `zen`, `sakura`, `tiesen`,
  `deep-purple`, `indigo-clean`, `brutalism` — each with light + dark.
- Default dark = warm "Claude-like" palette (NOT a gray inversion).
- Font: Inter Variable. Motion: `motion/react`, springs stiffness 300–420 damping 14–18.
- Preview frames: `h-96` (xs/sm/md/lg/xl), footer label, grid `lg:grid-cols-2`.

## Hard rules

- Never hand-edit `packages/stimulus/templates/**` or `packages/blocks/*/golden/**` — they are generated/extracted.
- Never bypass parity tests. The renders ARE the product.
- Keep class strings byte-identical when porting; the comparator is strict.
- Don't add runtime deps to blocks; icons = `lucide-react`, motion = `motion/react`.
