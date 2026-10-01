# Porting Guide — POC snapshot → @cremona/blocks

This guide is the contract for porting a Cremona visual from the extracted POC
snapshot into the library. It is used by humans, sub-agents and AI sessions alike.
The 115 POC blocks (the folders with a `sources/` directory) are ported; the
same contract holds when you change one: its goldens never change, so its
parity render (`animated`, `trigger="inViewRepeat"`, the variant's props) must
stay the same. New visuals follow the [authoring guide](authoring-guide.md).

## Where everything is

For each block `packages/blocks/src/<category>/<block>/` contains:

| File | Purpose |
|---|---|
| `block.json` | Metadata: name, description, `page` config (cols/animated/trigger), `variants[]` with `label`, `slug`, `propsRaw` (minified props from the POC page chunk). |
| `golden/*.html` | Server-rendered SSR snapshots of every preview frame, in page order. **The render reference.** |
| `sources/page.js` | Minified page chunk: contains the exact `variations:[{label, props}]` list and page config. |
| `sources/<name>-<hash>.js` | Minified component chunk(s): the actual component implementation with motion variants. |
| `react.tsx` | **You write this** — the React implementation. |
| `packages/blocks/test/<category>-<file>.parity.test.tsx` | **You write this** — golden parity test (the POC blocks' tests are named `<file>.parity.test.tsx`). |

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
"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface XProps extends VisualProps {
  // per-block props with defaults = the POC's default copy
}

export function X({ animated = false, trigger = "inView", fill = false, className, ...props }: XProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? { initial: "hidden", animate: trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce) ? "visible" : "hidden" }
    : {};

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div variants={animated ? variantObj : undefined} {...state}>...</motion.div>
    </div>
  );
}
```

Rules (non-negotiable for parity):
- The first line is `"use client";` (`node tools/use-client.mjs` puts it there,
  `pnpm check:use-client` checks it).
- The root element is `<div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>`
  (`frameClasses(false)` is the preview frame,
  `relative isolate flex size-full items-center justify-center overflow-hidden px-2`)
  unless the golden shows a different root (some blocks use a wider stage).
  The module's `max-w-*` cap applies only without `fill` (`!fill && "max-w-72"`).
- `animated = false` default; when false render the FINAL state (no motion props, `style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}` on the iso wrapper).
- Copy the motion variant objects **character-for-character** from the minified source (durations, springs, delays).
- Gate every loop (infinite transition, timer, rAF, SMIL, CSS `animate-*`) with
  `useLoopActive(ref, animated)` from `@cremona/react`, and render its resting
  frame when it is `false`. The hook is `true` on the server, so the parity
  render does not change.
- Class strings: keep exact order. Conditional classes go last (via `cn` or template literal).
- `gradient` default true, `fadeOut` / `isometric` / `gradient` are standard cross-block props when present in the POC.
- SVG paths: copy path-generation code exactly (same float arithmetic → same `d`).
- If a prop is a function/component identifier in the minified source, import the
  matching icon from `lucide-react` (name from the golden HTML class).

Parity does not cover the `animated={false}` branch (the final state, which
the Stimulus templates are made of), the `fill` branch, client-only effects or
new optional props that render nothing different unless passed: they may
change, and are checked in the gallery and by the behaviour tests.

## Step 3 — Write the parity test

Create `packages/blocks/test/<category>-<file>.parity.test.tsx`:

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
- Run: `pnpm vitest run test/<category>-<file>.parity.test.tsx` **from `packages/blocks/`**
  (an existing POC test is `test/<file>.parity.test.tsx`).
- Iterate until ALL tests pass. Do NOT weaken the comparator.
- `skip: true` is allowed only for interactive-only previews (hover/click states
  that cannot be SSR'd) — document why in a comment.

## Step 4 — Registry

The gallery and MCP discover blocks from the filesystem — no manual registration
needed.

## Stimulus templates

Stimulus templates are **generated**: `pnpm generate:stimulus`
(`tools/generate-stimulus.mjs`) server-renders every block. A template is the
block's final render (`animated={false}`); the start state of each animated
element comes from the initial render, which must match the golden, or the run
stops. Never write templates by hand
([Regenerating](stimulus.md#regenerating)).

## Checklist before done

- [ ] `react.tsx` follows the pattern above, `"use client";` first
- [ ] parity test passes for every variant that isn't explicitly skipped
- [ ] `pnpm vitest run` (whole blocks package) still passes
- [ ] `pnpm generate:stimulus` and `pnpm build:css` leave nothing uncommitted, and
      `pnpm check` is green
