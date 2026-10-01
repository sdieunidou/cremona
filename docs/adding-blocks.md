# Adding blocks, categories and variants

## TL;DR workflow

1. **Scaffold** — MCP `add_block` (or copy an existing block folder):
   creates `block.json` (the six style variants of a card block), a `react.tsx`
   skeleton that starts with `"use client";`, and a parity test. A new category
   comes first, from `add_category`.
2. **Implement** — follow `docs/authoring-guide.md` (new visuals) or
   `docs/porting-guide.md` (POC blocks): scene root, card wrapper, motion
   variants, exact class strings. A copied block keeps `"use client";` as its
   first line (`node tools/use-client.mjs` puts it back).
3. **Golden** — POC blocks already have theirs; for a new block or a new
   variant run `pnpm vitest run test/generate-goldens.test.tsx` first (from
   `packages/blocks`: it renders the missing goldens into `golden/<slug>.html`).
4. **Prove** — `pnpm vitest run test/<category>-<file>.parity.test.tsx`
   from `packages/blocks` must be green (golden parity).
   Passing tests also write `preview-props.json`.
5. **Propagate** — `pnpm build:css` (the block's classes into `cremona.css`),
   `pnpm generate:stimulus` (templates), then `pnpm check` (which includes
   `check:use-client` and `validate`). Commit every generated file: CI
   regenerates them and fails on a changed or untracked one.

## Naming rules

- Category slug: lowercase, hyphenated (`payments`). Folder = slug.
- Block file: lowercase, hyphenated, stable (it's the public key and the
  import path, `@cremona/blocks/<category>/<file>`).
- Variant labels: free text, aspects separated by ` · `
  (`isometric · no gradient · custom copy`); the slug is
  `<three-digit index>-<label in kebab case>` (`005-isometric-no-gradient`).
  The first variant is usually `default`. Card blocks carry the six style
  variants `add_block` scaffolds — `default`, `fadeOut`, `isometric`,
  `isometric · fadeOut`, `default · no gradient`, `isometric · no gradient` —
  when they take those props; other variants show states and content
  (`error`, `loading`, `custom copy`).
- Test files: `<category>-<file>.parity.test.tsx` (what `add_block` creates).
  The POC blocks' tests are named `<file>.parity.test.tsx`.

## Kinds

- `block` — product and dashboard visuals, and the forms, mobile, notices and
  ecommerce kits
- `layout` — wireframes of marketing sections and page shells (`sections/*`,
  `layouts/*`)
- `component` — real-size UI primitives (`components/*`)

The scale of a block (illustration, real-size, miniature) follows from its
category: see rule 6 of the [authoring guide](authoring-guide.md#rules-non-negotiable).

## What "in coherence" means

- Catalog (`catalog.json`) lists the block; folder exists; `block.json` matches.
- Every variant has a golden, a `preview-props.json` entry and a Stimulus
  template; the block has a parity test (`pnpm validate` checks all of it).
- `react.tsx` starts with `"use client";` (`pnpm check:use-client`).
- The visual uses only the semantic tokens (no hardcoded colors) and renders
  correctly in all 9 themes × light/dark — check it in the gallery
  (`pnpm dev`) with the theme picker before declaring done.
