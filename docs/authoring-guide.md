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
   `bg-primary/10`…), status included (`text-success`, `bg-warning/10`,
   `bg-info text-info-foreground`, `text-destructive-foreground` on a solid
   destructive surface), never raw palette colors. The rainbow glow is the one
   palette gradient.
2. **Complete defaults, documented props** — the component must render fully
   with zero props (that's what the generated golden captures). Export its
   props interface (`<Name>Props extends VisualProps`), give every prop a JSDoc
   comment and its default in the component's parameters: `pnpm generate:api`
   turns them into `api.json` — type, default and description of each prop —
   which the gallery shows as the block's props table and `get_block` returns
   as `api`.
3. **Variant props survive JSON** — strings, numbers, booleans, arrays, plain
   objects, and lucide icons: `preview-props.json` stores a component as
   `"lucide:Name"` and an element as `{ "$element": "lucide:Name", "props": … }`.
   Any other component or function fails the parity test. Prefer icon keys
   mapped inside the block (`icon: "share"`), as the kits do: such a prop also
   crosses the Server Component boundary.
4. **Motion language** — entrance: `opacity 0→1, y 8→0, .35s easeOut`
   (or springs `stiffness 300–420, damping 14–18`); stagger `.07–.15`;
   hover/focus feedback `transition-all duration-200`; respect the shared
   props (`animated`, `trigger`, plus `fadeOut`/`isometric`/`gradient`
   whenever the visual lives in a card wrapper). Loops (infinite transitions,
   timers, rAF, SMIL, CSS `animate-*`) run only while
   `useLoopActive(ref, animated)` is true; otherwise render their resting frame.
5. **Accessibility mirror** — real text (not lorem), semantic elements
   (`button`, `input`, `table`…), labels and `aria-*` wired with `useId`, and
   the focus recipe in the class strings
   (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`,
   without `outline-none` on the same element). Blocks stay
   `aria-hidden="true"` at the scene root; outside `components/*`, a control
   spreads `noFocus` (`tabIndex: -1`, `mousedown` `preventDefault`) to stay out
   of the tab order. A derived component removes both
   ([accessibility.md](accessibility.md)).
6. **Scale** — the category decides it (`blockScale()` in
   `packages/mcp/src/store.js`, reported as the MCP `scale`): **real-size**
   for `components/*`, `forms/*`, `mobile/*`, `notices/*` and
   `ecommerce/product-card`, `order-row`, `checkout-summary` — real UI
   (12–16 px text, 32–44 px controls) centred in the preview stage;
   **miniature** for `sections/*`, `layouts/*`, `ecommerce/product-grid` and
   `cart-drawer` — thumbnail wireframes (7–10 px text) in a `max-w-*` wrapper;
   **illustration** for every other category. A block in a new category is an
   illustration until `store.js` lists the category.
7. **Variants** — `default` first; then the style variants the block takes
   (`add_block` scaffolds five for a card block: `fadeOut`, `isometric`,
   `isometric · fadeOut`, `default · no gradient`, `isometric · no gradient`;
   drop those whose props the block lacks); then states and content (`error`,
   `loading`, `empty`, `custom copy`). Labels join aspects with ` · `
   (`isometric · custom copy`). Each new variant gets its golden from the
   generator and its Stimulus template from `pnpm generate:stimulus`.
8. **Dark mode** — every visual must read correctly in all 9 themes ×
   light/dark (check in the gallery with the theme picker).

## What a block imports

`react`, `motion/react`, `lucide-react`, `@cremona/core` and
`@cremona/react` — never another block, so that its source works on its own
once copied (`get_block` returns that one file):

- root: `cn(frameClasses(fill), className)`, and the module's `max-w-*` only
  without `fill` (`!fill && "max-w-72"`);
- entrance: `useInView(ref, { once, amount: 0.5 })` per trigger, as in the
  `add_block` skeleton;
- loops: `useLoopActive(ref, animated)` (rule 4);
- a fixed-size stage that must fit narrow boxes: `useFitScale(frameRef, stageRef)`;
- a numeric series: `toFractions` (`@cremona/core`); world geography:
  `@cremona/core/land-mask`.

`cn` joins class names without resolving conflicts: never put two utilities
for the same property on one element (`border-input` and
`border-destructive`) — choose one with a condition, or the stylesheet order
decides. The full API is in [react.md](react.md#shared-helpers).

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
