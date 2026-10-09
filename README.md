# Cremona

**Cremona** is a library of **160 animated UI blocks** for React and Stimulus,
with accessible **UI components** (`@cremona/ui`: button, field, input,
checkbox, switch, dialog…), a **design system** of 9 themes in light and dark,
an **MCP server** and a **Skill** that let AI coding sessions (Claude Code,
opencode…) find a block or a component, read its exact props and use it
correctly.

What a block is, before you build with it: a **preview composition** — an
animated, `aria-hidden` illustration that takes content props (`label`,
`value`, `segments`…) but no handlers, `ref` or `children`. They come in three
scales:

- **illustrations** — `metrics/*`, `charts/*`, `ai/*`, `states/*` and most
  categories: product artwork (KPI cards, charts, scenes, empty states) to use
  as-is, next to a text equivalent;
- **real-size** — `components/*` (button, input, tabs, dialog, table…),
  `forms/*`, `mobile/*`, `notices/*` and `ecommerce/product-card`, `order-row`
  and `checkout-summary`: UI at its real size, the templates your own
  interactive components are derived from;
- **miniatures** — `sections/*` and `layouts/*` (plus `ecommerce/product-grid`
  and `cart-drawer`): thumbnail-scale wireframes of a page or a section, never
  a page, a section or a page skeleton themselves.

## Quick start — React / Next.js

```bash
npm i @cremona/blocks @cremona/tokens motion lucide-react
```

```tsx
import "@cremona/tokens/css/cremona.css"; // once, in the app entry
import { StatCard } from "@cremona/blocks/metrics/stat-card";

<div style={{ height: "12rem" }}>
  <StatCard fill gradient={false} label="Revenue" value="$48,213" change="+12.4%" period="vs last month" trend="up" />
</div>
```

One entry per block, `@cremona/blocks/<category>/<file>` (ESM + types, marked
`"use client"`, so Server Components can render them). The stylesheet ships
the fonts, the tokens and every class the blocks use: the blocks need no
Tailwind build, but the classes of your own markup need your own CSS. An app
with its own Tailwind v4 build compiles the blocks in it with
`@cremona/tokens/css/tailwind.css` instead, and a page with CSS of its own
(Bootstrap…) loads `cremona.scoped.css`, which styles `.cremona` elements only.
[docs/getting-started.md](docs/getting-started.md) covers the rest of a new
app: the template CSS to remove, panels (`fill`, `gradient={false}`), dark mode
and themes, reduced motion, placeholder images, Server Components and Tailwind
hosts.

## Quick start — UI components

Blocks illustrate; the controls an app is made of come from `@cremona/ui`:
button, label, field, input, checkbox, switch and dialog, accessible and
responsive, on the same tokens.

```bash
# copy the source into your app (the shadcn CLI)
npx shadcn@latest registry add @cremona=https://raw.githubusercontent.com/sdieunidou/cremona/main/packages/ui/r/{name}.json
npx shadcn@latest add @cremona/button @cremona/field @cremona/input

# or import them
npm i @cremona/ui @cremona/tokens lucide-react
```

```tsx
import { Button } from "@cremona/ui/button";
```

Styles, what each component guarantees, `Field` and `Dialog`:
[docs/ui.md](docs/ui.md).

## Quick start — Symfony / Stimulus

```bash
npm i @cremona/stimulus @cremona/tokens @hotwired/stimulus
```

```js
import { registerCremona } from "@cremona/stimulus";
import "@cremona/tokens/css/cremona.css";

registerCremona(yourStimulusApp); // cremona-visual + cremona-theme
```

Every variant ships as a static HTML template,
`@cremona/stimulus/templates/<category>/<file>/<slug>.html`: the block's final
React render, readable without JavaScript, whose entrance `cremona-visual`
plays with Web Animations. A template fills a container you size; loops and
JavaScript-driven effects stay React-only. Setup, Twig includes and the theme
controller: [docs/stimulus.md](docs/stimulus.md).

## Quick start — AI sessions

```bash
claude mcp add cremona -s user -- npx -y @cremona/mcp
```

The server searches the catalog, returns a block's install line, import,
props reference, exact variant props and source, the design system and the
stylesheet's location: [docs/mcp.md](docs/mcp.md).

## What's inside

- **160 blocks in 37 categories** — metrics, charts, AI scenes, states,
  dashboards, git, geo, payments, components, forms, mobile, marketing
  sections… — with 1,298 ready-made variants (default, fadeOut,
  isometric, custom copy, custom data, states…).
- **UI components** — `@cremona/ui`: button, label, field, input, checkbox,
  switch and dialog, built on Radix UI, tested with Testing Library and axe,
  taken as source with the shadcn CLI or imported from npm.
- **9 themes × light/dark** on shadcn-style semantic tokens and status tokens,
  Inter Variable.
- **Locked server renders** — every variant's server render is compared with a
  committed golden reference (DOM structure, attributes, sorted classes, text;
  not pixels), so a change that alters a block's markup fails a test.
- **Two adapters** — React (motion), and Stimulus: static templates of the
  React final render, with the entrance played by Web Animations (loops and
  JavaScript-driven effects are React-only).

## Working on the repo

```bash
pnpm install
pnpm dev          # the gallery, http://localhost:5173 (View code / Copy React / Stimulus, a props table per block)
pnpm test         # golden parity, MCP e2e, tokens, stimulus…
pnpm check        # lint, format, types, "use client", api.json and registry checks, tests, validate
pnpm build        # compiles @cremona/core, @cremona/react, @cremona/blocks, @cremona/ui and the gallery
pnpm mcp          # the MCP server over stdio, with the authoring tools
```

Setup, checks and pull requests: [CONTRIBUTING.md](CONTRIBUTING.md); commands
and invariants, for AI sessions too: [AGENTS.md](AGENTS.md). New category,
block or variant: [docs/authoring-guide.md](docs/authoring-guide.md) and the
MCP tools `add_category` / `add_block`.

```
cremona/
├── packages/
│   ├── blocks/      the source of truth: 160 blocks (react.tsx, block.json, api.json, goldens) — @cremona/blocks
│   ├── tokens/      design system CSS (themes, tokens, fonts) — @cremona/tokens
│   ├── core/        shared types and helpers — @cremona/core
│   ├── react/       hooks (useInView, useLoopActive, useFitScale) — @cremona/react
│   ├── stimulus/    controllers + generated static templates — @cremona/stimulus
│   ├── ui/          accessible components + their shadcn registry — @cremona/ui
│   ├── mcp/         MCP server + CLI — @cremona/mcp
│   └── skill/       SKILL.md for AI sessions
├── apps/
│   └── gallery/     docs app: live previews + one-click React/Stimulus code
├── tools/           generators (Stimulus templates, props references, shadcn registry, "use client" directive)
└── docs/            guides
```

## Documentation

| Doc | Content |
|---|---|
| [docs/getting-started.md](docs/getting-started.md) | a new React / Next.js app, step by step |
| [docs/react.md](docs/react.md) | React adapter: props, triggers, panels, gotchas, deriving a component |
| [docs/ui.md](docs/ui.md) | `@cremona/ui`: install (shadcn CLI or npm), styles, what each component guarantees, `Field` and `Dialog` |
| [docs/design-system.md](docs/design-system.md) | tokens, 9 themes, dark mode, contrast, frames |
| [docs/accessibility.md](docs/accessibility.md) | what blocks guarantee, what the host app adds |
| [docs/stimulus.md](docs/stimulus.md) | Stimulus adapter: controllers, templates |
| [docs/mcp.md](docs/mcp.md) | MCP server: install, tools, prompt recipes |
| [docs/architecture.md](docs/architecture.md) | monorepo, data flow, invariants |
| [docs/authoring-guide.md](docs/authoring-guide.md) | authoring contract for new visuals |
| [docs/adding-blocks.md](docs/adding-blocks.md) | adding a block, step by step |
| [docs/releasing.md](docs/releasing.md) | versioning, npm publishing, repository settings |

## License

[MIT](LICENSE). Inter is distributed under the SIL Open Font License.
