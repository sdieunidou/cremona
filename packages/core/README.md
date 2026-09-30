# @cremona/core

Framework-agnostic types, constants and helpers shared by the
[Cremona](https://github.com/sdieunidou/cremona) blocks and adapters. You get it
with [`@cremona/blocks`](https://www.npmjs.com/package/@cremona/blocks); install
it yourself when your own code imports it, for example a component derived from
a block's source.

```bash
npm i @cremona/core
```

```ts
import { cn, frameClasses, FRAME_HEIGHTS, gridCols, type VisualProps } from "@cremona/core";
```

- `VisualProps` — the props every block takes: `animated`, `trigger`
  (`"mount" | "inView" | "inViewRepeat"`), `fill`, `className`.
- `cn(...classes)` — joins the truthy class names.
- `frameClasses(fill)` — the classes of a block's root: the gallery's preview
  frame, or a plain box with `fill`.
- `FRAME_HEIGHTS`, `gridCols(cols)` — the gallery's stage heights per variant
  size and its grid columns, for composing your own previews.
- `BlockMeta`, `VariantDef` — the shape of a block's metadata.
- `ISO_*`, `RAINBOW_GRADIENT`, `EASE_OUT` — shared animation constants.

ESM only, with type declarations. MIT license.
