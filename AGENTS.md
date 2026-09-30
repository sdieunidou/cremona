# AGENTS.md — working on the Cremona repo

Instructions for AI sessions (Claude Code, opencode…) contributing to this repo.

## Commands

```bash
pnpm check              # lint + format check + typecheck + tests + validate — run before finishing
pnpm test               # every package's tests (block parity, MCP e2e, tokens, stimulus…)
pnpm typecheck          # tsc --noEmit per package
pnpm lint               # ESLint (errors fail CI; block a11y findings are warnings)
pnpm format             # Prettier (a hook formats files you edit in Claude Code)
pnpm validate           # library coherence (catalog ↔ blocks ↔ goldens ↔ stimulus)
pnpm generate:stimulus  # regenerate packages/stimulus/templates/**
pnpm gallery:build && pnpm e2e   # Playwright: every block page must render
pnpm dev                # gallery dev server
pnpm mcp                # run the MCP server over stdio
```

CI (`.github/workflows/ci.yml`) runs all of the above on Node 22 and 24 and fails
if generated files are not committed.

## Non-negotiable invariants

1. **Goldens are regression locks**: never hand-edit
   `packages/blocks/src/*/*/golden/**`. New blocks get theirs from
   `pnpm vitest run test/generate-goldens.test.tsx` (from `packages/blocks`),
   which never overwrites an existing golden.
2. **Generated files are never hand-edited**: `preview-props.json` (rewritten by
   `pnpm test`) and `packages/stimulus/templates/**` (rewritten by
   `pnpm generate:stimulus`). Change the source block or the generator, rerun,
   commit the result.
3. **Parity is a gate**: a block change that breaks its parity test is a
   regression unless the golden is deliberately regenerated. The comparator
   (`packages/blocks/test/helpers/parity.ts`) is strict — extend its _semantic_
   normalizations only with a real justification.
4. **New blocks** follow `docs/authoring-guide.md` and must pass parity +
   `pnpm validate`. MCP `add_block` scaffolds them — it overwrites the files of
   an existing block without asking, so only call it with a new key, in an
   existing category.
5. **Design tokens live only in `packages/tokens`** — blocks use semantic tokens
   (`bg-card`, `text-muted-foreground`…), never raw colors.
6. **No HTML from props**: blocks render text as JSX and never use
   `dangerouslySetInnerHTML` (ESLint error in `packages/blocks/src`). They never
   read the clock while rendering either (`new Date()`): take a prop with a
   fixed default, so server and client render the same markup.

## Layout map

- `packages/blocks/src/<category>/<block>/` — source of truth: `block.json`,
  `react.tsx`, `preview-props.json`, `golden/`; some blocks also keep a
  `sources/` directory, which nothing reads at runtime.
- `packages/tokens/css/` — `cremona.css` (precompiled stylesheet shipped to
  hosts; it is not rebuilt from the blocks, so a class missing from it renders
  unstyled) + `themes.css` (tokens only).
- `packages/stimulus/{src,templates}/` — controllers + generated templates.
- `packages/mcp/{src,bin,scripts,test}/` — MCP server (plain ESM JS).
- `apps/gallery/` — docs app with live previews; Playwright specs in `e2e/`.
- `tools/generate-stimulus.mjs` — template generator. `tools/extract/` is unused.

## Conventions

- New parity tests are named `<category>-<file>.parity.test.tsx`.
- Blocks are self-contained: no imports between blocks; shared helpers from
  `@cremona/core`; icons from `lucide-react` (1.x); motion from `motion/react`.
- Keep prose docs in English, describing the current state (no history); keep
  code comments minimal.

## Agent tooling

- `.mcp.json` / `opencode.json` register this repo's MCP server — start the
  session from the repo root.
- `.claude/settings.json` pre-approves the commands above and the read-only MCP
  tools, denies hand edits of goldens, `preview-props.json` and Stimulus
  templates, and formats every edited file with Prettier.
