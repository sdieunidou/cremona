/**
 * Colour maths for the token tests: CSS colour → sRGB as an sRGB display renders it
 * (channels clipped to [0, 1]), WCAG 2.x contrast, OKLab distance and colour-vision
 * deficiency simulation.
 */

/** Gamma-encoded sRGB channels in [0, 1], plus alpha. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

const clip = (v: number) => Math.min(1, Math.max(0, v));
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function oklabToRgb(L: number, a: number, b: number, alpha: number): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: clip(encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: clip(encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: clip(encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
    alpha,
  };
}

/** Parses the colour syntaxes the tokens use: `oklch(L[%] C H[ / A[%]])` and `#rgb[a]`/`#rrggbb[aa]`. */
export function parseColor(value: string): Rgb {
  const v = value.trim();
  const oklch = v.match(
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i,
  );
  if (oklch) {
    const [, l, lPct, c, h, a, aPct] = oklch;
    const L = lPct ? Number(l) / 100 : Number(l);
    const hue = (Number(h) * Math.PI) / 180;
    const alpha = a === undefined ? 1 : aPct ? Number(a) / 100 : Number(a);
    return oklabToRgb(L, Number(c) * Math.cos(hue), Number(c) * Math.sin(hue), alpha);
  }
  const hex = v.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let digits = hex[1]!;
    if (digits.length <= 4) digits = [...digits].map((d) => d + d).join("");
    const byte = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255;
    return { r: byte(0), g: byte(2), b: byte(4), alpha: digits.length === 8 ? byte(6) : 1 };
  }
  throw new Error(`unsupported colour syntax: ${value}`);
}

/** Source-over compositing in gamma space, as browsers blend. */
export function over(fg: Rgb, bg: Rgb): Rgb {
  const a = fg.alpha;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    alpha: 1,
  };
}

export const withAlpha = (c: Rgb, alpha: number): Rgb => ({ ...c, alpha: c.alpha * alpha });

const luminance = (c: Rgb) => 0.2126 * decode(c.r) + 0.7152 * decode(c.g) + 0.0722 * decode(c.b);

/** WCAG 2.x contrast ratio (1–21) of two opaque colours. */
export function contrast(x: Rgb, y: Rgb): number {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function toOklab(c: Rgb) {
  const R = decode(c.r);
  const G = decode(c.g);
  const B = decode(c.b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** Euclidean distance in OKLab, ×100 (≈ 2 is a just-noticeable difference). */
export function deltaE(x: Rgb, y: Rgb): number {
  const p = toOklab(x);
  const q = toOklab(y);
  return 100 * Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

// Machado, Oliveira & Fernandes (2009), severity 1, applied to linear RGB.
const CVD = {
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
  ],
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
  ],
} as const;

export type Deficiency = keyof typeof CVD;
export const DEFICIENCIES = Object.keys(CVD) as Deficiency[];

/** How a colour appears with the given colour-vision deficiency. */
export function simulate(c: Rgb, deficiency: Deficiency): Rgb {
  const m = CVD[deficiency];
  const [r, g, b] = [decode(c.r), decode(c.g), decode(c.b)];
  const row = (i: number) => clip(encode(clip(m[i]! * r + m[i + 1]! * g + m[i + 2]! * b)));
  return { r: row(0), g: row(3), b: row(6), alpha: c.alpha };
}

const TOKEN_SELECTOR = /^(:root|\.dark|\.theme-[\w-]+(:not\(\.dark\)|\.dark| \.dark))$/;

/**
 * `selector → { --token: value }` for the token blocks of a stylesheet (the rules that start
 * with `--background`). A rule listing several selectors yields one entry per selector.
 */
export function tokenBlocks(css: string): Map<string, Record<string, string>> {
  const blocks = new Map<string, Record<string, string>>();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of source.matchAll(/([^{}]+)\{(--background:[^}]*)\}/g)) {
    const decls: Record<string, string> = {};
    for (const decl of m[2]!.split(";")) {
      const i = decl.indexOf(":");
      if (i > 0) decls[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
    }
    for (const selector of m[1]!.split(",").map((s) => s.trim().replace(/\s+/g, " ")))
      if (TOKEN_SELECTOR.test(selector)) blocks.set(selector, decls);
  }
  return blocks;
}

/**
 * The tokens a theme resolves to on a light or dark page (`.theme-x` and `.dark` on <html>),
 * or inside a `.dark` element of a light page ("dark-subtree"): the page's light tokens are
 * inherited there, and the subtree's own rules override them.
 */
export function resolveTheme(
  blocks: Map<string, Record<string, string>>,
  theme: string,
  mode: "light" | "dark" | "dark-subtree",
): Record<string, string> {
  const themed = theme !== "default";
  const layers = [":root"];
  if (mode === "dark") layers.push(".dark");
  if (themed) layers.push(`.theme-${theme}${mode === "dark" ? ".dark" : ":not(.dark)"}`);
  if (mode === "dark-subtree") layers.push(".dark");
  if (themed && mode === "dark-subtree") layers.push(`.theme-${theme} .dark`);
  return Object.assign({}, ...layers.map((s) => blocks.get(s) ?? {}));
}
