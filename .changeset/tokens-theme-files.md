---
"@cremona/tokens": minor
"@cremona/mcp": patch
---

Breaking for Tailwind hosts: `css/tailwind.css` now brings the default theme only (`:root` and `.dark`), not the eight others. Each theme is a file of its own, `css/themes/<name>.css` (`default.css`, `claude-plus.css`, `zen.css`…), exported as `@cremona/tokens/css/themes/<name>.css`. A host build of `tailwind.css` shrinks by about half (39.7 KB to 19.6 KB minified for a few classes).

Migration: a Tailwind host that uses a theme other than the default (a `theme-<name>` class on `<html>`, or the `cremona-theme` controller switching themes at runtime) imports the file of each theme it offers, right after `tailwind.css`:

```css
@import "tailwindcss";
@import "@cremona/tokens/css/tailwind.css";
@import "@cremona/tokens/css/themes/sakura.css";
@source "../node_modules/@cremona/blocks/dist";
```

Without it, the theme renders with the default tokens. Nothing changes for `css/cremona.css`, `css/cremona.scoped.css` and `css/themes.css`, which keep every theme.

The MCP server says so: `get_themes` and `get_theme` give each theme's stylesheet, `get_css` `tailwind` gives the theme imports and the setup without `node_modules` (copy the token files, keep the `.woff2` files next to the compiled entry stylesheet, since the Tailwind CLI does not rebase `url()`), and `get_controller` `theme` notes which stylesheets hold every theme.
