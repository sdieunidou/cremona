---
"@cremona/ui": patch
---

Keyboard focus is visible again on every component. Sixteen interactive elements carried `outline-none` next to the focus recipe, and in Tailwind v4 `outline-none` sets `--tw-outline-style: none`, which `focus-visible:outline-2` then draws: no ring ever showed. A test now refuses the pair on one element.
