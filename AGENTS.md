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
pnpm build:css          # recompile packages/tokens/css/cremona.css (Tailwind v4, dev only)
pnpm build              # compile core, react, blocks (dist/, one entry per block) and the gallery
pnpm --filter @cremona/blocks check:package   # pack @cremona/blocks, check it with publint + attw
node tools/use-client.mjs [--check]           # make "use client"; the first line of every block
pnpm gallery:build && pnpm e2e   # Playwright: every block page must render
pnpm dev                # gallery dev server
pnpm mcp                # run the MCP server over stdio
```

CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, tests and
validate on Node 22 and 24, and the gallery e2e on Node 24; it fails if generated
files are not committed. The release workflow (`docs/releasing.md`) also runs the
package check before publishing.

## Non-negotiable invariants

1. **Goldens are regression locks**: never hand-edit
   `packages/blocks/src/*/*/golden/**`. New blocks get theirs from
   `pnpm vitest run test/generate-goldens.test.tsx` (from `packages/blocks`),
   which never overwrites an existing golden.
2. **Generated files are never hand-edited**: `preview-props.json` (rewritten by
   `pnpm test`), `packages/stimulus/templates/**` (rewritten by
   `pnpm generate:stimulus`) and `packages/tokens/css/cremona.css` (rewritten by
   `pnpm build:css`). Change the source block, `packages/tokens/src/cremona.css`
   or the generator, rerun, commit the result.
3. **Parity is a gate**: a block change that breaks its parity test is a
   regression unless the golden is deliberately regenerated. The comparator
   (`packages/blocks/test/helpers/parity.ts`) is strict — extend its _semantic_
   normalizations only with a real justification.
4. **New blocks** follow `docs/authoring-guide.md` and must pass parity +
   `pnpm validate`. MCP `add_block` scaffolds them, in an existing category
   (`add_category` first otherwise); it refuses a key that already exists.
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
- `packages/blocks/{scripts,dist,public}/` — the published `@cremona/blocks`:
  `scripts/build.mjs` compiles each block to `dist/<category>/<file>/react.{js,d.ts}`
  (the entry behind `@cremona/blocks/<category>/<file>`), `prepack` also copies
  the gallery's placeholder images to `public/media/`; `dist/` and `public/` are
  build output, never committed. Inside the repo, `@cremona/blocks/*` resolves
  to the TSX sources.
- `packages/tokens/css/` — `cremona.css` (the stylesheet shipped to hosts,
  compiled by `pnpm build:css` from `packages/tokens/src/cremona.css`: Tailwind
  v4 over the blocks, their goldens and the gallery, so a block that adds a
  class needs a rebuild) + `themes.css` (tokens only).
- `packages/stimulus/{src,templates}/` — controllers + generated templates.
- `packages/mcp/{src,bin,scripts,test}/` — MCP server (plain ESM JS).
- `apps/gallery/` — docs app with live previews; Playwright specs in `e2e/`.
- `tools/generate-stimulus.mjs` (+ `tools/stimulus/`) — template generator.
  `tools/use-client.mjs` — the `"use client"` directive of every block.

## Conventions

- New parity tests are named `<category>-<file>.parity.test.tsx`.
- Every block's `react.tsx` starts with `"use client";` (blocks use hooks; a
  copied block and a Server Component import both need it): run
  `node tools/use-client.mjs` after adding a block. The build also adds it to the
  compiled entry of a source that lacks it, with a warning.
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
