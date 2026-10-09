# MCP server

The `@cremona/mcp` package exposes the whole library to AI sessions over
stdio: 160 blocks in 37 categories (1,298 variants), the design system,
authoring tools and coherence validation. The `cremona` skill
(`packages/skill/SKILL.md`) tells a session how to use them.

## Install

### Claude Code

```bash
# every project on this machine (user scope)
claude mcp add cremona -s user -- node /absolute/path/to/cremona/packages/mcp/bin/cremona-mcp.mjs
```

Without `-s user` the server is registered for the current directory only.
Inside the cremona repo itself, `.mcp.json` already registers it.

Once `@cremona/mcp` is published, no checkout is needed:

```bash
claude mcp add cremona -s user -- npx -y @cremona/mcp
```

The published server reads a bundled snapshot of the library and does not
register the authoring tools (`add_category`, `add_block`).

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

## Skill

The skill is a single file, `packages/skill/SKILL.md`, whose frontmatter names
it `cremona`. Claude Code and opencode both load it from a `cremona/`
directory under a skills folder:

```bash
# every project on this machine
mkdir -p ~/.claude/skills/cremona
cp /absolute/path/to/cremona/packages/skill/SKILL.md ~/.claude/skills/cremona/SKILL.md

# one project only: commit it with the project
mkdir -p .claude/skills/cremona
cp /absolute/path/to/cremona/packages/skill/SKILL.md .claude/skills/cremona/SKILL.md
```

A symlink (`ln -s /absolute/path/to/cremona/packages/skill ~/.claude/skills/cremona`)
keeps the skill in step with a checkout. opencode also reads
`~/.config/opencode/skills/cremona/SKILL.md` and `.opencode/skills/cremona/SKILL.md`.
The session lists the skill by its `description` and loads it when a request
is about Cremona or its blocks.

## Tools

Every tool only reads the library (`readOnlyHint`), except the two authoring
tools, which write files and rewrite `catalog.json` (`destructiveHint`).

| Tool | Purpose |
|---|---|
| `list_categories` | 37 categories with slugs and block names |
| `list_blocks` | blocks filtered by category (slug or name), kind or scale, with variant labels |
| `search_blocks` | word search over names, descriptions and variants: every word must match, in any order; plurals, synonyms (`pie chart` → donut, `404` → not-found, `sign in` → login) and category/kind/scale filters. When no block matches every word, the closest ones (at most 10) come back with `partial: true` and the `unmatched` words (`pricing table` → `sections/pricing`, unmatched `table`, next to the table blocks); an empty result means no block matches any word |
| `get_block` | install line, public import, metadata (`scale`, each variant's `size`), the **props reference**, **exact variant props** and the **full React source**; Stimulus templates and goldens on request |
| `get_golden` | the SSR render reference HTML of one variant (hidden initial state) |
| `get_themes` / `get_theme` | the 9 themes; one theme's full light+dark CSS |
| `get_css` | the three stylesheets and which host takes which (`cremona.css`, `tailwind.css` inside a host's Tailwind v4 build, `cremona.scoped.css` next to other CSS), with paths, sizes, import lines and fonts; `tailwind.css` itself (`tailwind`), the whole `cremona.css` (`full`) or the tokens (`tokens`) on request |
| `get_controller` | Stimulus controller source (`visual`, `theme`) |
| `get_design_system` | token list, conventions, frame anatomy |
| `add_category` / `add_block` | scaffold new categories/blocks with conventions (repo only) |
| `validate` | catalog ↔ blocks (block.json, react.tsx, api.json) ↔ goldens ↔ preview props ↔ Stimulus templates ↔ parity tests |
| `get_guide` | the guides of `docs/` (react, getting-started, stimulus, authoring-guide…) |

### `get_block`

`include` selects the sections: `meta`, `api`, `props` and `react` by default,
`stimulus` and `golden` on request. `variant` (a label or a slug, matched
regardless of case and spacing) scopes the props, the Stimulus sample and the
golden to one variant; an unknown variant is an error that lists the valid
labels.

| Field | Content |
|---|---|
| `key`, `install`, `import`, `stylesheet` | always: the block key, the npm install line, the import of its component from `@cremona/blocks/<category>/<file>`, the stylesheet import |
| `meta` | name, description, `kind`, `scale`, `added`, `page`, and the variants with their `label`, `slug` and `size` (`xs` to `xl`, `md` by default: the height of their preview stage) |
| `api` | the props reference (`api.json`): each prop's type as written, whether it is optional, its default and its JSDoc description; the shared `VisualProps` marked `from`; then the fields of the block's own types |
| `props`, `propsNote` | each variant's exact props; `"lucide:Users"` stands for an icon component, `{ "$element": "lucide:Users", "props": {…} }` for an element |
| `reactSource`, `reactSourceNote` | the full `react.tsx`, and the recipe to derive a component from it (drop the preview frame, the `useInView` plumbing and the `noFocus` spreads; keep `"use client"`, the classes and the motion variants) |
| `stimulus` | the Stimulus install line; `effects` (`full` or `entrance-only`) and `reactOnly` (the effects that stay React-only); the rule that a template needs a container of its variant's height; the templates (label, slug, size) and one sample |
| `goldenSlugs`, `golden` | the golden files, and the golden HTML of the chosen variant |

Every response starts with:

```json
{
  "key": "metrics/stat-card",
  "install": "npm i @cremona/blocks @cremona/tokens motion lucide-react react react-dom",
  "import": "import { StatCard } from \"@cremona/blocks/metrics/stat-card\";",
  "stylesheet": "import \"@cremona/tokens/css/cremona.css\"; // once, in the app entry"
}
```

### Scale

Each block has a `scale` that says what it can be used for:

| Scale | Blocks | Use |
|---|---|---|
| `real-size` | `components/*`, `forms/*`, `mobile/*`, `notices/*`, `ecommerce/product-card`, `order-row`, `checkout-summary` | 12–16 px text: templates to derive real UI from |
| `miniature` | `sections/*`, `layouts/*`, `ecommerce/product-grid`, `ecommerce/cart-drawer` | thumbnail-scale wireframes (7–10 px text): illustrations only, never a page or a section |
| `illustration` | every other category | animated product artwork |

### Output size

`get_css` without arguments returns a summary of a few hundred tokens; the
whole minified stylesheet (`kind: "full"`) is well above Claude Code's default
25k-token cap on MCP output (`MAX_MCP_OUTPUT_TOKENS`): read the file from
`node_modules` instead. The largest default `get_block` is about 8.5k tokens
(`geo/world-map`); `include: ["api"]` or `["react"]` alone is smaller.

## Prompt recipes

Tool names depend on the client: Claude Code exposes `mcp__cremona__<tool>`,
opencode `cremona_<tool>`. The recipes below use the opencode form; both clients
resolve either spelling from the prompt.

Copy-paste prompts that work well with the MCP server. Adjust the product
context to your own.

### Discovery

```text
Call cremona_list_categories. Then cremona_list_blocks for the three
categories most relevant to a project-management SaaS. For each block keep:
key, name, description, scale, variant count. No code yet.
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
Call cremona_get_block for "components/button" with include ["api", "react"],
then tell me: which props does Button accept, what are their defaults, and
which lucide icons does it import? Do not render anything yet.
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
- a stat card (metrics/stat-card, variant "users · custom copy", with my own
  copy: revenue $84k)
- a line chart (charts/line) fed with my own values
- a data table (components/table)
- buttons and badges for the header (components/button, components/badge)
Call cremona_get_block for each and follow cremona_get_guide "getting-started":
app/page.tsx stays a Server Component (no "use client"), and the icon props
go through a small "use client" module that maps an icon name to its lucide
component. Install and import as the responses say, import
@cremona/tokens/css/cremona.css once in app/layout.tsx, render the blocks in a
responsive grid with `fill` and `gradient={false}`, each with a text
equivalent. Dark mode must work (I already have .dark toggling).
```

The Server Component and icon pattern this recipe asks for is in
[getting-started.md](getting-started.md#8-nextjs-app-router-and-server-components).

```text
Build me a pricing page. sections/pricing is a miniature wireframe: use it at
most as an illustration, and write the real pricing cards with the design
tokens. Derive the monthly/yearly toggle from components/switch and the
"plan changed" confirmation from components/toast: fetch each with
cremona_get_block (include react), follow the derive recipe from
cremona_get_guide "react", and keep their class strings and motion variants.
```

### Building a page (Stimulus / Symfony)

```text
I have a Symfony app with Stimulus. Use cremona_get_block for
"metrics/stat-card" and "status/health-check" with include ["stimulus"] to
get the static templates, their sizes and effects. Then produce a Twig macro
that includes a template with source() inside a container of the variant's
height, the two includes, and the Stimulus bootstrap snippet registering
cremona-visual and cremona-theme into my existing application
(cremona_get_guide "stimulus"). Tell me which effects stay React-only.
Tokens CSS will be bundled separately.
```

```text
Using cremona_get_guide "stimulus" and cremona_get_theme for "sakura", wire
the cremona-theme controller on <html> in my Symfony base template with
"sakura" as the default theme, a light/dark toggle (the toggle action) and a
System button (setAppearance), plus the head partial that applies the theme
before the first paint. Show me the Twig.
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
Call cremona_add_category with name "Analytics", then cremona_add_block with
category "analytics", file "cohort-grid", name "Cohort Grid", description
"Weekly retention cohort grid with color intensity ramp." Then read
docs/authoring-guide.md via cremona_get_guide and implement react.tsx for its
variants, generate its goldens, run the parity test, and report results.
Follow the authoring conventions exactly.
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
missing stimulus templates, missing preview-props, missing parity tests). Use
the documented commands: pnpm vitest run test/generate-goldens.test.tsx
(from packages/blocks) and pnpm generate:stimulus; a missing preview-props entry
is written by hand in the block's preview-props.json.
```

### Auditing

```text
Call cremona_list_blocks with kind "component", then cremona_get_block for
each with include ["api"]. Report a table: the props without a description,
and the components that have a disabled, loading or error state but no
variant showing it.
```

## Gallery parity

The gallery (docs app) exposes the same data visually: every preview has a
**View code** panel (Usage / React source / Stimulus template) and one-click
copy of the variant's exact JSX, imported from the public path
`@cremona/blocks/<category>/<file>`, and every block page ends with the props
table built from the same `api.json` as `get_block`'s `api` — convenient for
humans, same source of truth as the MCP.

## Notes

- Icon props arrive as `"lucide:Users"` strings — import the icon from
  `lucide-react` in your code. `{ "$element": "lucide:Users", "props": {…} }` is
  an element: pass `<Users {...props} />`.
- An unknown block key, variant, theme or category is an error (`isError`)
  that lists the valid values. Variants match by label, slug, or label
  regardless of case and spacing.
- `get_block` returns the **complete React source**, a preview composition to
  use as-is or derive from (see docs/react.md). It imports `@cremona/core` and
  `@cremona/react`, which `@cremona/blocks` depends on.
- Ship one stylesheet, once: `@cremona/tokens/css/cremona.css` (no Tailwind
  build required), `css/tailwind.css` inside a host's own Tailwind v4 build, or
  `css/cremona.scoped.css` with the blocks inside a `.cremona` element on a page
  with CSS of its own — `get_css` gives the paths and import lines.
- `pnpm validate` runs the same checks as the `validate` tool and exits
  non-zero on any issue; CI runs it.
