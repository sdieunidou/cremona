# Authoring guide — new visuals (components, layouts, ecommerce, forms…)

This is the contract for authoring NEW visuals that have no POC source. The
quality bar is identical to the 115 POC-ported blocks: same anatomy, same
motion language, same tokens, same test machinery.

## Anatomy of a new visual

`packages/blocks/src/<category>/<file>/`

| File | Rule |
|---|---|
| `block.json` | metadata + variants (scaffolded by MCP `add_block` or manually) |
| `react.tsx` | the implementation (self-contained, complete defaults) |
| `preview-props.json` | **generated** by the parity test run — never hand-write |
| `golden/*.html` | **generated** by `test/generate-goldens.test.tsx` — never hand-write |

## Rules (non-negotiable)

1. **Tokens only** — semantic colors (`bg-card`, `text-muted-foreground`,
   `bg-primary/10`…), never raw palette colors for UI surfaces. Palette colors
   are allowed only for the rainbow glow / status semantics the POC already uses.
2. **Complete defaults** — the component must render fully with zero props
   (that's what the generated golden captures).
3. **Variant props must be JSON-parseable** (strings, numbers, booleans,
   arrays, plain objects). **Never pass components/icons as props** — if a
   variant needs a different icon, make it a component-internal concern
   (e.g. an `iconSet?: "commerce" | "dev"` prop or data-driven).
4. **Motion language** — entrance: `opacity 0→1, y 8→0, .35s easeOut`
   (or springs `stiffness 300–420, damping 14–18`); stagger `.07–.15`;
   hover/focus feedback `transition-all duration-200`; respect the shared
   props (`animated`, `trigger`, plus `fadeOut`/`isometric`/`gradient`
   whenever the visual lives in a card wrapper).
5. **Accessibility mirror** — real text (not lorem), semantic elements
   (`button`, `input`, `table`…), `aria-*` on interactive parts. Blocks stay
   `aria-hidden="true"` at the scene root like the POC.
6. **Both scales** — `components/*` render at REAL size (centered in the
   preview stage); `layouts/*`, `ecommerce/*`, `forms/*`, `mobile/*` render as
   miniature mockups (like `sections/*`), with a `max-w-*` wrapper.
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
node ../stimulus/… or: node tools/generate-stimulus.mjs # 4. stimulus templates
node packages/mcp/scripts/validate.mjs                 # 5. coherence
```

The parity test for a new block uses the standard runner — since goldens are
generated from the component itself, parity is a **regression lock** (any
markup change must be deliberate: regenerate the golden, review the diff).

## Registry & discovery

Nothing to register — gallery/MCP discover from the filesystem. Optionally
`python3 tools/extract/gen_registry.py`.
