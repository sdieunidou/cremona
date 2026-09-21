# Porting Guide — POC snapshot → @cremona/blocks

This guide is the contract for porting a Cremona visual from the extracted POC
snapshot into the library. It is used by humans, sub-agents and AI sessions alike.

## Where everything is

For each block `packages/blocks/src/<category>/<block>/` contains:

| File | Purpose |
|---|---|
| `block.json` | Metadata: name, description, `page` config (cols/animated/trigger), `variants[]` with `label`, `slug`, `propsRaw` (minified props from the POC page chunk). |
| `golden/*.html` | Server-rendered SSR snapshots of every preview frame, in page order. **The render reference.** |
| `sources/page.js` | Minified page chunk: contains the exact `variations:[{label, props}]` list and page config. |
| `sources/<name>-<hash>.js` | Minified component chunk(s): the actual component implementation with motion variants. |
| `react.tsx` | **You write this** — the React implementation. |
| `react.parity.test.tsx` (in `packages/blocks/test/`) | **You write this** — golden parity test. |

## Step 1 — Read the sources

1. Open `sources/page.js`. Find `variations:[{label:...,props:{...}}]` — this is the
   authoritative variant list with exact props. Note `cols`, `animated`, `trigger`,
   `size` if present.
2. Open the component chunk(s). They are minified but readable (template literals
   preserved). Map minified identifiers:
   - `e({...})` from `dist-B05qellE.js` = `createContext`-like helper (`m=e({default:()=>O})` = component registry, ignore)
   - `(0,g.jsx)(\`div\`,{...})` = JSX elements
   - `{hidden:{...},visible:{...}}` objects = motion variants (KEEP exact durations/springs/delays)
   - `s(F,{once:!0,amount:.5})` = `useInView(ref, { once: true, amount: 0.5 })`
   - `i(\`...\`, m)` = `cn(...)` classname merge
3. Icons: chunks import from icon chunks (`./users-DgEF56B9.js` etc.). The golden HTML
   shows the exact lucide icon (`class="lucide lucide-users"`). Use `lucide-react@>=1`
   (same icon set as the POC).

## Step 2 — Write `react.tsx`

Follow `packages/blocks/src/metrics/stat-card/react.tsx` as the reference pattern:

```tsx
import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface XProps extends VisualProps {
  // per-block props with defaults = the POC's default copy
}

export function X({ animated = false, trigger = "inView", ...props }: XProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? { initial: "hidden", animate: trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce) ? "visible" : "hidden" }
    : {};

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative isolate ...", className)}>
      <motion.div variants={animated ? variantObj : undefined} {...state}>...</motion.div>
    </div>
  );
}
```

Rules (non-negotiable for parity):
- The root element is `<div ref={ref} aria-hidden="true" className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}>` unless the golden shows a different root (some blocks use a wider stage).
- `animated = false` default; when false render the FINAL state (no motion props, `style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}` on the iso wrapper).
- Copy the motion variant objects **character-for-character** from the minified source (durations, springs, delays).
- Class strings: keep exact order. Conditional classes go last (via `cn` or template literal).
- `gradient` default true, `fadeOut` / `isometric` / `gradient` are standard cross-block props when present in the POC.
- SVG paths: copy path-generation code exactly (same float arithmetic → same `d`).
- If a prop is a function/component identifier in the minified source, import the
  matching icon from `lucide-react` (name from the golden HTML class).

## Step 3 — Write the parity test

Create `packages/blocks/test/<file>.parity.test.tsx`:

```tsx
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { X } from "../src/<category>/<file>/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/<category>/<file>");

runGoldenParity("<category>/<file>", {
  blockDir,
  Component: X,
  variants: [
    // ONLY for variants whose props contain identifiers (icons, functions):
    { label: "users · custom copy", props: { icon: Users } },
  ],
});
```

- Props for simple variants are auto-parsed from `block.json` (`propsRaw`).
- For icon/identifier props, pass explicit `props` in `variants`.
- Run: `pnpm vitest run test/<file>.parity.test.tsx` **from `packages/blocks/`**.
- Iterate until ALL tests pass. Do NOT weaken the comparator.
- `skip: true` is allowed only for interactive-only previews (hover/click states
  that cannot be SSR'd) — document why in a comment.

## Step 4 — Registry

The gallery and MCP discover blocks from the filesystem — no manual registration
needed. Optionally regenerate the explicit registry with:

```bash
python3 tools/extract/gen_registry.py
```

## Stimulus templates

Stimulus templates are **generated** from the golden files by
`tools/generate-stimulus.mjs` — do not write them by hand.

## Checklist before done

- [ ] `react.tsx` follows the pattern above
- [ ] parity test passes for every variant that isn't explicitly skipped
- [ ] registry regenerated (`python3 tools/extract/gen_registry.py`) — optional
- [ ] `pnpm vitest run` (whole blocks package) still passes
