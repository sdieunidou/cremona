# MCP server

The `@cremona/mcp` package exposes the whole library to AI sessions over
stdio. **160 blocks / 37 categories / 1247 variants**, the design system,
authoring tools and coherence validation — no human in the loop required.

## Install

### Claude Code

```bash
claude mcp add cremona -- node /absolute/path/to/cremona/packages/mcp/bin/cremona-mcp.mjs
```

### opencode

```jsonc
// opencode.json (project) or ~/.config/opencode/config.json (global)
{
  "mcp": {
    "cremona": {
      "type": "local",
      "command": ["node", "/absolute/path/to/cremona/packages/mcp/bin/cremona-mcp.mjs"]
    }
  }
}
```

Run `pnpm install` in the cremona repo first. CLI alternative (no client needed):

```bash
node packages/mcp/tools/mcp-call.mjs search_blocks '{"query":"kanban"}'
```

## Tools

| Tool | Purpose |
|---|---|
| `list_categories` | 37 categories with block names |
| `list_blocks` | blocks by category/kind, with variant labels + ported status |
| `search_blocks` | full-text over names, descriptions, variants |
| `get_block` | metadata + **exact variant props** + **full React source** + Stimulus template sample |
| `get_golden` | the SSR render reference HTML of one variant |
| `get_themes` / `get_theme` | the 9 themes; one theme's full light+dark CSS |
| `get_css` | the complete stylesheet (`full`), tokens only, or font list |
| `get_controller` | Stimulus controller source (`visual`, `theme`) |
| `get_design_system` | token list, conventions, frame anatomy |
| `add_category` / `add_block` | scaffold new categories/blocks with conventions |
| `validate` | catalog ↔ blocks ↔ goldens ↔ stimulus coherence |
| `get_guide` | repo guides (porting-guide, authoring-guide…) |

## Prompt recipes

Copy-paste prompts that work well with the MCP server. Adjust the product
context to your own.

### Discovery

```text
Call cremona_list_categories. Then cremona_list_blocks for the three
categories most relevant to a project-management SaaS. For each block keep:
key, name, description, variant count. No code yet.
```

```text
Use cremona_search_blocks with queries "auth", "checkout", "kanban",
"command palette", "empty state" and give me a shortlist of the 10 blocks
you'd use for a project-management app, with their keys and best variants.
```

```text
Call cremona_get_design_system and summarize: token names, how dark mode
works, the motion conventions, and the preview-frame anatomy. Keep it under
15 lines.
```

### Inspecting a block

```text
Call cremona_get_block for "metrics/stat-card" with include ["meta","props"].
List every variant with its exact props so I can pick one.
```

```text
Call cremona_get_block for "components/button" including react, then tell me:
which props does Button accept, what are the defaults, and which lucide
icons does it import? Do not render anything yet.
```

```text
Use cremona_get_golden for "charts/line" variant "isometric" and explain
the markup structure: what the scene root is, where the gradient glow sits,
and how the animation initial states are encoded.
```

### Building a page (React)

```text
I'm building a SaaS overview page in Next.js (App Router). Use the cremona
MCP to pick and fetch:
- a stat card (metrics/stat-card, variant "custom copy" with revenue $84k)
- a line chart (charts/line)
- a data table (components/table)
- buttons and badges for the header (components/button, components/badge)
Call cremona_get_block for each, then write app/page.tsx: "use client",
import @cremona/tokens/css/cremona.css once in app/layout.tsx, render the
blocks in a responsive grid, pass the exact variant props from the MCP.
Dark mode must work (I already have .dark toggling).
```

```text
Build me a pricing page section using cremona blocks: sections/pricing for
the hero pricing, components/switch for the monthly/yearly toggle, and
notifications/toast for the "plan changed" confirmation. Fetch each block
with cremona_get_block first, keep the animation props, and assemble them
into one React page with sensible spacing.
```

### Building a page (Stimulus / Symfony)

```text
I have a Symfony app with Stimulus. Use cremona_get_block for
"metrics/stat-card" and "status/health-check" with include ["stimulus"] to
get the static templates, and cremona_get_controller "visual" + "theme".
Then produce: templates/visuals/stat_card.html.twig and
templates/visuals/health_check.html.twig with the cremona-visual
data-attributes, plus the Stimulus bootstrap snippet registering the
controllers. Tokens CSS will be bundled separately.
```

```text
Using cremona_get_theme for "sakura", wire a cremona-theme controller
default on <html> for my Symfony base template, with a toggle button that
switches appearance and persists to localStorage. Show me the twig + js.
```

### Theming

```text
Call cremona_get_themes, then cremona_get_theme for "claude-plus" and
"deep-purple". Show me the CSS var diff between the two dark palettes and
recommend which one fits a healthcare dashboard, with reasoning.
```

```text
Use cremona_get_design_system + cremona_get_theme (default) and generate a
10th theme "ocean" in the same oklch format (light + dark), coherent with
the token list. Then show how to register it (class theme-ocean).
```

### Authoring (extending the library)

```text
Call cremona_add_block with category "analytics", file "cohort-grid",
name "Cohort Grid", description "Weekly retention cohort grid with color
intensity ramp." Then read docs/porting-guide.md via cremona_get_guide and
implement react.tsx for its variants, run the parity test, and report
results. Follow the authoring conventions exactly.
```

```text
Call cremona_add_category with name "Fintech". Then scaffold two blocks in
it ("balance-card", "transaction-list") and implement them per
docs/authoring-guide.md: semantic tokens only, JSON-parseable variant
props, entrance motion, full defaults. Finish with generate-goldens +
parity tests green and cremona_validate.
```

```text
Run cremona_validate and fix every issue it reports (missing goldens,
missing stimulus templates, missing preview-props). Use the documented
commands: pnpm vitest run test/generate-goldens.test.tsx,
node tools/generate-stimulus.mjs, and the blocks test suite.
```

### Auditing

```text
Call cremona_list_blocks with kind "component" and audit each against
cremona_get_design_system conventions: do the variant names follow the
"aspect · aspect" pattern? Any block missing the core state variants?
Report a table.
```

## Gallery parity

The gallery (docs app) exposes the same data visually: every preview has a
**View code** panel (Usage / React source / Stimulus template) and one-click
copy — convenient for humans, same source of truth as the MCP.

## Notes

- Icon props arrive as `"lucide:Users"` strings — import the icon from
  `lucide-react` in your code.
- `get_block` returns the **complete React source**: copy it into your project
  directly (blocks are self-contained TSX).
- Ship `@cremona/tokens/css/cremona.css` once (or fetch via `get_css`) — no
  Tailwind build required on the host.
- `validate` exits non-zero via `scripts/validate.mjs` in CI:
  `node packages/mcp/scripts/validate.mjs`.
