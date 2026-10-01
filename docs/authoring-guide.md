# Authoring guide — new visuals (components, layouts, ecommerce, forms…)

This is the contract for authoring NEW visuals that have no POC source. The
quality bar is identical to the 115 POC-ported blocks: same anatomy, same
motion language, same tokens, same test machinery.

## Anatomy of a new visual

`packages/blocks/src/<category>/<file>/`

| File | Rule |
|---|---|
| `block.json` | metadata + variants (scaffolded by MCP `add_block` or manually) |
| `react.tsx` | the implementation (self-contained, complete defaults); its first line is `"use client";` |
| `api.json` | **generated** by `pnpm generate:api` from the props interface — never hand-write |
| `preview-props.json` | **generated** by the parity test run — never hand-write |
| `golden/*.html` | **generated** by `test/generate-goldens.test.tsx` — never hand-write |

## Rules (non-negotiable)

1. **Tokens only** — semantic colors (`bg-card`, `text-muted-foreground`,
   `bg-primary/10`…), never raw palette colors for UI surfaces. Palette colors
   are allowed only for the rainbow glow / status semantics the POC already uses.
2. **Complete defaults, documented props** — the component must render fully
   with zero props (that's what the generated golden captures). Export its
   props interface (`<Name>Props extends VisualProps`), give every prop a JSDoc
   comment and its default in the component's parameters: `pnpm generate:api`
   turns them into `api.json` — type, default and description of each prop —
   which the gallery shows as the block's props table and `get_block` returns
   as `api`.
3. **Variant props must be JSON-parseable** (strings, numbers, booleans,
   arrays, plain objects). **Never pass components/icons as props** — if a
   variant needs a different icon, make it a component-internal concern
   (e.g. an `iconSet?: "commerce" | "dev"` prop or data-driven).
4. **Motion language** — entrance: `opacity 0→1, y 8→0, .35s easeOut`
   (or springs `stiffness 300–420, damping 14–18`); stagger `.07–.15`;
   hover/focus feedback `transition-all duration-200`; respect the shared
   props (`animated`, `trigger`, plus `fadeOut`/`isometric`/`gradient`
   whenever the visual lives in a card wrapper). Loops (infinite transitions,
   timers, rAF, SMIL, CSS `animate-*`) run only while
   `useLoopActive(ref, animated)` is true; otherwise render their resting frame.
5. **Accessibility mirror** — real text (not lorem), semantic elements
   (`button`, `input`, `table`…), `aria-*` on interactive parts. Blocks stay
   `aria-hidden="true"` at the scene root like the POC.
6. **Scale** — the category decides it (`blockScale()` in
   `packages/mcp/src/store.js`, reported as the MCP `scale`): **real-size**
   for `components/*`, `forms/*`, `mobile/*`, `notices/*` and
   `ecommerce/product-card`, `order-row`, `checkout-summary` — real UI
   (12–16 px text, 32–44 px controls) centred in the preview stage;
   **miniature** for `sections/*`, `layouts/*`, `ecommerce/product-grid` and
   `cart-drawer` — thumbnail wireframes (7–10 px text) in a `max-w-*` wrapper;
   **illustration** for every other category. A block in a new category is an
   illustration until `store.js` lists the category.
7. **Variants** — the 6 core ones + 2–6 custom ones per visual. Labels follow
   `aspect · aspect` ordering (`isometric · custom copy`).
8. **Dark mode** — every visual must read correctly in all 9 themes ×
   light/dark (check in the gallery with the theme picker).

## Test flow (per block)

```bash
cd packages/blocks
pnpm vitest run test/generate-goldens.test.tsx        # 1. write the golden
pnpm vitest run test/<category>-<file>.parity.test.tsx # 2. parity vs golden (+ writes preview-props.json)
pnpm vitest run                                        # 3. whole suite stays green
cd ../..
node tools/use-client.mjs                              # 4. "use client" first (add_block's skeleton has it)
pnpm build:css                                         # 5. compile the new classes into cremona.css
pnpm generate:stimulus                                 # 6. stimulus templates
pnpm generate:api                                      # 7. props reference (api.json)
pnpm check                                             # 8. lint, format, types, tests, validate
```

`pnpm check` runs `pnpm check:use-client` (`node tools/use-client.mjs --check`),
which fails on a block whose `react.tsx` does not start with `"use client";`,
and `pnpm check:api`, which fails on a stale `api.json`. Commit everything the
steps wrote — goldens, `preview-props.json`, `api.json`, templates and
`cremona.css`: CI regenerates them and fails on a changed or untracked file.

`cremona.css` only contains the classes it was compiled from: until
`pnpm build:css` runs, a class the block introduces renders unstyled (the tokens
coverage test fails on it).

The parity test for a new block uses the standard runner — since goldens are
generated from the component itself, parity is a **regression lock** (any
markup change must be deliberate: regenerate the golden, review the diff).

## Registry & discovery

Nothing to register — the gallery and the MCP server discover blocks from the
filesystem.
