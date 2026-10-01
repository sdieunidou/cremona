# @cremona/stimulus

The [Cremona](https://github.com/sdieunidou/cremona) blocks for Symfony and
Hotwire apps: a static HTML template of every variant of every block, and the
Stimulus controllers that animate and theme them.

```bash
npm i @cremona/stimulus @cremona/tokens @hotwired/stimulus
```

```js
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "@cremona/stimulus";
import "@cremona/tokens/css/cremona.css";

registerCremona(Application.start()); // registers cremona-visual and cremona-theme
```

- Templates: `@cremona/stimulus/templates/<category>/<file>/<slug>.html`, each
  the block's final React render, readable without JavaScript.
  `templates/manifest.json` lists every block's variants (label, slug, `size`)
  and its `effects`.
- A template fills its container: give the container the variant's height
  (`size`).
- `cremona-visual` plays a template's entrance with Web Animations. Blocks
  marked `"effects": "entrance-only"` keep their loops and JavaScript-driven
  effects in React only (`reactOnly` lists them).
- `cremona-theme` (on `<html>`) handles light/dark and the 9 themes.
- The controllers are also exported one by one: `CremonaVisualController`,
  `CremonaThemeController` (`@cremona/stimulus/controllers/cremona-visual`,
  `…/cremona-theme`). Type declarations are included.

Setup with Webpack Encore, Vite or AssetMapper, sizing and including templates,
the controllers' values and the head partial that prevents a flash:
[docs/stimulus.md](https://github.com/sdieunidou/cremona/blob/main/docs/stimulus.md).

Peer dependency: `@hotwired/stimulus` 3.2+. MIT license.
