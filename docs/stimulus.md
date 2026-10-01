# Stimulus adapter

For Symfony / Hotwire apps. Every variant of every block ships as a static HTML
template: the block's **final render**, the markup React produces with
`animated={false}`. It reads correctly without JavaScript. Two Stimulus controllers
come with the templates:

- `cremona-visual` plays the block's entrance on top of that markup;
- `cremona-theme` manages light/dark and the nine themes.

| What | Where in this repo |
|---|---|
| Templates, one per variant | `packages/stimulus/templates/<category>/<file>/<slug>.html` |
| Index (labels, slugs, sizes, effects) | `packages/stimulus/templates/manifest.json` |
| Controllers | `packages/stimulus/src/cremona-{visual,theme}_controller.js` (`index.js` exports `registerCremona`) |
| Stylesheet | `packages/tokens/css/cremona.css` and its `*.woff2` fonts (about 270 KB, 35 KB gzipped) |
| Placeholder images | `apps/gallery/public/media/placeholders/` |

The packages are not published to npm yet: copy the files. Once they are, the
same files come from `@cremona/stimulus` (`@cremona/stimulus/templates/*`) and
`@cremona/tokens/css/cremona.css`.

## Setup

The controllers import `@hotwired/stimulus` and must be registered in the
application your app already starts. Never call `Application.start()` a second
time.

### Symfony AssetMapper

1. Copy `cremona-visual_controller.js` and `cremona-theme_controller.js` into
   `assets/controllers/`. StimulusBundle registers them as `cremona-visual` and
   `cremona-theme` from their file names.
2. Copy `cremona.css` and its `*.woff2` files into `assets/styles/cremona/`. Then
   load it from `assets/app.js` (`import './styles/cremona/cremona.css';`, which
   AssetMapper turns into a `<link>` tag), or from a `<link>` in your layout.
3. Copy `packages/stimulus/templates/` into `templates/cremona/` (see
   [Placing a template](#placing-a-template)).
4. Copy the placeholder images into `public/media/placeholders/` (see
   [Images](#images)).

### Webpack Encore

`assets/bootstrap.js` already starts the application with `startStimulusApp()`.
Either copy the two controller files into `assets/controllers/`, which
registers them by file name as above, or register them into that application:

```js
// assets/bootstrap.js
import { startStimulusApp } from "@symfony/stimulus-bridge";
import { registerCremona } from "./vendor/cremona/index.js"; // the three files of packages/stimulus/src

export const app = startStimulusApp(
  require.context("@symfony/stimulus-bridge/lazy-controller-loader!./controllers", true, /\.[jt]sx?$/),
);
registerCremona(app); // cremona-visual + cremona-theme
```

```js
// assets/app.js
import "./bootstrap.js";
import "./styles/cremona/cremona.css";
```

Any other bundler works the same way: import `registerCremona` and pass it the
application you already have.

## Placing a template

A template fills the box it is given (`size-full`) and centres its content, so it
needs a **sized container**. Without a height it collapses or gets clipped. The
designed height of each variant is its `size` in `manifest.json`:

| `size` | height | class in cremona.css |
|---|---|---|
| `"xs"` | 12rem | `h-48` |
| `"sm"` | 16rem | `h-64` |
| `null` | 24rem | `h-96` |
| `"lg"` | 28rem | `h-[28rem]` |
| `"xl"` | 32rem | `h-[32rem]` |

Include templates with Twig's `source()`. It inserts the file as-is, without
parsing or escaping it, and templates contain no Twig syntax. A macro keeps the
wrapper in one place:

```twig
{# templates/cremona/_visual.html.twig #}
{% macro visual(path, size = null) %}
  {%- set heights = { xs: 'h-48', sm: 'h-64', lg: 'h-[28rem]', xl: 'h-[32rem]' } -%}
  <div class="{{ heights[size] ?? 'h-96' }}">
    {{- source('cremona/' ~ path ~ '.html') -}}
  </div>
{% endmacro %}
```

```twig
{% import 'cremona/_visual.html.twig' as cremona %}

<div class="grid gap-4 lg:grid-cols-2">
  {{ cremona.visual('metrics/stat-card/000-default') }}
  {{ cremona.visual('forms/login/000-default', 'lg') }}
</div>
```

Templates are the gallery's preview compositions, with their sample copy baked
in. Change the text in your copy of a file if needed, and keep the classes and
`data-anim-*` attributes.

Ids inside a template carry a per-template prefix (`cr-<category>-<file>-<index>-`),
so different templates never collide on a page.

The same template can be included several times. When `cremona-visual` connects,
it gives each copy its own ids, and does it again after a Turbo morph. It also
rewrites every reference to them: `for`, the `aria-*` id lists, `href="#…"`, and
`url(#…)` in SVG paint, clip paths, masks and styles. Labels, tabs and gradients
therefore resolve inside their own copy.

Without JavaScript, the copies share their ids. To make them unique on the server,
replace the prefix:
`source(…)|replace({'cr-metrics-stat-card-000-': 'cr-metrics-stat-card-000-b-'})`.

## cremona-visual

The template markup is the final state. Each element that moves during the
entrance carries the declarations of its **initial state**. The generator takes
them from the block's initial render, the state its golden locks:

- `data-anim-from="opacity:0;transform:translateY(8px)"`: where the animation
  starts;
- `data-anim-to="…"`: an explicit end, when the final value cannot be
  interpolated (a path draw, a clip reveal);
- `data-anim-path="1"`: dash values are fractions of the path length (motion's
  `pathLength`).

When it connects, the controller shows those initial states with paused Web
Animations. Then, depending on `trigger`, it plays every element back to the
markup, with a stagger by document order. Any property can be animated this way:
opacity, transforms, filters, clip paths, widths, stroke dashes, SVG geometry and
colours. An animation that ends leaves nothing on the element: no inline style,
no attribute change. So the end state is exactly the markup, and the markup is
React's static render, with prefixed ids and root-relative image paths.

| Value | Default | |
|---|---|---|
| `trigger` | `inView` | `inView`: once, when the visual enters the viewport. `inViewRepeat`: again on every entry (it resets when it leaves). `mount`: on connect, including markup inserted by Turbo Streams or Frames |
| `amount` | `0.5` | share of the visual that must be in view. For a visual taller than the viewport, half the viewport is enough |
| `timeout` | `2000` | ms after which a visual that stays only partly in view plays anyway |
| `duration` | `450` | ms per element |
| `stagger` | `70` | ms between two elements; long cascades are squeezed into 1.2 s |
| `delay` | `60` | ms before the first element |
| `easing` | soft ease-out | any CSS easing |
| `played` | `false` | `true` shows the final state without an entrance (the controller sets it for Turbo) |

```html
<div data-controller="cremona-visual" data-cremona-visual-trigger-value="mount" …>
```

Nothing stays hidden:

- **Without JavaScript**, or when the controller fails to load, the markup shows
  the final state.
- With **`prefers-reduced-motion: reduce`**, or without Web Animations or
  IntersectionObserver, the controller does nothing.
- **Before printing**, every visual jumps to its final state.
- A visual **partly in view** plays after `timeout`.
- **Turbo**: before Turbo caches a page, the visuals that played are marked
  `played`. A restored page, a preview, and the fresh page that replaces a
  preview therefore show them in their final state, with no replay. Visuals that
  had not played yet still play when they come into view. Disconnecting cancels
  running animations.

### What a template does not reproduce

The start and end states are React's. The timing is simpler: one duration and
easing for every element, and a stagger by document order. React uses springs,
per-element delays and `staggerChildren`.

Effects that need JavaScript at runtime stay React-only. `manifest.json` marks
those blocks with `"effects": "entrance-only"` and lists the missing kinds in
`reactOnly`:

| Kind | What is missing | Examples |
|---|---|---|
| `loops` | infinite motion loops, and CSS/SMIL loops that only run while animated | `ai/voice`, `geo/world-map`, `connections/flow` |
| `sequences` | timers, animation frames and `AnimatePresence` state cycles (typing, counters, cycling steps) | `ai/agent-flow`, `search/command-palette`, `keyboard/half` |
| `canvas` | content drawn on a canvas at runtime: the template shows an empty globe | `geo/globe` |
| `pointer` | hover replays and pointer-driven motion | `integrations/hub`, `branding/spotlight` |
| `interaction` | state changes on click or input | `components/tabs`, `components/accordion` |

The other blocks are `"effects": "full"`: they have no effect beyond their
entrance. A template of an entrance-only block still shows the block's final
state, the resting frame of its loops.

## cremona-theme

Mount it on `<html>`. It sets `dark`, `theme-<name>` and `color-scheme` on
`document.documentElement`.

```twig
<html lang="en"
  data-controller="cremona-theme"
  data-cremona-theme-appearance-value="{{ app.user.appearance ?? 'system' }}"
  data-cremona-theme-theme-value="default">
```

| Value | Default | |
|---|---|---|
| `appearance` | `system` | `light`, `dark` or `system` (follows `prefers-color-scheme`, live) |
| `theme` | `default` | a theme of `@cremona/tokens` (`themes.json`): `sakura`, `zen`, … |
| `storageKey` | `cremona-appearance` | localStorage key of the appearance; `""` turns storage off |
| `themeStorageKey` | `cremona-theme` | localStorage key of the theme; `""` turns storage off |

Changing a value at runtime applies it at once, for example after a Turbo morph,
a LiveComponent render or another controller's change. Precedence: a choice
stored by the actions wins over the rendered values. When the preference lives
server-side, for example in the user's profile, set both storage keys to `""` so
the rendered values always win.

Actions, with their params as data attributes:

```html
<button data-action="cremona-theme#toggle">Light / dark</button>
<button data-action="cremona-theme#setAppearance" data-cremona-theme-appearance-param="system">System</button>
<button data-action="cremona-theme#setTheme" data-cremona-theme-theme-param="sakura">Sakura</button>
```

Every change dispatches `cremona-theme:changed` on `<html>`, with
`{ appearance, theme, dark }` as its detail. Listen to it to save the choice on
the server:
`data-action="cremona-theme:changed@document->preferences#save"`.

## TypeScript

`@cremona/stimulus` ships type declarations: `registerCremona(application)`,
both controller classes with their typed values (`triggerValue`,
`appearanceValue: CremonaAppearance`…) and actions, and `CremonaThemeChange`,
the detail of `cremona-theme:changed`:

```ts
import type { CremonaThemeChange } from "@cremona/stimulus";

document.addEventListener("cremona-theme:changed", (event) => {
  const { appearance, theme, dark } = (event as CustomEvent<CremonaThemeChange>).detail;
});
```

## Before the first paint

The controllers run once the JavaScript has loaded, which comes after the first
paint. To avoid a flash of the light theme, and of final states that then jump
back to their initial state, put this partial first in `<head>`. It applies the
same theme as `cremona-theme`: the design system's
[anti-flash script](design-system.md#dark-mode), falling back to the values
rendered on `<html>`. It also hides visuals until `cremona-visual` connects: at
most 3 s, and never under reduced motion.

```twig
{# templates/cremona/_head.html.twig #}
<script{% if nonce is defined and nonce %} nonce="{{ nonce }}"{% endif %}>
  (function (root) {
    function read(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    var appearance = read("cremona-appearance") || root.getAttribute("data-cremona-theme-appearance-value") || "system";
    var theme = read("cremona-theme") || root.getAttribute("data-cremona-theme-theme-value") || "default";
    var dark = appearance === "dark" || (appearance === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    if (theme !== "default") root.classList.add("theme-" + theme);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("cremona-pending");
      setTimeout(function () {
        if (root.classList.contains("cremona-pending")) root.classList.replace("cremona-pending", "cremona-revealed");
      }, 3000);
    }
  })(document.documentElement);
</script>
```

```twig
<head>
  {{ include('cremona/_head.html.twig', { nonce: csp_nonce('script') }) }} {# or without the nonce #}
  …
```

Add the guard rule to your stylesheet:

```css
.cremona-pending [data-controller~="cremona-visual"] { visibility: hidden; }
```

When the first visuals connect, the controller removes `cremona-pending`. If the
3 s timeout passes first, the page shows the final states, and the visuals that
are already on screen stay that way instead of replaying. If you change the
storage keys of `cremona-theme`, change them in the partial too. Drop the
`cremona-pending` part if you do not want the guard.

## Content Security Policy

- Templates carry inline `style` attributes for their geometry: bar heights,
  positions, colours. Allow them with `style-src 'self' 'unsafe-inline'`, or at
  least `style-src-attr 'unsafe-inline'`.
- The controllers only use Web Animations and the CSSOM, which CSP does not
  restrict.
- The head partial is an inline script. Give it a nonce (NelmioSecurityBundle
  provides `csp_nonce('script')`) or a hash.

## Images

Templates that show pictures reference `/media/placeholders/*.jpg`, relative to
the site root. Copy `apps/gallery/public/media/placeholders/` (880 KB) into
`public/media/placeholders/`. To serve the images from elsewhere, rewrite the
prefix in the macro: `source(…)|replace({'"/media/': '"/assets/cremona/'})`.

## Regenerating

`pnpm generate:stimulus` (`node tools/generate-stimulus.mjs`) server-renders every
block through Vite's SSR loader. For each variant it:

1. checks the initial render against the golden;
2. pairs the elements of the final and initial renders by DOM path (elements
   whose structure differs stay static);
3. writes the templates and `manifest.json`;
4. deletes templates that no longer match a variant.

Any error stops the run with exit code 1 before anything is written. Never edit
the templates by hand: change the block, then regenerate.
