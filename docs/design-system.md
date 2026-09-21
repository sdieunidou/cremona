# Design system

## Tokens

Full shadcn-style semantic set (all in oklch), per theme × mode:

`--background --foreground --card --card-foreground --popover --popover-foreground
--primary --primary-foreground --secondary --secondary-foreground --muted
--muted-foreground --accent --accent-foreground --destructive --border --input
--ring --chart-1..5 --radius --sidebar --sidebar-foreground --sidebar-primary
--sidebar-primary-foreground --sidebar-accent --sidebar-accent-foreground
--sidebar-border --sidebar-ring`

## Themes

| Theme | Class | Personality |
|---|---|---|
| default | — | neutral light / warm dark |
| claude-plus | `.theme-claude-plus` | warm terracotta + violet |
| light-green | `.theme-light-green` | fresh green |
| zen | `.theme-zen` | warm amber |
| sakura | `.theme-sakura` | pink |
| tiesen | `.theme-tiesen` | indigo |
| deep-purple | `.theme-deep-purple` | purple |
| indigo-clean | `.theme-indigo-clean` | clean indigo |
| brutalism | `.theme-brutalism` | raw hsl contrast |

## Dark mode

Class-based: `.dark` on `<html>`. **The default dark palette is NOT a gray
inversion** — it is the warm "Claude-like" scheme
(`--background: oklch(26.79% .0036 106.643)`,
`--primary: oklch(67.24% .1308 38.7559)`). Respect that when designing new
blocks: don't assume `dark:` = "dimmed".

Anti-flash: inline script in `<head>` reading `localStorage` (see
`apps/gallery/index.html`, or the `cremona-theme` controller for Stimulus apps).

## Fonts

Inter Variable (`--font-sans`), weights 100–900, woff2 subsets shipped in
`packages/tokens/css/`. No other font families are used.

## Keyframes & custom utilities

`tw-shimmer` (text shine), `caret-blink`, `scroll-fade-reveal-*` (masked reveal
at scroll edges), `enter/exit` (tw-animate-css variables). Tailwind v4 native
utilities used by blocks: `mask-t-from-*`, `mask-b-from-*`, `bg-linear-to-*`,
`bg-size-[…]`, fractional spacing (`py-2.25`), `rounded-4xl`.

## CSS distribution

| File | Use |
|---|---|
| `@cremona/tokens/css/cremona.css` | complete stylesheet: fonts + tokens + ALL utilities the blocks use. Include once; zero build required. |
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
