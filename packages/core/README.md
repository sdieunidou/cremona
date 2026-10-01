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
import { cn, frameClasses, toFractions, type VisualProps } from "@cremona/core";
import { isLand } from "@cremona/core/land-mask";
```

- `VisualProps`, `TriggerMode` — the props every block takes: `animated`,
  `trigger` (`"mount" | "inView" | "inViewRepeat"`), `fill`, `className`.
- `cn(...classes)` — joins the truthy class names. It does not resolve
  conflicting utilities: of two classes for the same property, the one later in
  the stylesheet wins.
- `frameClasses(fill)` — the classes of a block's root: the gallery's preview
  frame, or a plain box with `fill`.
- `toFractions(points, values?, min?, max?)` — a series as heights from 0 to 1
  (`null` for a missing value), scaled to `min`..`max` or its own range.
- `FRAME_HEIGHTS`, `gridCols(cols)` — the gallery's stage heights per variant
  size and its grid columns, for composing your own previews.
- `BlockMeta`, `VariantDef` — the shape of a block's metadata.
- `ISO_HIDDEN`, `ISO_VISIBLE`, `ISO_TRANSITION`, `RAINBOW_GRADIENT`,
  `EASE_OUT` — shared animation constants.
- `@cremona/core/land-mask` — `isLand(lat, lng)`, `landMask()` and the
  `LAND_MASK_*` constants: the world land mask the `geo/*` blocks draw from.

ESM only, with type declarations. MIT license.
