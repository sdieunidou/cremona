# @cremona/tokens

The [Cremona](https://github.com/sdieunidou/cremona) design system as CSS: 9
themes in light and dark on shadcn-style semantic tokens, the Inter Variable
font, and the stylesheets the blocks render with.

```bash
npm i @cremona/tokens
```

Pick the stylesheet that fits the page:

| The page | Load | |
|---|---|---|
| has no CSS of its own besides yours (a new React, Vite or Next.js app without Tailwind) | `css/cremona.css` | complete, no build |
| runs its own Tailwind CSS v4 build | `css/tailwind.css`, in that build | one build for your classes and the blocks' |
| has CSS of its own: Bootstrap, a theme, a legacy app | `css/cremona.scoped.css`, blocks inside a `.cremona` element | each side keeps its styles |

```ts
import "@cremona/tokens/css/cremona.css"; // once, in the app entry
```

```css
/* your Tailwind entry */
@import "tailwindcss";
@import "@cremona/tokens/css/tailwind.css";
@source "../node_modules/@cremona/blocks/dist";
```

```html
<link rel="stylesheet" href="/assets/cremona/cremona.scoped.css" />
<div class="cremona h-96"><!-- a block or a Stimulus template --></div>
```

| File | Content |
|---|---|
| `css/cremona.css` | Inter Variable (`@font-face`, the woff2 files sit next to it), the tokens, Tailwind's preflight and every utility class the blocks use |
| `css/cremona.scoped.css` | the same, applied to `.cremona` elements and their content only: tokens on the wrapper, utilities `!important` in `@layer cremona.utilities`, keyframes named `cremona-*` |
| `css/tailwind.css` | for a Tailwind v4 build: the fonts, the tokens, the theme mapping (`bg-card`, `rounded-3xl`, `font-medium` = 510…), the `dark` and `data-*` variants, the `no-scrollbar`, `paused` and `ring-1.5` utilities and the base styles — no `@import "tailwindcss"`, no `@source` |
| `css/themes.css` | the token blocks only (`:root`, `.dark`, `.theme-*`) |
| `css/fonts.css` | the `@font-face` rules only |
| `themes.json` | the themes' names and swatches |

- Dark mode is the `dark` class on `<html>`; a theme is a `theme-<name>` class
  on `<html>` (`claude-plus`, `light-green`, `zen`, `sakura`, `tiesen`,
  `deep-purple`, `indigo-clean`, `brutalism`). With `cremona.scoped.css` they
  can also go on the `.cremona` element.
- Tokens are CSS custom properties — `var(--background)`, `var(--card)`,
  `var(--muted-foreground)`, `var(--border)`, `var(--radius)`, the status
  tokens `var(--success)`, `var(--warning)`, `var(--info)`… — for your own CSS.
- `cremona.scoped.css` also works inside a shadow root: put the `.cremona`
  element and the stylesheet in it, and load `css/fonts.css` in the page.
- `cremona.css` and `cremona.scoped.css` hold the classes the blocks use, not a
  full Tailwind build: classes of your own need your own CSS, or your own
  Tailwind build with `tailwind.css`. Never load `cremona.css` next to a
  Tailwind build: two utility sets on one page override each other.

Docs: [getting started](https://github.com/sdieunidou/cremona/blob/main/docs/getting-started.md),
[design system](https://github.com/sdieunidou/cremona/blob/main/docs/design-system.md#css-distribution)
(the three stylesheets and how they coexist with other CSS),
[Stimulus](https://github.com/sdieunidou/cremona/blob/main/docs/stimulus.md).
MIT license; Inter is distributed under the SIL Open Font License.
