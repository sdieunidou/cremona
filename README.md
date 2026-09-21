# Cremona

**Cremona** est une bibliothèque de **160 compositions UI animées** ("visuals") avec un **design system** complet (9 thèmes × light/dark), consommable par des **sessions IA** (Claude Code, opencode…) via **MCP**, et utilisable dans n'importe quel projet **React** (Next.js, Vite…) ou **Stimulus** (Symfony, Hotwire).

> Chaque rendu est **vérifié pixel-exact** : les 115 blocs issus du POC contre les snapshots SSR d'origine, les 45 nouveaux contre leurs goldens générés — 1 408 tests.

---

## Why Cremona

AI coding sessions are great at wiring logic, and mediocre at inventing polished
animated UI. Cremona gives them a curated, coherent, themeable vocabulary:

- **160 visuals** in 37 categories — metrics, charts, AI scenes, states, dashboards, git, geo, payments, marketing sections…
- **1 247 ready-made variants** (default, fadeOut, isometric, custom copy, custom data, states…)
- **A real component layer** (`components/*` — button, input, table, dialog, tabs…) for assembling production UI
- **Page layouts** (`layouts/*` — dashboard, docs, marketing, auth, settings, mobile shells)
- **Vertical kits** — ecommerce (product cards, cart, checkout), forms (login, signup, wizard), mobile (tab bar, app bar, action sheets), notices (cookie banner, callouts)
- **9 themes × light/dark**, full shadcn-style semantic tokens, Inter Variable
- **Golden parity tests** — every render matches its reference exactly
- **MCP server + Skill** — sessions discover and use the library without human guidance
- **Two adapters** — React (motion) and Stimulus (identical markup, CSS-driven motion)

## Repo layout

```
cremona/
├── packages/
│   ├── tokens/      design system CSS (themes, tokens, fonts) — @cremona/tokens
│   ├── core/        shared types + helpers — @cremona/core
│   ├── react/       hooks (useInView) — @cremona/react
│   ├── blocks/      THE SOURCE OF TRUTH: 160 blocks (react.tsx + goldens + specs)
│   ├── stimulus/    controllers + 1247 static templates — @cremona/stimulus
│   ├── mcp/         MCP server + CLI — @cremona/mcp
│   └── skill/       SKILL.md for AI sessions — @cremona/skill
├── apps/
│   └── gallery/     browsable docs app (sidebar, themes, live previews, e2e)
├── tools/           extraction + generation scripts (POC → library)
└── docs/            guides (start here: docs/architecture.md)
```

## Quick start

```bash
pnpm install

# run every test (blocks golden parity, mcp e2e, tokens, stimulus…)
pnpm test

# browse the gallery
pnpm dev            # → http://localhost:5173

# use the MCP server (Claude Code / opencode)
pnpm mcp            # stdio; see docs/mcp.md for install + prompt recipes
```

## Using a visual in React

```tsx
import "@cremona/tokens/css/cremona.css";   // once, global CSS
import { StatCard } from "@cremona/blocks/src/metrics/stat-card/react.js";
import { Button } from "@cremona/blocks/src/components/button/react.js";

<StatCard animated trigger="inView" />
<Button variant="outline" withIcon="end" label="Export data" />
```

Blocks are self-contained (TSX + lucide-react + motion). The tokens CSS is
dependency-free — no Tailwind build required on the host.

## Using a visual in Symfony (Stimulus)

```js
import { registerCremona } from "@cremona/stimulus";
registerCremona(yourStimulusApp);
```

Copy markup from `packages/stimulus/templates/<category>/<file>/<slug>.html`
(identical to the React render) — the `cremona-visual` controller plays the
entrance animation, `cremona-theme` handles light/dark + 9 themes.

## Extending

New category, new block, new variant → `docs/authoring-guide.md` and the MCP
tools `add_category` / `add_block`. Porting a POC visual → `docs/porting-guide.md`.

## Documentation

| Doc | Content |
|---|---|
| [docs/architecture.md](docs/architecture.md) | monorepo, data flow, invariants |
| [docs/design-system.md](docs/design-system.md) | tokens, 9 themes, dark mode, frames |
| [docs/react.md](docs/react.md) | React adapter: props, triggers, usage |
| [docs/stimulus.md](docs/stimulus.md) | Stimulus adapter: controllers, templates |
| [docs/mcp.md](docs/mcp.md) | MCP server: install, tools + **prompt recipes** |
| [docs/adding-blocks.md](docs/adding-blocks.md) | authoring new visuals |
| [docs/authoring-guide.md](docs/authoring-guide.md) | full authoring contract (new visuals) |
| [docs/porting-guide.md](docs/porting-guide.md) | full porting contract (POC visuals) |

## Provenance

This library started as a faithful, tested reconstruction of the *Cremona* POC
(`../cremona-ui/`): catalog, goldens, themes and animation parameters were
extracted from the POC build; the React implementations were re-authored from
the minified chunks and verified against the extracted SSR goldens. The
component, layout, ecommerce, forms, mobile and notices layers extend it with
the same quality bar (authoring contract + generated goldens + parity locks).
