# @cremona/ui

Accessible, responsive React components on the
[Cremona](https://github.com/sdieunidou/cremona) design tokens: button, label,
field, input, textarea, select, checkbox, radio group, switch, dialog, popover,
tooltip, dropdown menu, toast, tabs, accordion, table, card, badge and alert,
built on Radix UI. Take them as
source with the shadcn CLI, or import them from npm.

```bash
# copy the source into your app
npx shadcn@latest registry add @cremona=https://raw.githubusercontent.com/sdieunidou/cremona/main/packages/ui/r/{name}.json
npx shadcn@latest add @cremona/button @cremona/field @cremona/input

# or import them
npm i @cremona/ui @cremona/tokens lucide-react
```

```tsx
import { Button } from "@cremona/ui/button";
import { Field, FieldDescription, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";

<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" autoComplete="email" />
  <FieldDescription>We never share it.</FieldDescription>
</Field>;
```

One entry per component, `@cremona/ui/<name>` (ESM and types; the ones that hold
state start with `"use client"`), and `@cremona/ui/utils` for `cn`. Load
`@cremona/tokens/css/cremona.css` for the tokens and the classes, or build with
your own Tailwind v4 (`@source` on this package's `dist`).

Every component uses semantic tokens only, names and describes its control for
assistive technology, keeps 24 px targets and a visible focus ring, and lays out
by container, not by viewport. Styles, the guarantees, `Field` and `Dialog`:
[docs/ui.md](https://github.com/sdieunidou/cremona/blob/main/docs/ui.md).

Peer dependencies: `react` and `react-dom` 19, `lucide-react`. MIT license.
