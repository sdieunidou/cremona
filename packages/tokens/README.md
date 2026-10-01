# @cremona/tokens

The [Cremona](https://github.com/sdieunidou/cremona) design system as CSS: 9
themes in light and dark on shadcn-style semantic tokens, the Inter Variable
font, and the stylesheet the blocks render with.

```bash
npm i @cremona/tokens
```

```ts
import "@cremona/tokens/css/cremona.css"; // once, in the app entry
```

| File | Content |
|---|---|
| `css/cremona.css` | the complete stylesheet: Inter Variable (`@font-face`, the woff2 files sit next to it), the tokens, Tailwind's preflight and every utility class the Cremona blocks use — no build needed |
| `css/themes.css` | the token blocks only (`:root`, `.dark`, `.theme-*`) |
| `themes.json` | the themes' names and swatches |

- Dark mode is the `dark` class on `<html>`; a theme is a `theme-<name>` class
  on `<html>` (`claude-plus`, `light-green`, `zen`, `sakura`, `tiesen`,
  `deep-purple`, `indigo-clean`, `brutalism`).
- Tokens are CSS custom properties — `var(--background)`, `var(--card)`,
  `var(--muted-foreground)`, `var(--border)`, `var(--radius)`, the status
  tokens `var(--success)`, `var(--warning)`, `var(--info)`… — for your own CSS.
- `cremona.css` holds the classes the blocks use, not a full Tailwind build:
  classes of your own need your own CSS, or your own Tailwind build set up as in
  [Your own CSS, or Tailwind](https://github.com/sdieunidou/cremona/blob/main/docs/getting-started.md#9-your-own-css-or-tailwind).

Docs: [design system](https://github.com/sdieunidou/cremona/blob/main/docs/design-system.md),
[getting started](https://github.com/sdieunidou/cremona/blob/main/docs/getting-started.md).
MIT license; Inter is distributed under the SIL Open Font License.
