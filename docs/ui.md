# UI components

`@cremona/ui` holds the components an app is made of — the controls, fields,
overlays and data displays a user operates or reads — where [blocks](react.md)
only illustrate. They are accessible, responsive and styled with the same tokens
as the blocks, so they follow the theme and the mode of the page. The gallery
shows each of them live, with its code (`/components`).

| Component | What it is |
|---|---|
| `button` | six variants, five sizes, `asChild` to style a link |
| `label` | the text of a control |
| `field` | `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldContent`, `FieldLabel`, `FieldDescription`, `FieldError`: the label, the control, its help and its error wired together |
| `input`, `textarea` | text inputs, labelled, described and marked invalid by their `Field` |
| `checkbox`, `radio-group`, `switch` | checked, unchecked, indeterminate; one choice among several; on / off |
| `select` | a custom select: keyboard and type-ahead, groups, submits with a form |
| `badge`, `alert` | a short label; a message in the page (`destructive` and `warning` are announced at once) |
| `card`, `table` | a surface with header, content and footer; a data table that scrolls sideways in its own region |
| `tabs`, `accordion` | tabs, horizontal or vertical; sections that open and close |
| `dialog`, `popover`, `tooltip`, `dropdown-menu` | a modal; a panel by its trigger; a hint; a menu with checkboxes, radios and submenus |
| `toast` | `toast()` and one `Toaster`: announced, paused on hover and focus, kept while an error is shown |

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
`button`, `badge`, `alert` and `toast` bring `tokens`, which adds the status
tokens (`success`, `warning`, `info`, `destructive-foreground`) to your CSS, in
light and dark. The files are yours to edit.

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
  the components use, and the `animate-in` / `fade-in-0` / `zoom-in-95` /
  `accordion-down` utilities of `tw-animate-css` that the overlays and the
  accordion animate with.
- **Your own Tailwind v4 build** — import `@cremona/tokens/css/tailwind.css`
  and, from npm, add `@source "../node_modules/@cremona/ui/dist";` so that
  Tailwind sees the classes; with the shadcn CLI your own `components/ui` is
  scanned already. The animations come from `tw-animate-css`
  (`npm i -D tw-animate-css`, `@import "tw-animate-css";`, which `shadcn init`
  does); without it everything works and nothing animates.
- **A page with CSS of its own** — load `cremona.scoped.css` and put the
  components inside a `.cremona` element. The dialog, popover, tooltip, select
  and menus render in a portal at the end of `<body>`, outside that element:
  give their content a `container` inside it (`DialogContent`,
  `PopoverContent`, `TooltipContent`, `SelectContent`, `DropdownMenuContent`
  and `DropdownMenuSubContent`). `Toaster` renders where you mount it: mount it
  inside the element.

## What every component guarantees

- **Semantic tokens only** — `bg-primary`, `text-muted-foreground`,
  `border-destructive`: no palette colour and no solid white or black; the
  dialog's scrim is a translucent black (`test/tokens-only.test.ts`). Status
  colours are used only in the combinations of the contrast budget
  ([design-system.md](design-system.md#contrast-guarantees)).
- **Accessible names and states** — a control is labelled by its `Field`,
  described by its help and error, `aria-invalid` when in error; a dialog has a
  title, a description, a trapped and returned focus, Escape, and hides the page
  from assistive technology; menus, tabs, radios and accordions answer the arrow
  keys, Home and End. Each component has behaviour tests (Testing Library) and
  an axe-core check, and the gallery's pages are checked with axe in a real
  browser, in light and dark, overlays open included.
- **Targets of 24 × 24 px at least** (WCAG 2.5.8) — a checkbox, a radio and a
  switch extend their hit area past the visible box.
- **One focus recipe** — `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`,
  the one of the blocks ([accessibility.md](accessibility.md#focus)), inset on
  the items of a list or a menu.
- **Responsive by container** — a `responsive` field is vertical in a narrow
  `FieldGroup` and horizontal once the group is wide (a container query, not
  the viewport); a card's action moves beside its title the same way; a dialog
  keeps a 1 rem margin on each side and scrolls when it is taller than the
  screen; a popover, a select list and a menu never outgrow the room left on
  their side of the trigger; a table and a list of tabs scroll sideways instead
  of widening the page; a text input and a select are 16 px on small screens (a
  smaller size makes iOS zoom in on focus) and 14 px from `md`.
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
`Input`, `Textarea`, `Checkbox`, `RadioGroupItem`, `Switch` and `SelectTrigger`
read all of it through `useFieldControl`; a control of your own calls
`useFieldControl(props)` and spreads the result after its props. A prop a
control receives itself wins: pass an `id` to a control inside a `Field` only
together with the same `htmlFor` on its `FieldLabel`.

A group of radio buttons is named by a `FieldSet` and its `FieldLegend` (or by
`aria-label` / `aria-labelledby` on the `RadioGroup`); each `RadioGroupItem` sits
in its own horizontal `Field` with a `FieldLabel`.

## Dialog, popover, tooltip, menu

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

- A `Popover` is a non-modal panel that holds any content; focus moves into it
  and back to the trigger. Its content has the role `dialog`: name it with
  `aria-label` or `aria-labelledby`. When the task needs the user's whole
  attention, use a `Dialog`.
- A `Tooltip` hints at a control on hover and keyboard focus, hides with Escape
  and never shows on a touch screen: never put anything a user needs only in a
  tooltip. A `TooltipProvider` shares the delays of the tooltips it wraps; each
  `Tooltip` brings its own otherwise.
- A `DropdownMenu` is a menu of actions: Enter, Space or the down arrow opens
  it, the arrow keys, Home, End and typing move through the items, `variant="destructive"`
  marks an item that deletes. To choose a value that a form submits, use a
  `Select`, which sends its `name` and value like a native select.

## Toast

```tsx
// once, near the root of the app
<Toaster />;

// anywhere
toast({ title: "Saved", description: "Your draft is up to date." });
toast({ title: "Payment failed", variant: "destructive" });
const t = toast({ title: "Uploading…" });
t.update({ title: "Uploaded", variant: "success" });
toast.dismiss();
```

A toast is read out by screen readers when it appears (`destructive` and
`warning` at once, the rest politely), waits while the pointer or focus is on it,
closes with Escape or its button, and can be reached from anywhere with F8. It
closes after 5 seconds, except a `destructive` toast and one with an `action`,
which stay until closed: an error or a choice must not vanish before it is read.
Three show at a time. `label` and `closeLabel` of `Toaster` translate its region
and its close buttons.

## Table

`Table` scrolls sideways inside its own region instead of widening the page, and
that region takes keyboard focus only while it overflows, so a keyboard user can
scroll it and a table that fits adds no tab stop. A `TableCaption` names the
region for assistive technology, or pass `label`. A header cell is a column
header (`scope="col"`); use `scope="row"` for a row header.

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
   `"use client"` when it holds state, semantic tokens only, a `container` prop
   on anything that renders in a portal.
2. An item in `packages/ui/registry.json`: its `dependencies` are exactly the
   npm packages its files import besides React, `registryDependencies` the other
   items it needs (`@cremona/<name>`).
3. Tests in `packages/ui/test/`: the behaviour a user relies on, and an
   `a11yViolations()` check.
4. A demo file `apps/gallery/src/demos/<name>.tsx` (its default export and each
   named export are one example of the component's page) and the browser checks
   that matter in `apps/gallery/e2e/components.spec.ts`.
5. `pnpm generate:registry` writes `packages/ui/r/`; commit it. `pnpm check`
   (`check:registry`) and CI fail on a stale registry.
