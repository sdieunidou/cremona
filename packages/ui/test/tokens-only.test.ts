/**
 * The components style themselves with the semantic tokens (`bg-primary`, `text-muted-foreground`,
 * `border-destructive`…), so that they follow the theme and the mode. No palette colour
 * (`bg-red-500`, `var(--color-rose-500)`), no solid `white`/`black`: the one fixed colour is the
 * dialog's black scrim, a translucent shade that dims whatever the theme is.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const sources = readdirSync(src)
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => ({ file, code: readFileSync(join(src, file), "utf8") }));

const FAMILIES =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";
const PROPERTIES =
  "bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|decoration|accent|caret|divide|placeholder";
const PALETTE = new RegExp(
  `(?<![\\w-])(?:[\\w\\[\\]/-]+:)*(?:${PROPERTIES})-(?:${FAMILIES})-\\d{2,3}(?![\\w-])|var\\(--color-(?:${FAMILIES})-\\d{2,3}\\)`,
  "g",
);
/** a solid white or black: `text-white`, `bg-black`, `border-white`; `bg-black/50` is a shade */
const SOLID = new RegExp(
  `(?<![\\w-])(?:[\\w\\[\\]/-]+:)*(?:${PROPERTIES})-(?:white|black)(?![\\w/-])`,
  "g",
);
const SCRIM = /bg-black\/\d+/;

describe("the components use the semantic tokens", () => {
  it("scans every component", () => {
    expect(sources.length).toBeGreaterThanOrEqual(8);
  });

  it("uses no palette colour", () => {
    const found = sources.flatMap(({ file, code }) =>
      [...code.matchAll(PALETTE)].map((match) => `${file}: ${match[0]}`),
    );
    expect(found, "use a token: primary, destructive, success, muted…").toEqual([]);
  });

  it("uses no solid white or black", () => {
    const found = sources.flatMap(({ file, code }) =>
      [...code.matchAll(SOLID)].map((match) => `${file}: ${match[0]}`),
    );
    expect(found, "use foreground, background, primary-foreground…").toEqual([]);
  });

  it("keeps black for the scrim of the dialog only", () => {
    const found = sources
      .filter(({ code }) => SCRIM.test(code))
      .map(({ file }) => file)
      .sort();
    expect(found).toEqual(["dialog.tsx"]);
  });
});
