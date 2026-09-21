# AGENTS.md — working on the Cremona repo

Instructions for AI sessions (Claude Code, opencode…) contributing to this repo.

## Commands

```bash
pnpm test          # every package's tests (blocks parity, mcp e2e, tokens, stimulus…)
pnpm typecheck     # tsc --noEmit per package
pnpm dev           # gallery dev server
pnpm validate      # library coherence (catalog ↔ blocks ↔ goldens ↔ stimulus)
pnpm generate:stimulus   # regenerate packages/stimulus/templates/**
node packages/mcp/bin/cremona-mcp.mjs   # run the MCP server over stdio
```

## Non-negotiable invariants

1. **Goldens are immutable**: never edit `packages/blocks/*/golden/**`.
2. **Stimulus templates are generated**: never hand-edit
   `packages/stimulus/templates/**` — change the generator or the source blocks.
3. **Parity is the product**: a block change that breaks its parity test is a
   regression. The comparator (`packages/blocks/test/helpers/parity.ts`) is
   strict — extend its *semantic* normalizations only with a real justification.
4. New blocks/categories: POC ports follow `docs/porting-guide.md`; brand-new
   visuals (components/layouts/ecommerce/forms/mobile/notices) follow
   `docs/authoring-guide.md` — both via MCP `add_block`, both must pass parity
   + `pnpm validate`.
5. Design tokens live ONLY in `packages/tokens` — blocks use semantic tokens
   (`bg-card`, `text-muted-foreground`…), never raw colors.

## Layout map

- `packages/blocks/src/<category>/<block>/` — source of truth (block.json, react.tsx, preview-props.json, golden/, sources/ for POC blocks)
- `packages/tokens/css/` — cremona.css (complete) + themes.css (tokens only)
- `packages/stimulus/{src,templates}/` — controllers + generated templates
- `packages/mcp/{src,bin,scripts,test}/` — MCP server (plain ESM JS)
- `apps/gallery/src/` — docs app (POC-faithful shell, live previews)
- `tools/` — extraction (`extract/`, needs `../cremona-ui` POC snapshot as sibling of the repo root) + generators

## Conventions

- Tests: `<category>-<file>.parity.test.tsx` (always category-prefixed).
- New visuals: run `pnpm vitest run test/generate-goldens.test.tsx` BEFORE the
  parity test (it writes the golden). POC-extracted blocks (with sources/) are
  refused by the generator — their goldens come from the extraction only.
- Blocks are self-contained: no imports between blocks; shared constants from
  `@cremona/core`; icons from `lucide-react` (1.x); motion from `motion/react`.
- The POC goldens were `renderToString`-based (React inserts `<!-- -->`
  separators): reproduce byte-exact text with `dangerouslySetInnerHTML` when
  required (see `uptime-bar`).
- Keep prose docs in English; keep code comments minimal.
