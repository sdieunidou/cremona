# @cremona/react

React hooks used by the [Cremona](https://github.com/sdieunidou/cremona)
blocks. You get it with
[`@cremona/blocks`](https://www.npmjs.com/package/@cremona/blocks); install it
yourself when your own code imports it, for example a component derived from a
block's source.

```bash
npm i @cremona/react
```

```ts
import { useInView, useLoopActive, usePrefersReducedMotion, useFitScale } from "@cremona/react";
```

- `useInView(ref, { once, initial, margin, amount })` — `true` while (or once)
  the element is in the viewport; blocks start their entrance with it.
  `observeInView(targets, onEnter, options)` is the same observer outside React.
- `useLoopActive(ref, enabled)` — `true` while a looping animation should run:
  `enabled`, the element intersects the viewport, the page is visible and the
  user does not ask for reduced motion. `true` on the server and while
  hydrating, so server markup shows the looping state.
- `usePrefersReducedMotion()` — the `prefers-reduced-motion: reduce` media
  query; `false` on the server and while hydrating.
- `useFitScale(frame, stage, layout?)` — scales `stage` down (CSS `scale`,
  never up) to fit the content box of `frame`; client-only, so the server
  markup is unscaled.
- `cn` and the `VisualProps`, `TriggerMode`, `BlockMeta`, `VariantDef` types,
  re-exported from `@cremona/core`.

Peer dependencies: `react` and `react-dom` 18.2+ or 19. ESM only, with type
declarations. MIT license.
