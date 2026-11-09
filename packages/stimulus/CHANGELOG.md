# @cremona/stimulus

## 0.3.0

### Minor Changes

- 795fdc5: Combobox: a text input that filters a list of options as the user types (case and accents ignored), with the WAI-ARIA combobox pattern, labelled, described and marked invalid by its `Field`, and submitted with a form. `@cremona/ui/combobox` and the `@cremona/combobox` registry item for React; the `cremona-combobox` Stimulus controller turns a server-rendered `<select>` into the same combobox. `cremona.css` and `cremona.scoped.css` compile their classes, and the MCP server lists the component and returns the controller (`get_controller("combobox")`).

### Patch Changes

- 40248a0: Empty state: the illustration shrinks with a container narrower than 20rem instead of being cropped by the frame (`w-full max-w-80` replaces `w-80 shrink-0`), in React and in the Stimulus templates.

## 0.2.1

No changes in this release.

## 0.2.0

### Patch Changes

- 88d0a60: `security/shield`: the four satellite badges (lock, key, eye, fingerprint) are larger, 40 px with 20 px icons instead of 32 px with 16 px, and their centres now sit on the outer dashed circle; their entrance still starts from the centre of the shield (±78 px). The Stimulus templates, the compiled stylesheets and the MCP snapshot follow.
