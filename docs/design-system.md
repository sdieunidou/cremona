# Design system

## Tokens

Full shadcn-style semantic set (all in oklch), per theme × mode:

`--background --foreground --card --card-foreground --popover --popover-foreground
--primary --primary-foreground --secondary --secondary-foreground --muted
--muted-foreground --accent --accent-foreground --destructive --border --input
--ring --chart-1..5 --radius --sidebar --sidebar-foreground --sidebar-primary
--sidebar-primary-foreground --sidebar-accent --sidebar-accent-foreground
--sidebar-border --sidebar-ring`

Status tokens, defined in `:root` and `.dark` and inherited by every theme
(claude-plus and zen override some of them for their warm cards):
`--success --warning --info` with their `-foreground`, and
`--destructive-foreground`. Use them for status text (`text-success`), tinted
surfaces (`bg-warning/10 text-warning`) and solid badges
(`bg-info text-info-foreground`) instead of palette colors: they follow the
theme and meet WCAG AA (4.5:1) as text on the background, on the card and on
their own `/10` tint, and as the foreground on their own color.

A solid destructive surface takes `text-destructive-foreground`, never
`text-white`: in dark mode `--destructive` is a light red, legible as text on
dark backgrounds, and its foreground is dark.

## Themes

| Theme | Class | Radius | Personality |
|---|---|---|---|
| default | — | `.625rem` | neutral light / neutral dark, grayscale charts |
| claude-plus | `.theme-claude-plus` | `1rem` | warm terracotta and violet on ivory, warm dark |
| light-green | `.theme-light-green` | `1rem` | fresh green with dark-green text on it, slate neutrals; lime in dark |
| zen | `.theme-zen` | `.5rem` | warm paper and stone, near-black primary, coral accent |
| sakura | `.theme-sakura` | `.5rem` | cherry-blossom pink with wine text on it, soft browns |
| tiesen | `.theme-tiesen` | `.5rem` | indigo on white, pure black in dark |
| deep-purple | `.theme-deep-purple` | `1rem` | saturated purple |
| indigo-clean | `.theme-indigo-clean` | `.5rem` | clean indigo, violet in dark |
| brutalism | `.theme-brutalism` | `0px` | raw black, white, red and yellow, hard borders |

## Charts

`--chart-1..5` form a categorical palette in every theme × mode: each series
reaches 3:1 against `--card`, any two series stay clearly apart (also under
simulated red–green color blindness), and `chart-1..3` differ from
`--primary`. Series keep their theme's hue families, so the palettes are not
interchangeable between themes: pick series by index (`chart-1` first, and for
a single series), never by expected hue.

## Dark mode

Class-based: `.dark` on `<html>`. `.dark` also works on an inner element: that
subtree renders with the page theme's dark tokens and a dark `color-scheme`
(a dark phone mockup inside a light page, for instance). The default theme is
neutral in both modes (dark: `--background: oklch(14.5% 0 0)`,
`--primary: oklch(92.2% 0 0)`); the warm "Claude-like" dark is
`.theme-claude-plus`. Themes change hue and
lightness in dark mode, so check new blocks in several themes: don't assume
`dark:` = "dimmed". `cremona.css` sets `color-scheme: light` on `:root` and
`color-scheme: dark` on `.dark`, so native controls (checkboxes, date and range
inputs), scrollbars and autofill follow the mode (with `themes.css` alone, add
the same two rules to your base styles).

Anti-flash: toggle the classes before the first paint with an inline script
in `<head>`, placed before the stylesheets. It reads the same `localStorage`
keys as the gallery and the `cremona-theme` Stimulus controller (which keeps
the classes in sync afterwards, but connects too late to prevent the flash):

```html
<script>
  (function () {
    var root = document.documentElement;
    var appearance = "system"; // "light" | "dark" | "system"
    var theme = "default"; // a themes.json value
    try {
      appearance = localStorage.getItem("cremona-appearance") || appearance;
      theme = localStorage.getItem("cremona-theme") || theme;
    } catch (e) {
      // storage blocked: keep the defaults
    }
    var dark =
      appearance === "dark" ||
      (appearance === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    if (theme !== "default") root.classList.add("theme-" + theme);
  })();
</script>
```

Change the two defaults to force a mode or a theme. In a React app rendered on
the server (Next.js `app/layout.tsx`), render the same script in `<head>` and
put `suppressHydrationWarning` on `<html>`, since the script changes its
classes before hydration ([getting-started.md](getting-started.md#5-dark-mode-and-themes)).
In a Stimulus app, use the [head partial](stimulus.md#before-the-first-paint)
instead: the same logic, which also falls back to the values `cremona-theme`
renders on `<html>` and keeps visuals hidden until `cremona-visual` connects.

## Contrast guarantees

`packages/tokens/test/contrast.test.ts` resolves every theme in both modes the
way an sRGB display renders it and fails the build unless:

- **text reaches 4.5:1** (WCAG AA): `--foreground` on `--background`; every
  `*-foreground` on its surface (`card`, `popover`, `primary`, `secondary`,
  `accent`, `sidebar`, `sidebar-primary`, `sidebar-accent`, `destructive`,
  `success`, `warning`, `info`); `--muted-foreground` on `--background`,
  `--card` and `--muted`; `--destructive`, `--success`, `--warning` and
  `--info` as text on `--background` and `--card`, and on their own `/10`
  tint over either;
- **focus rings reach 3:1**: `--ring` on `--background` and `--card` (a
  `focus-visible:outline-2 outline-offset-2 outline-ring` outline), and
  `--sidebar-ring` on `--sidebar`;
- **chart series** reach 3:1 on `--card`, differ pairwise by at least 10 in
  OKLab (ΔE × 100; about 2 is barely noticeable) and by 5 under simulated
  deuteranopia and protanopia, and `chart-1..3` stay 8 apart from `--primary`
  (charts/donut draws `--primary` as its fourth slice);
- **primary actions don't read as destructive**: `--primary` and
  `--destructive` differ by at least 8;
- **inputs are as visible as the theme's borders**: where `--border` reaches
  3:1 (brutalism), so does `--input`.

Outside the budget, by design:

- `--primary` is a fill color. As text (`text-primary`) it can fall below
  4.5:1 — about 2.3:1 on white in light-green and sakura light, 3–4.4:1 in
  claude-plus light, tiesen dark and indigo-clean — so keep it for large text,
  labelled icons and fills with `--primary-foreground`.
- `--border` and `--input` are soft in every theme but brutalism (1.1–2:1):
  they separate surfaces, they don't carry information on their own.
- Opacity-modified text (`text-muted-foreground/60`, 2.3–4:1) is for
  decoration only (line numbers, placeholder art), never for content.
- A translucent focus halo (`ring-ring/50`) falls under 3:1 in 16 of the 18
  theme × mode combinations: draw keyboard focus with the full-opacity
  `outline-ring` above.

What the blocks guarantee beyond colour, and what the host adds:
[accessibility.md](accessibility.md).

## Fonts

Inter Variable (`--font-sans`), weights 100–900, woff2 subsets shipped in
`packages/tokens/css/`. No other font families are used. Inter is licensed
under the SIL Open Font License 1.1: `css/OFL.txt` ships next to the font
files; keep it with them if you copy the fonts elsewhere.

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
grid     grid grid-cols-1 gap-2 lg:grid-cols-2 (+ xl:grid-cols-3 or xl:grid-cols-4)
```

Inside the frame, visuals render a scene:
`relative isolate flex size-full items-center justify-center overflow-hidden px-2`
containing the card wrapper (`max-w-72|80 rounded-3xl border bg-muted/75 p-1.5`),
the rainbow glow (`opacity-60 blur-sm`), the bottom veil
(`bg-background/75 mask-t-from-50%`), and ambient glows + particle fields.

## Scales

Every block renders at one of three scales (the MCP `scale`):

- **illustration** — product artwork in the POC style (metrics, charts, scenes,
  states…): every category not listed below;
- **real-size** — `components/*`, `forms/*`, `mobile/*`, `notices/*`,
  `ecommerce/product-card`, `order-row` and `checkout-summary`: UI at its real
  size (12–16 px text), the templates interactive components are derived from;
- **miniature** — `sections/*`, `layouts/*`, `ecommerce/product-grid` and
  `cart-drawer`: thumbnail-scale wireframes of a page or a section (7–10 px
  text), never the page itself.

All three are preview compositions:
[react.md](react.md#preview-compositions-vs-production-ui) says how to use one
as-is or derive a component from it.

## Motion conventions

- Card entrance: `opacity 0→1, y 8→0, duration .35 easeOut` (or isometric
  `rotateX(45deg) rotateZ(-45deg)`, duration .5).
- Icon chip: spring `stiffness 420, damping 14, delay .2`.
- Pills/values: spring `360/18` or `y 8` easeOut with `.25–.5` delays.
- Glow: `opacity 0→.6, scaleX .6→1, duration .5, delay .5`.
- Stagger groups: `staggerChildren .07–.15, delayChildren .2–.25`.
- Loops: only while `useLoopActive(ref, animated)` is true — in view, tab
  visible, no reduced-motion preference — with a resting frame otherwise.

`@cremona/core` exports the shared constants (`RAINBOW_GRADIENT`, `ISO_*`,
`FRAME_HEIGHTS`, `gridCols`).
