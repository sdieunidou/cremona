# @cremona/ui

## 0.3.0

### Minor Changes

- 795fdc5: Combobox: a text input that filters a list of options as the user types (case and accents ignored), with the WAI-ARIA combobox pattern, labelled, described and marked invalid by its `Field`, and submitted with a form. `@cremona/ui/combobox` and the `@cremona/combobox` registry item for React; the `cremona-combobox` Stimulus controller turns a server-rendered `<select>` into the same combobox. `cremona.css` and `cremona.scoped.css` compile their classes, and the MCP server lists the component and returns the controller (`get_controller("combobox")`).

## 0.2.1

No changes in this release.

## 0.2.0

### Patch Changes

- 246b675: Keyboard focus is visible again on every component. Sixteen interactive elements carried `outline-none` next to the focus recipe, and in Tailwind v4 `outline-none` sets `--tw-outline-style: none`, which `focus-visible:outline-2` then draws: no ring ever showed. A test now refuses the pair on one element.
