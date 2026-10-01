/**
 * Compares two rendered trees for what a viewer sees: structure, classes, text, attributes, and the
 * effective value of every inline style and SVG presentation attribute — inline style, else the
 * classes' value from cremona.css, else the presentation attribute, else the inherited or initial
 * value. Only true visual equivalences are normalized; each one says why.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SVG_NS = "http://www.w3.org/2000/svg";

export interface EndStateDiff {
  path: string;
  what: string;
  animated: string;
  static: string;
}

// ---------------------------------------------------------------------------------------------
// cremona.css: the declarations each class applies, unconditionally (`base`) or only in a state,
// breakpoint or theme (`state`: an inline style there would override the class in that state).

interface ClassRules {
  base: Map<string, { value: string; order: number }>;
  state: Set<string>;
}

const CLASS_TOKEN = /^\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/;

function unescapeClass(raw: string): string {
  return raw
    .replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/g, "$1");
}

/** Index of the character closing the block opened at `open` (strings and escapes skipped). */
function closing(src: string, open: number): number {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") i++;
    else if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1);
      i = end === -1 ? src.length : end;
    } else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i;
  }
  return src.length;
}

/** Splits on `sep` outside parentheses, brackets and strings. */
function splitTop(src: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") i++;
    else if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1);
      i = end === -1 ? src.length : end;
    } else if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === sep && depth === 0) {
      out.push(src.slice(start, i));
      start = i + 1;
    }
  }
  out.push(src.slice(start));
  return out;
}

function parseCss(css: string): Map<string, ClassRules> {
  const rules = new Map<string, ClassRules>();
  let order = 0;
  const entry = (cls: string) => {
    let r = rules.get(cls);
    if (!r) rules.set(cls, (r = { base: new Map(), state: new Set() }));
    return r;
  };
  const walk = (src: string, conditional: boolean) => {
    let pos = 0;
    while (pos < src.length) {
      let i = pos;
      while (i < src.length && src[i] !== "{" && src[i] !== ";") {
        if (src[i] === "\\") i++;
        i++;
      }
      if (i >= src.length) return;
      const prelude = src.slice(pos, i).trim();
      if (src[i] === ";") {
        pos = i + 1;
        continue;
      }
      const end = closing(src, i);
      const body = src.slice(i + 1, end);
      pos = end + 1;
      if (prelude.startsWith("@")) {
        const name = /^@([\w-]+)/.exec(prelude)?.[1];
        if (name === "layer" || name === "supports") walk(body, conditional);
        else if (name === "media" || name === "container") walk(body, true);
        continue;
      }
      const decls: [string, string][] = [];
      for (const d of splitTop(body, ";")) {
        const colon = d.indexOf(":");
        if (colon > 0) decls.push([d.slice(0, colon).trim(), d.slice(colon + 1).trim()]);
      }
      for (const selector of splitTop(prelude, ",")) {
        const m = CLASS_TOKEN.exec(selector.trim());
        if (!m) continue;
        const rest = selector.trim().slice(m[0].length);
        // a combinator outside parentheses styles another element than the one with the class
        if (/[\s>+~]/.test(rest.replace(/\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ""))) continue;
        const r = entry(unescapeClass(m[1]!));
        for (const [prop, value] of decls) {
          if (prop.startsWith("--")) continue;
          if (rest === "" && !conditional) r.base.set(prop, { value, order: order++ });
          else r.state.add(prop);
        }
      }
    }
  };
  walk(css.replace(/\/\*[\s\S]*?\*\//g, ""), false);
  return rules;
}

let classRules: Map<string, ClassRules> | undefined;
function rulesFor(cls: string): ClassRules | undefined {
  classRules ??= parseCss(
    readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../tokens/css/cremona.css"),
      "utf8",
    ),
  );
  return classRules.get(cls);
}

function classes(el: Element): string[] {
  return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

/** The value the element's classes give `prop` outside any state (the later rule wins). */
function classBase(el: Element, prop: string): string | undefined {
  let best: { value: string; order: number } | undefined;
  for (const cls of classes(el)) {
    const v = rulesFor(cls)?.base.get(prop);
    if (v && (!best || v.order > best.order)) best = v;
  }
  return best?.value;
}

/** Classes that change `prop` in a state (hover, group-hover, data-*, dark, a breakpoint…). */
function stateClasses(el: Element, prop: string): string[] {
  return classes(el).filter((cls) => rulesFor(cls)?.state.has(prop));
}

// ---------------------------------------------------------------------------------------------
// Effective values.

/** SVG presentation attributes: styled like CSS properties, below any class rule. */
const PRESENTATION = new Set([
  "clip-path",
  "clip-rule",
  "color",
  "display",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "mask",
  "opacity",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "text-anchor",
  "visibility",
]);

const INHERITED = new Set([
  "color",
  "cursor",
  "fill",
  "fill-opacity",
  "fill-rule",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "text-anchor",
  "visibility",
]);

/** Initial values: an unset property renders exactly like one set to these. */
const INITIAL: Record<string, string> = {
  opacity: "1",
  "fill-opacity": "1",
  "stroke-opacity": "1",
  "stop-opacity": "1",
  transform: "none",
  translate: "none",
  rotate: "none",
  scale: "none",
  filter: "none",
  "backdrop-filter": "none",
  "clip-path": "none",
  mask: "none",
  "mask-image": "none",
  "stroke-dasharray": "none",
  "stroke-dashoffset": "0",
  visibility: "visible",
  "pointer-events": "auto",
  "box-shadow": "none",
  "will-change": "auto",
  "background-position-x": "0%",
  "background-position-y": "0%",
};

function inlineStyle(el: Element): Map<string, string> {
  const out = new Map<string, string>();
  const s = (el as HTMLElement).style;
  if (!s) return out;
  for (let i = 0; i < s.length; i++) {
    const k = s.item(i);
    out.set(k, s.getPropertyValue(k).trim());
  }
  return out;
}

interface Snapshot {
  el: Element;
  parent: Snapshot | undefined;
  style: Map<string, string>;
  attrs: Map<string, string>;
}

function snapshot(el: Element, parent: Snapshot | undefined, ids: IdMap): Snapshot {
  const style = new Map<string, string>();
  for (const [k, v] of inlineStyle(el)) style.set(k, ids.canon(v));
  const attrs = new Map<string, string>();
  for (const name of el.getAttributeNames()) {
    if (name === "style" || name === "class") continue;
    attrs.set(name, ids.canon(el.getAttribute(name) ?? ""));
  }
  const snap: Snapshot = { el, parent, style, attrs };
  drawnPath(snap);
  undashedPathLength(snap);
  return snap;
}

const isSvg = (el: Element) => el.namespaceURI === SVG_NS;

function effective(snap: Snapshot, prop: string): string {
  const inline = snap.style.get(prop);
  if (inline !== undefined) return inline;
  const fromClass = classBase(snap.el, prop);
  if (fromClass !== undefined) return fromClass;
  if (isSvg(snap.el) && PRESENTATION.has(prop)) {
    const attr = snap.attrs.get(prop);
    if (attr !== undefined) return attr;
  }
  // the host page styles both roots alike; it does not dash strokes or hide blocks
  if (INHERITED.has(prop))
    return snap.parent ? effective(snap.parent, prop) : (INITIAL[prop] ?? "(inherited)");
  return INITIAL[prop] ?? "(unset)";
}

/**
 * A path drawn to its full length (`pathLength` 1, dash 1 and gap 1, no offset — motion's
 * `pathLength: 1`) strokes the whole path, exactly like a path without dashes.
 */
function drawnPath(snap: Snapshot) {
  if (!isSvg(snap.el) || num(snap.attrs.get("pathLength") ?? "") !== "1") return;
  const dash = snap.style.get("stroke-dasharray") ?? snap.attrs.get("stroke-dasharray");
  const offset = snap.style.get("stroke-dashoffset") ?? snap.attrs.get("stroke-dashoffset") ?? "0";
  if (dash === undefined || normDashes(dash) !== "1 1" || num(stripPx(offset)) !== "0") return;
  snap.attrs.delete("pathLength");
  for (const map of [snap.style, snap.attrs]) {
    map.delete("stroke-dasharray");
    map.delete("stroke-dashoffset");
  }
}

/** `pathLength` only rescales dashes: on a path without any, it changes nothing. */
function undashedPathLength(snap: Snapshot) {
  if (snap.attrs.has("pathLength") && effective(snap, "stroke-dasharray") === "none")
    snap.attrs.delete("pathLength");
}

// ---------------------------------------------------------------------------------------------
// Value normalization: equal strings after it render the same.

function num(v: string): string {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? String(Math.round(n * 1000) / 1000) : v;
}

/** `0px`, `0%` and `0` are the same offset; px is the unit of unitless SVG lengths. */
function stripPx(v: string): string {
  return v.replace(/(-?\d*\.?\d+)px\b/g, "$1").replace(/(^|[\s(,])-?0%(?=$|[\s),])/g, "$10");
}

function normNumbers(v: string): string {
  return v.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => num(m));
}

function normDashes(v: string): string {
  return normNumbers(stripPx(v))
    .replace(/[\s,]+/g, " ")
    .trim();
}

function normOpacity(v: string): string {
  const pct = /^(-?\d*\.?\d+)%$/.exec(v.trim());
  return pct ? num(String(Number(pct[1]) / 100)) : num(v);
}

/** Filter functions that leave the element unchanged (blur(0), brightness(1)…) are dropped. */
function normFilter(v: string): string {
  const identity =
    /\b(?:blur\(\s*0(?:px)?\s*\)|(?:brightness|contrast|saturate|opacity)\(\s*(?:1|100%)\s*\)|(?:grayscale|invert|sepia)\(\s*(?:0|0%)\s*\)|hue-rotate\(\s*0(?:deg)?\s*\))/g;
  const out = normNumbers(stripPx(v.replace(identity, "")))
    .replace(/\s+/g, " ")
    .trim();
  return out === "" ? "none" : out;
}

type Matrix = number[]; // 4x4, column-major

function multiply(a: Matrix, b: Matrix): Matrix {
  const out = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) out[c * 4 + r]! += a[k * 4 + r]! * b[c * 4 + k]!;
  return out;
}

const IDENTITY: Matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function angle(v: string): number | undefined {
  const m = /^(-?\d*\.?\d+(?:e-?\d+)?)(deg|rad|turn|grad)?$/.exec(v.trim());
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2] ?? (n === 0 ? "deg" : undefined);
  if (unit === "deg") return (n * Math.PI) / 180;
  if (unit === "rad") return n;
  if (unit === "turn") return n * 2 * Math.PI;
  if (unit === "grad") return (n * Math.PI) / 200;
  return undefined;
}

function length(v: string): number | undefined {
  const m = /^(-?\d*\.?\d+(?:e-?\d+)?)(px)?$/.exec(v.trim());
  return m ? Number(m[1]) : undefined;
}

function rotation(x: number, y: number, z: number, a: number): Matrix {
  const len = Math.hypot(x, y, z) || 1;
  [x, y, z] = [x / len, y / len, z / len];
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [
    t * x * x + c,
    t * x * y + s * z,
    t * x * z - s * y,
    0,
    t * x * y - s * z,
    t * y * y + c,
    t * y * z + s * x,
    0,
    t * x * z + s * y,
    t * y * z - s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ];
}

/** The transform as a matrix, or undefined when it uses box-relative units (%) or unknown functions. */
function transformMatrix(v: string): Matrix | undefined {
  if (v.trim() === "none") return IDENTITY;
  let m = IDENTITY;
  const re = /([a-zA-Z3]+)\(([^)]*)\)/g;
  let rest = v;
  for (const [all, fn, rawArgs] of v.matchAll(re)) {
    rest = rest.replace(all, "");
    const args = rawArgs!.split(/\s*,\s*|\s+/).filter(Boolean);
    const L = args.map(length);
    const A = args.map(angle);
    const N = args.map((a) => Number(a));
    let f: Matrix | undefined;
    switch (fn) {
      case "translate":
      case "translate3d":
      case "translateX":
      case "translateY":
      case "translateZ": {
        if (L.some((x) => x === undefined)) return undefined;
        const [x = 0, y = 0, z = 0] =
          fn === "translateX"
            ? [L[0]]
            : fn === "translateY"
              ? [0, L[0]]
              : fn === "translateZ"
                ? [0, 0, L[0]]
                : (L as number[]);
        f = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
        break;
      }
      case "scale":
      case "scale3d":
      case "scaleX":
      case "scaleY":
      case "scaleZ": {
        if (N.some((x) => !Number.isFinite(x))) return undefined;
        const [x, y, z] =
          fn === "scaleX"
            ? [N[0]!, 1, 1]
            : fn === "scaleY"
              ? [1, N[0]!, 1]
              : fn === "scaleZ"
                ? [1, 1, N[0]!]
                : [N[0]!, N[1] ?? N[0]!, fn === "scale3d" ? N[2]! : 1];
        f = [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
        break;
      }
      case "rotate":
      case "rotateZ":
      case "rotateX":
      case "rotateY": {
        const a = A[0];
        if (a === undefined) return undefined;
        f =
          fn === "rotateX"
            ? rotation(1, 0, 0, a)
            : fn === "rotateY"
              ? rotation(0, 1, 0, a)
              : rotation(0, 0, 1, a);
        break;
      }
      case "skew":
      case "skewX":
      case "skewY": {
        const [ax, ay] = fn === "skewY" ? [0, A[0]] : [A[0], A[1] ?? 0];
        if (ax === undefined || ay === undefined) return undefined;
        f = [1, Math.tan(ay), 0, 0, Math.tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        break;
      }
      case "perspective": {
        const d = L[0];
        if (d === undefined) return undefined;
        f = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, d === 0 ? 0 : -1 / d, 0, 0, 0, 1];
        break;
      }
      case "matrix": {
        if (N.length !== 6 || N.some((x) => !Number.isFinite(x))) return undefined;
        const [a, b, c, d, e, g] = N as [number, number, number, number, number, number];
        f = [a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, e, g, 0, 1];
        break;
      }
      default:
        return undefined;
    }
    m = multiply(m, f);
  }
  return rest.trim() === "" ? m : undefined;
}

/** Transforms compare as matrices (rotate(360deg) is the identity); box-relative ones as text. */
function normTransform(v: string): string {
  const m = transformMatrix(v);
  if (!m) return normNumbers(stripPx(v)).replace(/\s+/g, " ").trim();
  if (m.every((x, i) => Math.abs(x - IDENTITY[i]!) < 1e-6)) return "none";
  return `matrix3d(${m.map((x) => num(String(Math.abs(x) < 1e-9 ? 0 : x))).join(",")})`;
}

/** Keyword, one- and two-value origins in their three-value form (`center` is `50% 50% 0`). */
function normOrigin(v: string): string {
  const words: Record<string, string> = {
    left: "0%",
    top: "0%",
    center: "50%",
    right: "100%",
    bottom: "100%",
  };
  const parts = stripPx(v)
    .trim()
    .split(/\s+/)
    .map((p) => words[p] ?? p);
  if (parts.length === 1) parts.push("50%");
  if (parts.length === 2) parts.push("0");
  return stripPx(parts.join(" "));
}

function normalize(prop: string, v: string): string {
  if (/opacity$/.test(prop)) return normOpacity(v);
  if (prop === "transform") return normTransform(v);
  if (prop === "filter" || prop === "backdrop-filter") return normFilter(v);
  if (prop === "stroke-dasharray") return v === "none" ? v : normDashes(v);
  if (prop === "transform-origin") return normOrigin(v);
  return normNumbers(stripPx(v)).replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------------------------
// useId values differ between two mounts: ids and their references map to their order of
// first appearance in the tree.

export const ID_PREFIX = "endstate";
const ID_RE = new RegExp(`[_:«]${ID_PREFIX}r_?[0-9a-z]+[_:»]`, "g");

interface IdMap {
  canon(v: string): string;
}

function idMap(root: Element): IdMap {
  const seen = new Map<string, string>();
  const canon = (v: string) =>
    v.replace(ID_RE, (id) => {
      let c = seen.get(id);
      if (!c) seen.set(id, (c = `«id${seen.size}»`));
      return c;
    });
  const visit = (el: Element) => {
    for (const name of el.getAttributeNames()) canon(el.getAttribute(name) ?? "");
    for (const child of el.children) visit(child);
  };
  visit(root);
  return { canon };
}

// ---------------------------------------------------------------------------------------------

function describeEl(el: Element): string {
  const cls = classes(el).slice(0, 4).join(".");
  return cls ? `${el.tagName.toLowerCase()}.${cls}` : el.tagName.toLowerCase();
}

/** The element's own value for a non-inherited property, ignoring states. */
function own(el: Element, prop: string): string {
  const inline = (el as HTMLElement).style?.getPropertyValue(prop);
  if (inline) return inline.trim();
  const fromClass = classBase(el, prop);
  if (fromClass !== undefined) return fromClass;
  if (isSvg(el) && PRESENTATION.has(prop)) {
    const attr = el.getAttribute(prop);
    if (attr !== null) return attr;
  }
  return INITIAL[prop] ?? "";
}

/**
 * Paints nothing and takes no space: `display: none`, or opacity 0 out of the flow (absolutely
 * positioned, or SVG content) — unless a state class could show it. A loop at rest may leave
 * such an element behind; it looks the same as none.
 */
function rendersNothing(el: Element): boolean {
  if (own(el, "display") === "none" && !stateClasses(el, "display").length) return true;
  if (normOpacity(own(el, "opacity")) !== "0" || stateClasses(el, "opacity").length) return false;
  const svgContent = isSvg(el) && !!el.parentElement && isSvg(el.parentElement);
  return svgContent || /^(absolute|fixed)$/.test(own(el, "position"));
}

function childNodes(el: Element): (Element | string)[] {
  const out: (Element | string)[] = [];
  for (const node of el.childNodes) {
    if (node.nodeType === 1) {
      if (!rendersNothing(node as Element)) out.push(node as Element);
    } else if (node.nodeType === 3) {
      const text = node.nodeValue ?? "";
      if (typeof out[out.length - 1] === "string") out[out.length - 1] += text;
      else if (text !== "") out.push(text);
    }
  }
  return out;
}

function signature(nodes: (Element | string)[]): string {
  return nodes
    .map((n) => (typeof n === "string" ? JSON.stringify(n.slice(0, 24)) : describeEl(n)))
    .join(", ");
}

const TRANSFORMING = ["transform", "translate", "rotate", "scale"];

/** A class that only sets `will-change`: a rendering hint, like the inline property. */
function hintOnly(cls: string): boolean {
  const r = rulesFor(cls);
  return (
    !!r && !r.state.size && r.base.size > 0 && [...r.base.keys()].every((p) => p === "will-change")
  );
}

function compareElement(a: Snapshot, s: Snapshot, path: string, out: EndStateDiff[]) {
  const svg = isSvg(a.el);
  // classes: their order has no effect on the cascade
  const ca = [...new Set(classes(a.el).filter((c) => !hintOnly(c)))].sort().join(" ");
  const cs = [...new Set(classes(s.el).filter((c) => !hintOnly(c)))].sort().join(" ");
  if (ca !== cs) {
    const only = (x: string, y: string) =>
      x
        .split(" ")
        .filter((c) => c && !y.split(" ").includes(c))
        .join(" ") || "∅";
    out.push({ path, what: "class", animated: only(ca, cs), static: only(cs, ca) });
  }

  // attributes that are not styles
  const attrNames = new Set([...a.attrs.keys(), ...s.attrs.keys()]);
  for (const name of attrNames) {
    if (svg && PRESENTATION.has(name)) continue;
    // inert changes what can be interacted with, not what is drawn
    if (name === "inert") continue;
    const va = a.attrs.get(name);
    const vs = s.attrs.get(name);
    if (va === vs) continue;
    if (va !== undefined && vs !== undefined && normNumbers(va) === normNumbers(vs)) continue;
    out.push({ path, what: `@${name}`, animated: va ?? "(unset)", static: vs ?? "(unset)" });
  }

  // styles: inline, plus presentation attributes on SVG elements
  const props = new Set([...a.style.keys(), ...s.style.keys()]);
  if (svg)
    for (const name of attrNames) if (PRESENTATION.has(name) && name !== "display") props.add(name);
  if (svg && (a.attrs.has("display") || s.attrs.has("display"))) props.add("display");
  const transformed = [a, s].some(
    (x) =>
      TRANSFORMING.some((p) => normalize(p, effective(x, p)) !== "none") ||
      TRANSFORMING.some((p) => stateClasses(x.el, p).length > 0),
  );
  for (const prop of props) {
    // a rendering hint: it changes how the element is composited, not what it shows
    if (prop === "will-change") continue;
    // origin and box only place a transform: without one they show nothing
    if ((prop === "transform-origin" || prop === "transform-box") && !transformed) continue;
    const ea = prop === "transform-box" ? (a.style.get(prop) ?? "view-box") : effective(a, prop);
    const es = prop === "transform-box" ? (s.style.get(prop) ?? "view-box") : effective(s, prop);
    const na = normalize(prop, ea);
    const ns = normalize(prop, es);
    if (na !== ns) {
      out.push({ path, what: prop, animated: ea, static: es });
      continue;
    }
    // an inline value on one side only overrides the classes that style this state
    if (a.style.has(prop) !== s.style.has(prop)) {
      const blocked = stateClasses(a.el, prop);
      if (blocked.length)
        out.push({
          path,
          what: `${prop} (inline, overrides ${blocked.join(" ")})`,
          animated: a.style.get(prop) ?? "(unset)",
          static: s.style.get(prop) ?? "(unset)",
        });
    }
  }
}

function compareTrees(
  a: Snapshot,
  s: Snapshot,
  ids: [IdMap, IdMap],
  path: string,
  out: EndStateDiff[],
) {
  if (a.el.tagName !== s.el.tagName) {
    out.push({ path, what: "tag", animated: a.el.tagName, static: s.el.tagName });
    return;
  }
  compareElement(a, s, path, out);
  const ka = childNodes(a.el);
  const ks = childNodes(s.el);
  const same =
    ka.length === ks.length &&
    ka.every((n, i) =>
      typeof n === "string"
        ? typeof ks[i] === "string"
        : typeof ks[i] !== "string" && (ks[i] as Element).tagName === n.tagName,
    );
  if (!same) {
    out.push({ path, what: "children", animated: signature(ka), static: signature(ks) });
    return;
  }
  for (let i = 0; i < ka.length; i++) {
    const na = ka[i]!;
    const ns = ks[i]!;
    if (typeof na === "string") {
      if (na !== ns)
        out.push({ path: `${path} > #text`, what: "text", animated: na, static: ns as string });
      continue;
    }
    const childPath = `${path} > ${describeEl(na)}[${i}]`;
    compareTrees(snapshot(na, a, ids[0]), snapshot(ns as Element, s, ids[1]), ids, childPath, out);
  }
}

/** Differences between the animated end state (`a`) and the static render (`s`). */
export function compareRenders(a: Element, s: Element): EndStateDiff[] {
  const ids: [IdMap, IdMap] = [idMap(a), idMap(s)];
  const out: EndStateDiff[] = [];
  compareTrees(
    snapshot(a, undefined, ids[0]),
    snapshot(s, undefined, ids[1]),
    ids,
    describeEl(a),
    out,
  );
  return out;
}
