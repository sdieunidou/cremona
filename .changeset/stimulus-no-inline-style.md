---
"@cremona/stimulus": minor
"@cremona/tokens": minor
"@cremona/mcp": minor
---

Stimulus templates carry no `style` attribute: every inline declaration is a Tailwind arbitrary-property class (`[width:416px]`), so a host can serve them under `style-src 'self'` with no `'unsafe-inline'`. The rendering is unchanged. `cremona.css` and `cremona.scoped.css` now compile those classes; a host with its own Tailwind build must scan the templates it copies (`@source`).
