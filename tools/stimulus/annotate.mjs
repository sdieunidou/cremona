/**
 * Turn a block's final render into a Stimulus template.
 *
 * The template markup IS the final render (`animated={false}`), so it is visible
 * without JavaScript. Elements are paired with the initial render (the state the
 * block's golden locks) by DOM path; each paired element whose look differs gets
 * `data-anim-from` — the declarations of its initial state — which the
 * cremona-visual controller animates back to the markup. Unpaired elements stay
 * static.
 */
import {
  decode,
  elements,
  encodeAttr,
  parse,
  parseStyle,
  spliceAttributes,
  walk,
} from "./markup.mjs";

/** Properties the controller interpolates from `data-anim-from` to the markup's value. */
export const ANIMATED = new Set([
  "opacity",
  "transform",
  "translate",
  "scale",
  "rotate",
  "filter",
  "clip-path",
  "width",
  "height",
  "left",
  "top",
  "right",
  "bottom",
  "color",
  "background-color",
  "fill",
  "stroke",
  "fill-opacity",
  "stroke-opacity",
  "stop-opacity",
  "stop-color",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "r",
  "cx",
  "cy",
  "rx",
  "ry",
  "x",
  "y",
]);

/** Properties held for the whole animation (they shape it but are not interpolated). */
export const HELD = new Set(["transform-origin", "transform-box"]);

/** SVG presentation attributes that are CSS properties, per element. */
const PRESENTATION = new Set([
  "opacity",
  "fill",
  "stroke",
  "fill-opacity",
  "stroke-opacity",
  "stop-opacity",
  "stop-color",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
]);
const GEOMETRY = {
  r: ["circle"],
  cx: ["circle", "ellipse"],
  cy: ["circle", "ellipse"],
  rx: ["rect", "ellipse"],
  ry: ["rect", "ellipse"],
  x: ["rect", "image", "foreignobject", "svg", "use"],
  y: ["rect", "image", "foreignobject", "svg", "use"],
  width: ["rect", "image", "foreignobject", "use"],
  height: ["rect", "image", "foreignobject", "use"],
};
const SVG_TAGS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "stop",
  "use",
  "image",
  "foreignobject",
  "lineargradient",
  "radialgradient",
  "mask",
  "clippath",
  "pattern",
  "defs",
  "filter",
]);

/** Tailwind transform-origin utilities, for a transform that depends on the initial render's origin. */
const ORIGINS = {
  "origin-center": "center",
  "origin-top": "top",
  "origin-top-right": "top right",
  "origin-right": "right",
  "origin-bottom-right": "bottom right",
  "origin-bottom": "bottom",
  "origin-bottom-left": "bottom left",
  "origin-left": "left",
  "origin-top-left": "top left",
};

const NUMBER = /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i;

/** The element's declarations: CSS-mappable attributes, overridden by its inline style. */
function declarations(node) {
  const out = new Map();
  if (SVG_TAGS.has(node.tag)) {
    for (const [name, raw] of node.attrs) {
      const value = decode(raw);
      if (PRESENTATION.has(name)) out.set(name, value);
      else if (GEOMETRY[name]?.includes(node.tag))
        out.set(name, NUMBER.test(value) ? `${value}px` : value);
    }
  }
  for (const [prop, value] of parseStyle(decode(node.attrs.get("style") ?? "")))
    out.set(prop, value);
  return out;
}

const classes = (node) => new Set((node.attrs.get("class") ?? "").split(/\s+/).filter(Boolean));

/** A full-coverage end value for a clip-path shape whose final state is `none`. */
function openClip(value) {
  const circle = /^circle\(\s*[^\s)]+(.*)\)$/.exec(value);
  if (circle) return `circle(150%${circle[1]})`;
  const ellipse = /^ellipse\(\s*[^\s)]+\s+[^\s)]+(.*)\)$/.exec(value);
  if (ellipse) return `ellipse(150% 150%${ellipse[1]})`;
  if (/^inset\(/.test(value)) return "inset(0)";
  return null;
}

/**
 * Initial-state declarations of one element, relative to its final render.
 * Returns null when the element looks the same in both renders.
 */
export function initialState(final, initial, issues) {
  const f = declarations(final);
  const i = declarations(initial);
  const from = new Map();
  const to = new Map();
  let path = null;

  const drawn = initial.attrs.has("pathLength") && !final.attrs.has("pathLength");
  if (drawn) {
    // motion's pathLength: dash values are fractions of pathLength — the controller
    // rescales them to the element's length and ends on a full stroke
    path = decode(initial.attrs.get("pathLength"));
    for (const prop of ["stroke-dasharray", "stroke-dashoffset"]) {
      if (!i.has(prop)) continue;
      from.set(prop, i.get(prop));
      to.set(prop, prop === "stroke-dasharray" ? `${path} ${path}` : "0");
    }
  }

  for (const prop of new Set([...i.keys(), ...f.keys()])) {
    if (from.has(prop) || i.get(prop) === f.get(prop)) continue;
    if (!i.has(prop)) {
      issues?.push(`final-only ${prop}`);
      continue;
    }
    if (HELD.has(prop)) {
      from.set(prop, i.get(prop));
      continue;
    }
    if (!ANIMATED.has(prop)) {
      issues?.push(`not animatable ${prop}`);
      continue;
    }
    if (prop === "stroke-dasharray" && !f.has(prop)) {
      issues?.push("dasharray to none");
      continue;
    }
    from.set(prop, i.get(prop));
    if (prop === "clip-path" && !f.has(prop)) {
      const open = openClip(i.get(prop));
      if (!open) {
        from.delete(prop);
        issues?.push(`clip-path ${i.get(prop)}`);
      } else to.set(prop, open);
    }
  }

  const interpolated = [...from.keys()].some((p) => !HELD.has(p));
  if (!interpolated) return null;

  if (from.has("transform") || from.has("scale") || from.has("rotate")) {
    const finalClasses = classes(final);
    for (const c of classes(initial)) {
      if (ORIGINS[c] && !finalClasses.has(c) && !from.has("transform-origin"))
        from.set("transform-origin", ORIGINS[c]);
    }
  }
  return { from, to, path };
}

const signature = (n) => `${n.tag} ${n.attrs.get("class") ?? ""}`;

/** Longest common subsequence of two element lists, by tag and class attribute. */
function lcs(a, b) {
  const ka = a.map(signature);
  const kb = b.map(signature);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let x = a.length - 1; x >= 0; x--)
    for (let y = b.length - 1; y >= 0; y--)
      dp[x][y] = ka[x] === kb[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1]);
  const pairs = [];
  for (let x = 0, y = 0; x < a.length && y < b.length;) {
    if (ka[x] === kb[y]) {
      pairs.push([a[x], b[y]]);
      x++;
      y++;
    } else if (dp[x + 1][y] >= dp[x][y + 1]) x++;
    else y++;
  }
  return pairs;
}

const onlyChild = (n) => {
  const children = elements(n);
  return children.length === 1 ? children[0] : null;
};

/**
 * Pair the children of two paired elements: position when the tag sequences
 * agree, otherwise tag+class matches, then elements that one render wraps in an
 * extra element (motion wrappers). Returns [final, initial, initialWrapper?].
 */
function pairChildren(final, initial) {
  const fc = elements(final);
  const ic = elements(initial);
  if (fc.length === ic.length && fc.every((c, k) => c.tag === ic[k].tag))
    return fc.map((c, k) => [c, ic[k]]);
  const pairs = lcs(fc, ic);
  const usedF = new Set(pairs.map(([f]) => f));
  const usedI = new Set(pairs.map(([, i]) => i));
  for (const f of fc) {
    if (usedF.has(f)) continue;
    const wrapper = ic.find(
      (i) => !usedI.has(i) && onlyChild(i) && signature(onlyChild(i)) === signature(f),
    );
    if (wrapper) {
      pairs.push([f, onlyChild(wrapper), wrapper]);
      usedF.add(f);
      usedI.add(wrapper);
    }
  }
  for (const i of ic) {
    if (usedI.has(i)) continue;
    const wrapper = fc.find(
      (f) => !usedF.has(f) && onlyChild(f) && signature(onlyChild(f)) === signature(i),
    );
    if (wrapper) {
      pairs.push([onlyChild(wrapper), i]);
      usedF.add(wrapper);
      usedI.add(i);
    }
  }
  return pairs;
}

/** An initial-render wrapper's own hiding (opacity, filter) carried onto the element it wraps. */
function withWrapper(state, wrapper) {
  if (!wrapper) return state;
  const style = parseStyle(decode(wrapper.attrs.get("style") ?? ""));
  const from = new Map(state?.from ?? []);
  for (const prop of ["opacity", "filter"])
    if (style.has(prop) && !from.has(prop)) from.set(prop, style.get(prop));
  if (!from.size) return state;
  return { from, to: state?.to ?? new Map(), path: state?.path ?? null };
}

const text = (node) =>
  node.tag === "#text" ? decode(node.text ?? "") : node.children.map(text).join("");

/**
 * Text the initial render splits into animated pieces (per-word spans) while the
 * final render keeps it whole: the element takes the first piece's opacity/filter.
 */
function foldedPieces(final, initial) {
  if (elements(final).length || !elements(initial).length) return null;
  if (text(final).replace(/\s+/g, " ").trim() !== text(initial).replace(/\s+/g, " ").trim())
    return null;
  const first = elements(initial).find((c) => c.attrs.has("style"));
  if (!first) return null;
  const style = parseStyle(decode(first.attrs.get("style")));
  const from = new Map();
  for (const prop of ["opacity", "filter"]) if (style.has(prop)) from.set(prop, style.get(prop));
  return from.size ? { from, to: new Map(), path: null } : null;
}

const css = (map) => [...map].map(([p, v]) => `${p}:${v}`).join(";");

/**
 * Annotate the final render with the initial render's state.
 * @returns {{ html: string, animated: number, elements: number, paired: number, issues: string[] }}
 */
export function annotate(finalHtml, initialHtml) {
  const finalTree = parse(finalHtml);
  const initialTree = parse(initialHtml);
  const froots = elements(finalTree);
  const iroots = elements(initialTree);
  if (froots.length !== 1) throw new Error(`expected one root element, got ${froots.length}`);
  const insertions = [];
  const issues = [];
  let animated = 0;
  let paired = 0;

  const visit = (final, initial, wrapper) => {
    paired++;
    const state = withWrapper(
      initialState(final, initial, issues) ?? foldedPieces(final, initial),
      wrapper,
    );
    if (state) {
      animated++;
      let extra = ` data-anim-from="${encodeAttr(css(state.from))}"`;
      if (state.to.size) extra += ` data-anim-to="${encodeAttr(css(state.to))}"`;
      if (state.path) extra += ` data-anim-path="${encodeAttr(state.path)}"`;
      insertions.push([final.insertAt, extra]);
    }
    for (const [f, i, wrapper] of pairChildren(final, initial)) visit(f, i, wrapper);
  };

  const root = froots[0];
  if (iroots.length === 1 && iroots[0].tag === root.tag) visit(root, iroots[0]);
  insertions.push([root.nameEnd, ' data-controller="cremona-visual"']);
  return {
    html: spliceAttributes(finalHtml, insertions),
    animated,
    elements: [...walk(finalTree)].length,
    paired,
    issues,
  };
}
