# Design system

## Tokens

Full shadcn-style semantic set (all in oklch), per theme × mode:

`--background --foreground --card --card-foreground --popover --popover-foreground
--primary --primary-foreground --secondary --secondary-foreground --muted
--muted-foreground --accent --accent-foreground --destructive --border --input
--ring --chart-1..5 --radius --sidebar --sidebar-foreground --sidebar-primary
--sidebar-primary-foreground --sidebar-accent --sidebar-accent-foreground
--sidebar-border --sidebar-ring`

Status tokens, defined in `:root` and `.dark` and inherited by every theme (a
theme may override them): `--success --warning --info` with their
`-foreground`, and `--destructive-foreground`. Use them for status text
(`text-success`), tinted surfaces (`bg-warning/10`) and solid badges
(`bg-info text-info-foreground`) instead of palette colors: they follow the
theme and meet WCAG AA (4.5:1) as text on the background and as the foreground
on their own color.

## Themes

| Theme | Class | Personality |
|---|---|---|
| default | — | neutral light / neutral dark |
| claude-plus | `.theme-claude-plus` | warm terracotta + violet |
| light-green | `.theme-light-green` | fresh green |
| zen | `.theme-zen` | warm amber |
| sakura | `.theme-sakura` | pink |
| tiesen | `.theme-tiesen` | indigo |
| deep-purple | `.theme-deep-purple` | purple |
| indigo-clean | `.theme-indigo-clean` | clean indigo |
| brutalism | `.theme-brutalism` | raw hsl contrast |

## Dark mode

Class-based: `.dark` on `<html>`. The default theme is neutral in both modes
(dark: `--background: oklch(14.5% 0 0)`, `--primary: oklch(92.2% 0 0)`); the
warm "Claude-like" dark is `.theme-claude-plus`. Themes change hue, lightness
and radius in dark mode, so check new blocks in several themes: don't assume
`dark:` = "dimmed".

Anti-flash: inline script in `<head>` reading `localStorage` (see
`apps/gallery/index.html`, or the `cremona-theme` controller for Stimulus apps).

## Fonts

Inter Variable (`--font-sans`), weights 100–900, woff2 subsets shipped in
`packages/tokens/css/`. No other font families are used.

## Keyframes, variants & custom utilities

`cremona.css` holds what the blocks use: the `spin`, `ping` and `pulse`
keyframes (tw-animate-css `enter`/`exit` are generated as soon as a block uses
`animate-in`/`animate-out`), the `no-scrollbar` utility, and shadcn's state
variants — `data-open:`, `data-closed:`, `data-checked:`, `data-unchecked:`,
`data-active:`, `data-disabled:` match `data-state="…"` or the boolean data
attribute; `data-selected:`, `data-horizontal:`, `data-vertical:` match
`data-selected="true"` and `data-orientation`. Tailwind v4 native utilities
used by blocks: `mask-t-from-*`, `mask-b-from-*`, `bg-linear-to-*`,
`bg-size-[…]`, fractional spacing (`py-2.25`), `rounded-4xl`.

## CSS distribution

| File | Use |
|---|---|
| `@cremona/tokens/css/cremona.css` | complete stylesheet: fonts + tokens + every utility the blocks use. Include once; no build on the host. It holds the blocks' classes only: classes of your own need your own CSS or Tailwind build. |
| `@cremona/tokens/css/themes.css` | semantic tokens only — for hosts compiling their own Tailwind v4 styles. |

## Preview frame system

```
frame    group/preview relative flex flex-col overflow-hidden rounded-lg
         border border-border/50 bg-muted/20 dark:bg-muted/15
stage    flex grow items-center gap-2 + h-48|h-64|h-96|h-[28rem]|h-[32rem]
footer   bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground
grid     grid grid-cols-1 gap-2 lg:grid-cols-2 (+ xl:grid-cols-3)
```

Inside the frame, visuals render a scene:
`relative isolate flex size-full items-center justify-center overflow-hidden px-2`
containing the card wrapper (`max-w-72|80 rounded-3xl border bg-muted/75 p-1.5`),
the rainbow glow (`opacity-60 blur-sm`), the bottom veil
(`bg-background/75 mask-t-from-50%`), and ambient glows + particle fields.

## Scales

- **Real-size components** (`components/*`, parts of `ecommerce/forms/mobile/notices`)
  render full-size UI centered in the stage — usable directly in an app.
- **Miniature mocks** (`sections/*`, `layouts/*`, some ecommerce) are scaled-down
  wireframes of whole pages, in the POC product-illustration style.

## Motion conventions

- Card entrance: `opacity 0→1, y 8→0, duration .35 easeOut` (or isometric
  `rotateX(45deg) rotateZ(-45deg)`, duration .5).
- Icon chip: spring `stiffness 420, damping 14, delay .2`.
- Pills/values: spring `360/18` or `y 8` easeOut with `.25–.5` delays.
- Glow: `opacity 0→.6, scaleX .6→1, duration .5, delay .5`.
- Stagger groups: `staggerChildren .07–.15, delayChildren .2–.25`.

`@cremona/core` exports the shared constants (`RAINBOW_GRADIENT`, `ISO_*`,
`FRAME_HEIGHTS`, `gridCols`).
