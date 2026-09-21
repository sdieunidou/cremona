# Stimulus adapter

For Symfony / Hotwire apps that want the same visuals without React.

## Setup

```bash
pnpm add @cremona/stimulus @cremona/tokens
```

```js
// assets/controllers.js (or any bootstrap file)
import { Application } from "@hotwired/stimulus";
import { registerCremona } from "@cremona/stimulus";

const app = Application.start();
registerCremona(app); // registers cremona-visual + cremona-theme
```

```twig
{# base.html.twig #}
<link rel="stylesheet" href="/css/cremona.css">  {# or bundled #}
<html data-controller="cremona-theme">
```

## Templates

Every variant of every block ships as a **static HTML template**, generated
from the golden references (so markup matches the React render by
construction):

```
packages/stimulus/templates/<category>/<file>/<slug>.html
packages/stimulus/templates/manifest.json   # labels + slugs per block
```

Copy a template (or render it server-side from your own storage) and drop it in
place. Example (`metrics/stat-card`, variant `default`):

```html
<div data-controller="cremona-visual" aria-hidden="true" class="relative isolate flex size-full items-center justify-center overflow-hidden px-2">
  …
</div>
```

## Controllers

### cremona-visual

Plays the entrance animation when the visual enters the viewport (or on
`mount`). The generated markup carries:

- inline initial styles (the hidden state — no flash, matches the POC SSR),
- `data-anim-order="N"` — render order for the stagger cascade,
- `data-anim-to="{"opacity":"1",…}"` — the target declarations,
- `data-anim-initial="opacity:0;transform:…"` — for replay resets.

Values: `trigger` (`mount|inView|inViewRepeat`, default `inViewRepeat`),
`duration` (450ms), `stagger` (70ms/order), `delay` (60ms).

Motion fidelity note: React adapter uses `motion/react` springs (exact POC
curves); the Stimulus controller plays equivalent CSS `ease-out` transitions —
same choreography, simpler engine.

### cremona-theme

Mount on `<html>`: manages `.dark` + `.theme-<name>` classes, persists to
localStorage (`cremona-appearance`, `cremona-theme`), follows
`prefers-color-scheme` when `appearance="system"`.

```html
<html data-controller="cremona-theme" data-cremona-theme-appearance-value="system">
```

Programmatic: `themeChanged({params:{theme:"sakura"}})`, `toggle()`,
listen to `cremona-theme:changed`.

## Images

Placeholders live in `apps/gallery/public/media/` — copy `media/placeholders/*`
into your Symfony `public/media/placeholders/` to resolve `../../media/…`
paths the same way the POC did.
