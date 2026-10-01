# Accessibility

What the blocks guarantee, and what the host app adds.

## Blocks are illustrations to assistive technology

- Every block's root is `aria-hidden="true"`: its text, images and controls do
  not exist for a screen reader. Put a text equivalent next to each block you
  show as-is — visually hidden text, a caption, or a table of the same data
  ([example](react.md#use-it-as-is-for-illustration)).
- The `states/*` screens are the exception: with `title`, `description` or
  `actions`, that copy is a real heading, text and links or buttons, and only
  the illustration stays hidden ([States](react.md#states)).
- Inside the hidden root, the controls of `components/*` keep their keyboard
  behaviour so that the gallery can show it; a keyboard user can reach a
  control that a screen reader does not announce. The kits (forms, ecommerce,
  mobile, notices) and the other blocks keep their controls out of the tab
  order (`noFocus`, `tabIndex={-1}`), except the `mailto:` links they draw
  around e-mail addresses (`data/query`, `data/table`, `email/compose`).
- For anything interactive, derive a component from the block's source
  ([recipe](react.md#derive-it-for-anything-interactive)): remove the hidden
  root and the `noFocus` spreads, then add handlers, `ref` and state. The
  markup underneath is semantic: buttons, labelled inputs with
  `aria-describedby` and `aria-invalid`, real `form` elements in the forms
  kit, roles and `aria-*` wiring in the components, ids from `useId`.

## Motion

- Wrap the React app in `<MotionConfig reducedMotion="user">` (from
  `motion/react`): for users who ask for reduced motion, entrance transforms
  jump to their end state and fades remain.
- Loops — infinite transitions, timers, SMIL, CSS `animate-*` — run only while
  `useLoopActive` allows it: the block is in view, the tab is visible and the
  user does not ask for reduced motion. A paused loop shows a resting frame.
  This needs no setup.
- Nothing depends on an animation: `animated={false}`, the default, renders
  the final state at once.
- Stimulus: `cremona-visual` plays nothing under
  `prefers-reduced-motion: reduce`, and a template without JavaScript shows
  its final state ([stimulus.md](stimulus.md#cremona-visual)).

## Contrast

The tokens hold a contrast budget, tested in every theme, light and dark: text
at 4.5:1 on its surfaces, status colours on their own tints, focus rings at
3:1, chart series at 3:1 on cards and apart from each other under simulated
colour-vision deficiencies. The budget, and what is outside it on purpose
(`text-primary`, borders, opacity-modified text), are in
[design-system.md](design-system.md#contrast-guarantees). Build your own markup
on the same tokens.

## Focus

Components and kits draw keyboard focus with one recipe:
`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`,
inset with `-outline-offset-2` on list and menu items. `--ring` reaches 3:1
against the background and the card in every theme. Keep the recipe when you
derive a component, and do not put `outline-none` on the same element: in
Tailwind v4 it cancels the `focus-visible:outline-2`.

## The host's checklist

1. A text equivalent next to every block shown as an illustration.
2. `MotionConfig reducedMotion="user"` around the React app.
3. Derived components, not blocks, for anything a user operates.
4. The page's own structure: `lang`, the title, headings and landmarks.
5. With several React roots on one page, a distinct `identifierPrefix` per
   root, so that label and ARIA ids stay unique
   ([SSR / RSC notes](react.md#ssr--rsc-notes)).

The gallery's own chrome is checked with axe in light and dark on every pull
request; its block previews are excluded, being illustrations.
