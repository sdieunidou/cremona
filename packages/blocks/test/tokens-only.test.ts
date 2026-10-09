/**
 * Blocks style themselves with the semantic tokens (`bg-card`, `text-success`, `bg-chart-1`…): a token
 * follows the theme and the mode, and meets the contrast budget. A Tailwind palette colour
 * (`bg-emerald-500`, `var(--color-rose-500)`) is a colour no theme can change, so it is allowed only
 * where the colour is the artwork itself — and is listed below, with its reason.
 *
 * What a block means by a colour decides its token: a status (ok, wrong, careful, informative) is
 * `success`, `destructive`, `warning` or `info`; a category that only has to be told apart is
 * `chart-1` … `chart-5`; a neutral is `muted`, `border`, `foreground`…. The rainbow glow of the card
 * blocks is the one palette gradient.
 */
import { describe, expect, it } from "vitest";

const sources = import.meta.glob<string>("../src/*/*/react.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FAMILIES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
].join("|");
const UTILITY = new RegExp(
  `(?<![\\w-])(?:[\\w\\[\\]/-]+:)*(?:bg|text|border|ring|from|via|to|fill|stroke|outline|shadow|decoration|accent|caret|divide|placeholder)-(${FAMILIES})-\\d{2,3}(?![\\w-])`,
  "g",
);
const VARIABLE = new RegExp(`var\\(--color-(${FAMILIES})-\\d{2,3}\\)`, "g");
/** the glow of the card blocks: red to violet, in this one form */
const RAINBOW =
  /bg-\[linear-gradient\(to_right,var\(--color-red-500\),var\(--color-orange-500\),var\(--color-yellow-500\),var\(--color-green-500\),var\(--color-blue-500\),var\(--color-indigo-500\),var\(--color-violet-500\)\)\]/g;

const SCENES = [
  "amber",
  "cyan",
  "emerald",
  "indigo",
  "orange",
  "pink",
  "purple",
  "rose",
  "sky",
  "slate",
  "teal",
  "violet",
  "yellow",
];
const FILE_TYPES = [
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "slate",
  "teal",
  "violet",
  "yellow",
  "zinc",
];

/** block → the palette families it may use, and why a token cannot say it */
const ARTWORK: Record<string, { families: string[]; reason: string }> = {
  "images/gallery": { families: SCENES, reason: "the scenes stand in for photographs" },
  "images/carousel": { families: SCENES, reason: "the scenes stand in for photographs" },
  "media/video-player": {
    families: [
      "amber",
      "emerald",
      "fuchsia",
      "indigo",
      "rose",
      "sky",
      "slate",
      "teal",
      "violet",
      "zinc",
    ],
    reason:
      "the scenes (a landscape, a tutorial recording, a livestream) are artwork on their own background",
  },
  "files/simple": {
    families: FILE_TYPES,
    reason: "the colour of a file glyph is the identity of its format",
  },
  "files/stacked": {
    families: [
      "amber",
      "blue",
      "cyan",
      "green",
      "indigo",
      "pink",
      "purple",
      "red",
      "rose",
      "yellow",
      "zinc",
    ],
    reason: "the colour of a file glyph is the identity of its format",
  },
  "files/upload": {
    families: ["amber", "green", "indigo", "pink", "purple", "red", "yellow"],
    reason: "the thumbnails of the files being uploaded",
  },
  "devices/phone": { families: ["indigo", "purple", "slate"], reason: "the lock-screen wallpaper" },
  "devices/tablet": {
    families: ["indigo", "purple", "slate"],
    reason: "the lock-screen wallpaper",
  },
  "devices/laptop": {
    families: ["indigo", "purple", "slate"],
    reason: "the lock-screen wallpaper",
  },
  "payments/checkout": { families: ["amber"], reason: "the gold chip of the card" },
  "payments/credit-card": { families: ["amber"], reason: "the gold chip of the card" },
  "integrations/logo-reel": {
    families: ["blue", "green", "indigo", "red"],
    reason: "the brand colours of the logos",
  },
};

function families(source: string): string[] {
  const clean = source.replace(RAINBOW, "");
  const found = new Set<string>();
  for (const re of [UTILITY, VARIABLE]) for (const m of clean.matchAll(re)) found.add(m[1]!);
  return [...found].sort();
}

const blocks = Object.entries(sources).map(([path, source]) => ({
  key: /\.\.\/src\/([^/]+\/[^/]+)\/react\.tsx$/.exec(path)![1]!,
  used: families(source),
}));

describe("blocks use the semantic tokens", () => {
  it("scans every block", () => {
    expect(blocks.length).toBeGreaterThan(150);
  });

  it("uses no palette colour outside the artwork", () => {
    const offenders = blocks
      .map(({ key, used }) => ({
        key,
        extra: used.filter((family) => !ARTWORK[key]?.families.includes(family)),
      }))
      .filter(({ extra }) => extra.length)
      .map(({ key, extra }) => `${key}: ${extra.join(", ")}`);
    expect(
      offenders,
      "use success, warning, info, destructive, chart-1..5 or a neutral token",
    ).toEqual([]);
  });

  it("lists only blocks that still need their palette", () => {
    const stale = Object.entries(ARTWORK).flatMap(([key, { families: allowed }]) => {
      const block = blocks.find((b) => b.key === key);
      if (!block) return [`${key}: no such block`];
      return allowed
        .filter((family) => !block.used.includes(family))
        .map((family) => `${key}: ${family}`);
    });
    expect(stale, "remove what the block no longer uses").toEqual([]);
  });
});
