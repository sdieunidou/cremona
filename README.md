# Cremona

**Cremona** est une bibliothèque de **115 compositions UI animées** ("visuals") avec un **design system** complet (9 thèmes × light/dark), consommable par des **sessions IA** (Claude Code, opencode…) via **MCP**, et utilisable dans n'importe quel projet **React** (Next.js, Vite…) ou **Stimulus** (Symfony, Hotwire).

> Chaque rendu est **vérifié pixel-exact** contre le POC d'origine par des tests SSR golden (1203 tests).

---

## Why Cremona

AI coding sessions are great at wiring logic, and mediocre at inventing polished
animated UI. Cremona gives them a curated, coherent, themeable vocabulary:

- **115 visuals** in 31 categories — metrics, charts, AI scenes, states, dashboards, git, geo, payments, marketing sections…
- **1000+ ready-made variants** (default, fadeOut, isometric, custom copy, custom data, states…)
- **9 themes × light/dark**, full shadcn-style semantic tokens, Inter Variable
- **Golden parity tests** — every render matches the reference exactly
- **MCP server + Skill** — sessions discover and use the library without human guidance
- **Two adapters** — React (motion) and Stimulus (identical markup, CSS-driven motion)

## Repo layout

```
cremona/
├── packages/
│   ├── tokens/      design system CSS (themes, tokens, fonts) — @cremona/tokens
│   ├── core/        shared types + helpers — @cremona/core
│   ├── react/       hooks (useInView) — @cremona/react
│   ├── blocks/      THE SOURCE OF TRUTH: 115 blocks (react.tsx + goldens + specs)
│   ├── stimulus/    controllers + 1088 static templates — @cremona/stimulus
│   ├── mcp/         MCP server + CLI — @cremona/mcp
│   └── skill/       SKILL.md for AI sessions — @cremona/skill
├── apps/
│   └── gallery/     browsable docs app (sidebar, themes, live previews)
├── tools/           extraction + generation scripts (POC → library)
└── docs/            guides (start here: docs/architecture.md)
```

## Quick start

```bash
pnpm install

# run every test (blocks golden parity, mcp e2e, stimulus, tokens…)
pnpm test

# browse the gallery
pnpm dev            # → http://localhost:5173

# use the MCP server (Claude Code / opencode)
pnpm --filter @cremona/mcp start     # stdio; see docs/mcp.md
```

## Using a visual in React

```tsx
import "@cremona/tokens/css/cremona.css";   // once, global CSS
import { StatCard } from "@cremona/blocks/src/metrics/stat-card/react.js";

<StatCard animated trigger="inView" />
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

New category, new block, new variant → `docs/adding-blocks.md` and the MCP
tools `add_category` / `add_block`. The porting contract lives in
`docs/porting-guide.md`.

## Documentation

| Doc | Content |
|---|---|
| [docs/architecture.md](docs/architecture.md) | monorepo, data flow, invariants |
| [docs/design-system.md](docs/design-system.md) | tokens, 9 themes, dark mode, frames |
| [docs/react.md](docs/react.md) | React adapter: props, triggers, usage |
| [docs/stimulus.md](docs/stimulus.md) | Stimulus adapter: controllers, templates |
| [docs/mcp.md](docs/mcp.md) | MCP server: install + tools |
| [docs/adding-blocks.md](docs/adding-blocks.md) | authoring new visuals |
| [docs/porting-guide.md](docs/porting-guide.md) | full porting contract |

## Provenance

This library is a faithful, tested reconstruction of the *Cremona* POC
(`../cremona-ui/`): catalog, goldens, themes and animation parameters were
extracted from the POC build; the React implementations were re-authored from
the minified chunks and verified against the extracted SSR goldens.
