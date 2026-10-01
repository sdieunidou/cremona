# @cremona/stimulus

The [Cremona](https://github.com/sdieunidou/cremona) blocks for Symfony and
Hotwire apps: Stimulus controllers plus a static HTML template for every
variant of every block, generated from the same references as the React
render.

```bash
npm i @cremona/stimulus @cremona/tokens @hotwired/stimulus
```

```js
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "@cremona/stimulus";
import "@cremona/tokens/css/cremona.css";

registerCremona(Application.start()); // registers cremona-visual and cremona-theme
```

- Templates: `@cremona/stimulus/templates/<category>/<file>/<slug>.html`, with
  the labels and slugs of every block in `templates/manifest.json`.
- `cremona-visual` plays a block's entrance; `cremona-theme` (on `<html>`)
  handles light/dark and the 9 themes.
- The controllers are also exported one by one: `CremonaVisualController`,
  `CremonaThemeController` (`@cremona/stimulus/controllers/cremona-visual`,
  `…/cremona-theme`).

Setup with Webpack Encore, Vite or AssetMapper, the controllers' values and the
templates: [docs/stimulus.md](https://github.com/sdieunidou/cremona/blob/main/docs/stimulus.md).

Peer dependency: `@hotwired/stimulus` 3.2+. MIT license.
