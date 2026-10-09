# AGENTS.md — working on the Cremona repo

Instructions for AI sessions (Claude Code, opencode…) contributing to this repo.
Humans start with [CONTRIBUTING.md](CONTRIBUTING.md); the rules below apply to
everyone.

## Commands

```bash
pnpm check              # lint + format check + typecheck + check:use-client + check:api + tests + validate — run before finishing
pnpm test               # every package's tests (block parity and end state, MCP e2e, tokens, stimulus…)
pnpm typecheck          # tsc --noEmit per package
pnpm lint               # ESLint (errors fail CI; block a11y findings are warnings)
pnpm format             # Prettier (a hook formats files you edit in Claude Code)
pnpm validate           # library coherence (catalog ↔ blocks ↔ goldens ↔ preview props ↔ api.json ↔ stimulus ↔ parity tests)
pnpm check:use-client   # fail unless every block's react.tsx starts with "use client" (node tools/use-client.mjs --check)
node tools/use-client.mjs                     # add or move the directive where it is missing
pnpm generate:stimulus  # regenerate packages/stimulus/templates/**
pnpm generate:api       # regenerate every block's api.json (props reference); check:api fails when one is stale
pnpm build:css          # recompile packages/tokens/css/cremona{,.scoped}.css (Tailwind v4, dev only)
pnpm build              # compile core, react, blocks (dist/, one entry per block) and the gallery
pnpm --filter @cremona/blocks check:package   # pack @cremona/blocks, check it with publint + attw
pnpm gallery:build && pnpm e2e   # Playwright (E2E_PORT, default 4179): block pages, axe, keyboard, routing
pnpm dev                # gallery dev server
pnpm mcp                # run the MCP server over stdio
```

CI (`.github/workflows/ci.yml`) runs on Node 22 and 24: lint, format check,
typecheck, `check:use-client`, tests, then `pnpm generate:stimulus`,
`pnpm generate:api` and `pnpm build:css` again, and fails on any changed **or
untracked** file under `packages/blocks`, `packages/stimulus` and
`packages/tokens` (a golden, `api.json`, template,
`cremona.css` or `cremona.scoped.css` left uncommitted), then `validate`. The gallery e2e job (Node 24)
fails when a block page shows an error card, throws or logs a console error (a
failed image or font request logs one), or when axe finds a violation on the
gallery chrome, in light or dark. The release workflow (`docs/releasing.md`)
also runs the package check before publishing.

## Non-negotiable invariants

1. **Goldens are regression locks**: never hand-edit
   `packages/blocks/src/*/*/golden/**`. New blocks and new variants get theirs
   from `pnpm vitest run test/generate-goldens.test.tsx` (from
   `packages/blocks`), which only writes missing goldens, from the variant's
   props in `preview-props.json`. A golden changes only on purpose: delete
   the `golden/*.html` that should change, regenerate, review the diff, run the
   block's parity test.
2. **Generated files are never hand-edited**: `api.json` (rewritten by
   `pnpm generate:api` from the props interface and its JSDoc),
   `packages/stimulus/templates/**` (rewritten by `pnpm generate:stimulus`) and
   `packages/tokens/css/cremona.css` and `cremona.scoped.css` (rewritten by
   `pnpm build:css`). Change the source block, `packages/tokens/css/tailwind.css`,
   `packages/tokens/src/*.css` or the generator, rerun, commit the result.
3. **Parity is a gate**: a block change that breaks its parity test is a
   regression unless the golden is deliberately regenerated. The comparator
   (`packages/blocks/test/helpers/parity.ts`) is strict — extend its _semantic_
   normalizations only with a real justification. The end-state tests are a
   gate too: every entrance ends on the `animated={false}` render.
4. **New blocks** follow `docs/authoring-guide.md` and must pass parity +
   `pnpm validate`. MCP `add_block` scaffolds them, in an existing category
   (`add_category` first otherwise); it refuses a key that already exists.
5. **Design tokens live only in `packages/tokens`** — blocks use semantic tokens
   (`bg-card`, `text-muted-foreground`, `text-success`…), never raw colors: a status
   is `success`, `warning`, `info` or `destructive`, a category that only has to be
   told apart is `chart-1`…`chart-5`. `test/tokens-only.test.ts` fails on a palette
   colour (`bg-emerald-500`, `var(--color-rose-500)`) outside its list of artwork
   (scenes, file-type glyphs, brand logos…), each entry with its reason.
6. **No HTML from props**: blocks render text as JSX and never use
   `dangerouslySetInnerHTML` (ESLint error in `packages/blocks/src`). They never
   read the clock while rendering either (`new Date()`): take a prop with a
   fixed default, so server and client render the same markup.

## Layout map

- `packages/blocks/src/<category>/<block>/` — source of truth: `block.json`
  (metadata and the variants: label, slug, stage size), `preview-props.json`
  (the props of every variant, by label; icons are `"lucide:<Name>"`),
  `react.tsx`, the generated `api.json` (props reference: type, default and
  JSDoc of every prop) and `golden/` (one render reference per variant).
- `packages/blocks/{scripts,dist,public}/` — the published `@cremona/blocks`:
  `scripts/build.mjs` compiles each block to `dist/<category>/<file>/react.{js,d.ts}`
  (the entry behind `@cremona/blocks/<category>/<file>`), `prepack` also copies
  the gallery's placeholder images to `public/media/`; `dist/` and `public/` are
  build output, never committed. Inside the repo, `@cremona/blocks/*` resolves
  to the TSX sources.
- `packages/blocks/test/` — one parity test per block, `helpers/` (runner and
  comparator), `generate-goldens.test.tsx`, and behaviour tests (data edge
  cases, loops, `fill`…).
- `packages/tokens/css/` — `cremona.css` (the stylesheet shipped to hosts,
  compiled by `pnpm build:css` from `packages/tokens/src/cremona.css`: Tailwind
  v4 over the blocks and their goldens, so a block that adds a class needs a
  rebuild), `cremona.scoped.css` (the same confined to `.cremona` elements,
  `packages/tokens/scripts/build-css.mjs`), `tailwind.css` (what Cremona adds to
  Tailwind: the source both compile from, shipped to Tailwind hosts),
  `themes.css` (tokens only), `fonts.css`. The gallery compiles its own
  stylesheet (`apps/gallery/src/gallery.css`, `@tailwindcss/vite`).
- `packages/stimulus/{src,templates}/` — controllers (with their `.d.ts`) +
  generated templates.
- `packages/mcp/{src,bin,scripts,test}/` — MCP server (plain ESM JS).
- `apps/gallery/` — docs app with live previews; Playwright specs in `e2e/`.
- `tools/generate-stimulus.mjs` (+ `tools/stimulus/`) — template generator.
  `tools/generate-api.mjs` — the props references. `tools/use-client.mjs` —
  the `"use client"` directive of every block.

## Conventions

- Parity tests are named `<category>-<file>.parity.test.tsx` (what `add_block`
  creates). `validate` finds a block's test by its `runGoldenParity("<key>", …)`
  call, not by its name.
- Give every prop of a block's props interface (and of the types it uses) a
  JSDoc comment: it becomes the prop's description in `api.json`, the
  gallery's props table and the MCP `get_block` response.
- Every block's `react.tsx` starts with `"use client";` (blocks use hooks; a
  copied block and a Server Component import both need it): run
  `node tools/use-client.mjs` after adding a block. The build also adds it to the
  compiled entry of a source that lacks it, with a warning.
- Blocks are self-contained: no imports between blocks; shared helpers from
  `@cremona/core` and `@cremona/react` (`useLoopActive` gates every loop — see
  the authoring guide); icons from `lucide-react` (1.x); motion from
  `motion/react`.
- Keep prose docs in English, describing the current state (no history); keep
  code comments minimal.

## Agent tooling

- `.mcp.json` / `opencode.json` register this repo's MCP server — start the
  session from the repo root.
- `.claude/settings.json` pre-approves the main commands above (`pnpm check`,
  `pnpm test`, `generate:stimulus`, `generate:api`, `build:css`, targeted
  `vitest`…) and the read-only MCP tools, denies hand edits of goldens,
  `api.json`, Stimulus templates, `cremona.css` and `cremona.scoped.css`, and
  formats every edited file with Prettier.
