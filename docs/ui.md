# UI components

`@cremona/ui` holds the components an app is made of — the controls, fields and
dialogs a user operates — where [blocks](react.md) only illustrate. They are
accessible, responsive and styled with the same tokens as the blocks, so they
follow the theme and the mode of the page.

| Component | What it is |
|---|---|
| `button` | six variants, five sizes, `asChild` to style a link |
| `label` | the text of a control |
| `field` | `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldContent`, `FieldLabel`, `FieldDescription`, `FieldError`: the label, the control, its help and its error wired together |
| `input` | a text input |
| `checkbox` | checked, unchecked, indeterminate |
| `switch` | on / off |
| `dialog` | a modal dialog |

They are built on Radix UI (the `radix-ui` package), `class-variance-authority`
and `tailwind-merge`, whatever style a shadcn project's `components.json` names.
The MCP tools `list_components` and `get_component` return the same list, the
install lines and the sources ([mcp.md](mcp.md)).

## Take them

Two ways, the same components.

**Copy the source with the shadcn CLI.** The registry lives in
`packages/ui/r/`:

```bash
# once per project: records the @cremona namespace in components.json
npx shadcn@latest registry add @cremona=https://raw.githubusercontent.com/sdieunidou/cremona/main/packages/ui/r/{name}.json
npx shadcn@latest add @cremona/button @cremona/field @cremona/input
```

`add` writes the sources to `components/ui/`, installs the npm packages they
import and the other registry items they need: `field` brings `label`, and
`button` brings `tokens`, which adds the status tokens (`success`, `warning`,
`info`, `destructive-foreground`) to your CSS, in light and dark. The files are
yours to edit.

**Import them from npm.**

```bash
npm i @cremona/ui @cremona/tokens lucide-react react react-dom
```

```tsx
import { Button } from "@cremona/ui/button";
```

One entry per component (ESM and types; the ones that hold state start with
`"use client"`), and `@cremona/ui/utils` for `cn`.

## Styles

- **No CSS framework** — `@cremona/tokens/css/cremona.css` holds every class
  the components use, and the `animate-in` / `fade-in-0` / `zoom-in-95`
  utilities of `tw-animate-css` that the dialog animates with.
- **Your own Tailwind v4 build** — import `@cremona/tokens/css/tailwind.css`
  and, from npm, add `@source "../node_modules/@cremona/ui/dist";` so that
  Tailwind sees the classes; with the shadcn CLI your own `components/ui` is
  scanned already. The dialog animates with `tw-animate-css`
  (`npm i -D tw-animate-css`, `@import "tw-animate-css";`, which `shadcn init`
  does); without it the dialog works and does not animate.
- **A page with CSS of its own** — load `cremona.scoped.css` and put the
  components inside a `.cremona` element. A dialog renders in a portal at the
  end of `<body>`, outside that element: give `DialogContent` a `container`
  inside it.

## What every component guarantees

- **Semantic tokens only** — `bg-primary`, `text-muted-foreground`,
  `border-destructive`: no palette colour and no solid white or black; the
  dialog's scrim is a translucent black (`test/tokens-only.test.ts`).
- **Accessible names and states** — a control is labelled by its `Field`,
  described by its help and error, `aria-invalid` when in error; the dialog has
  a title, a description, a trapped and returned focus, Escape, and hides the
  page from assistive technology. Each component has behaviour tests (Testing
  Library) and an axe-core check.
- **Targets of 24 × 24 px at least** (WCAG 2.5.8) — a checkbox and a switch
  extend their hit area past the visible box.
- **One focus recipe** — `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`,
  the one of the blocks ([accessibility.md](accessibility.md#focus)).
- **Responsive by container** — a `responsive` field is vertical in a narrow
  `FieldGroup` and horizontal once the group is wide (a container query, not
  the viewport); a dialog keeps a 1 rem margin on each side and scrolls when it
  is taller than the screen; a text input is 16 px on small screens (a smaller
  size makes iOS zoom in on focus) and 14 px from `md`.
- **Motion that can be turned off** — every enter and exit animation is
  `motion-safe:`.

## Forms: `Field`

```tsx
<FieldGroup>
  <Field invalid={!!error}>
    <FieldLabel>Email</FieldLabel>
    <Input type="email" autoComplete="email" />
    <FieldDescription>We never share it.</FieldDescription>
    <FieldError>{error}</FieldError>
  </Field>
  <Field orientation="horizontal">
    <Checkbox />
    <FieldLabel>Remember me</FieldLabel>
  </Field>
</FieldGroup>
```

A `Field` generates the ids (`useId`) and wires them: `FieldLabel` points at the
control, the control is described by `FieldDescription` and `FieldError` while
they are on screen, `invalid` sets `aria-invalid` and turns the text
destructive, `disabled` reaches the control. `FieldError` is a `role="alert"`
and takes either children or the `errors` of a form library (each message once).
`Input`, `Checkbox` and `Switch` read all of it through `useFieldControl`; a
control of your own calls `useFieldControl(props)` and spreads the result after
its props. A prop a control receives itself wins: pass an `id` to a control
inside a `Field` only together with the same `htmlFor` on its `FieldLabel`.

## Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Delete</Button>
  </DialogTrigger>
  <DialogContent closeLabel="Close">
    <DialogHeader>
      <DialogTitle>Delete project</DialogTitle>
      <DialogDescription>This cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

`DialogTitle` is the dialog's accessible name: always render one (wrap it in
`sr-only` to hide it). `closeLabel` names the close button in your language;
`showCloseButton={false}` removes it.

## Components or blocks?

A component is what you ship for a control. The blocks of `components/*`,
`forms/*` and the other real-size categories are previews of such UI — an
`aria-hidden` root, content props, no handlers — to illustrate a page or to
derive from ([react.md](react.md#derive-it-for-anything-interactive)). When a
component exists, use it instead of deriving a block.

## Adding a component

1. `packages/ui/src/<name>.tsx`: relative imports between components and from
   `./utils.js` (the registry generator rewrites them to `@/components/ui/…`
   and `@/lib/utils`), no `@cremona/*` import, a JSDoc comment on every prop,
   `"use client"` when it holds state, semantic tokens only.
2. An item in `packages/ui/registry.json`: its `dependencies` are exactly the
   npm packages its files import besides React, `registryDependencies` the other
   items it needs (`@cremona/<name>`).
3. Tests in `packages/ui/test/`: the behaviour a user relies on, and an
   `a11yViolations()` check.
4. `pnpm generate:registry` writes `packages/ui/r/`; commit it. `pnpm check`
   (`check:registry`) and CI fail on a stale registry.
