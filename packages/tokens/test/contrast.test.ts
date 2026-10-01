/**
 * Contrast budget: in every theme × mode, text stays legible (WCAG AA, 4.5:1), focus rings
 * and chart series stay visible (3:1) and series distinct from each other, and primary
 * actions never look destructive. Colours are resolved as an sRGB display renders them.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import {
  DEFICIENCIES,
  contrast,
  deltaE,
  over,
  parseColor,
  resolveTheme,
  simulate,
  tokenBlocks,
  withAlpha,
  type Rgb,
} from "./color";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blocks = tokenBlocks(readFileSync(join(root, "css", "themes.css"), "utf8"));
const themes: string[] = JSON.parse(readFileSync(join(root, "themes.json"), "utf8")).map(
  (t: { value: string }) => t.value,
);

const TEXT = 4.5;
const GRAPHIC = 3;
/** OKLab ×100 between any two chart series; 5 under simulated deuteranopia/protanopia. */
const SERIES_APART = 10;
const SERIES_APART_CVD = 5;
/** charts/donut draws --primary as its fourth slice, next to chart-1..3. */
const SERIES_FROM_PRIMARY = 8;
const PRIMARY_FROM_DESTRUCTIVE = 8;

/** [text, surface]: text as the foreground on its surface. */
const TEXT_PAIRS = [
  ["--foreground", "--background"],
  ["--card-foreground", "--card"],
  ["--popover-foreground", "--popover"],
  ["--muted-foreground", "--background"],
  ["--muted-foreground", "--card"],
  ["--muted-foreground", "--muted"],
  ["--primary-foreground", "--primary"],
  ["--secondary-foreground", "--secondary"],
  ["--accent-foreground", "--accent"],
  ["--destructive-foreground", "--destructive"],
  ["--success-foreground", "--success"],
  ["--warning-foreground", "--warning"],
  ["--info-foreground", "--info"],
  ["--sidebar-foreground", "--sidebar"],
  ["--sidebar-primary-foreground", "--sidebar-primary"],
  ["--sidebar-accent-foreground", "--sidebar-accent"],
] as const;

/** Status colours used as text (`text-destructive`), also on their own tint (`bg-success/10 text-success`). */
const STATUS = ["--destructive", "--success", "--warning", "--info"] as const;
const CHARTS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"] as const;

function budget(theme: string, mode: "light" | "dark"): string[] {
  const tokens = resolveTheme(blocks, theme, mode);
  const color = (name: string): Rgb => {
    const value = tokens[name];
    if (!value) throw new Error(`${theme} ${mode}: ${name} is not defined`);
    return parseColor(value);
  };
  const background = over(color("--background"), { r: 1, g: 1, b: 1, alpha: 1 });
  const surface = (name: string) => over(color(name), background);
  const card = surface("--card");
  const failures: string[] = [];
  const check = (label: string, value: number, min: number) => {
    if (!(value >= min)) failures.push(`${label}: ${value.toFixed(2)} < ${min}`);
  };
  const text = (fg: Rgb, bg: Rgb) => contrast(over(fg, bg), bg);

  for (const [fg, bg] of TEXT_PAIRS) check(`${fg} on ${bg}`, text(color(fg), surface(bg)), TEXT);
  for (const status of STATUS) {
    const c = color(status);
    for (const [name, base] of [
      ["--background", background],
      ["--card", card],
    ] as const) {
      check(`${status} text on ${name}`, text(c, base), TEXT);
      check(
        `${status} text on its /10 tint over ${name}`,
        text(c, over(withAlpha(c, 0.1), base)),
        TEXT,
      );
    }
  }
  // focus outlines (`outline-ring`, offset from the element) sit on the page or on a card
  check("--ring on --background", contrast(surface("--ring"), background), GRAPHIC);
  check("--ring on --card", contrast(surface("--ring"), card), GRAPHIC);
  check(
    "--sidebar-ring on --sidebar",
    contrast(surface("--sidebar-ring"), surface("--sidebar")),
    GRAPHIC,
  );

  const series = CHARTS.map(color);
  const primary = surface("--primary");
  series.forEach((c, i) => check(`${CHARTS[i]} on --card`, contrast(over(c, card), card), GRAPHIC));
  for (let i = 0; i < series.length; i++) {
    for (let j = i + 1; j < series.length; j++) {
      const [a, b] = [series[i]!, series[j]!];
      const pair = `${CHARTS[i]} vs ${CHARTS[j]}`;
      check(`${pair} dE`, deltaE(a, b), SERIES_APART);
      for (const d of DEFICIENCIES)
        check(`${pair} dE (${d})`, deltaE(simulate(a, d), simulate(b, d)), SERIES_APART_CVD);
    }
  }
  for (const i of [0, 1, 2])
    check(`${CHARTS[i]} vs --primary dE`, deltaE(series[i]!, primary), SERIES_FROM_PRIMARY);

  check(
    "--primary vs --destructive dE",
    deltaE(primary, surface("--destructive")),
    PRIMARY_FROM_DESTRUCTIVE,
  );
  // a theme that draws hard borders draws its fields as clearly
  if (contrast(surface("--border"), background) >= GRAPHIC)
    check("--input on --background", contrast(surface("--input"), background), GRAPHIC);
  return failures;
}

describe("contrast budget", () => {
  it("covers every theme of themes.json in both modes", () => {
    expect(themes).toContain("default");
    for (const theme of themes.filter((t) => t !== "default"))
      for (const selector of [`.theme-${theme}:not(.dark)`, `.theme-${theme}.dark`])
        expect(blocks.has(selector), selector).toBe(true);
  });

  for (const theme of themes)
    for (const mode of ["light", "dark"] as const)
      it(`${theme} ${mode}`, () => {
        expect(budget(theme, mode)).toEqual([]);
      });
});
