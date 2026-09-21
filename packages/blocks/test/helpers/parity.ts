/**
 * Golden parity testing: compare the DOM output of our React components against
 * the SSR snapshots extracted from the POC.
 *
 * Comparison is structural: tag tree, class multisets, style declarations,
 * attributes and text content. React useId values are normalized away.
 */
import { parseDocument } from "htmlparser2";

export interface PNode {
  tag: string; // "#text" for text nodes
  attrs: Record<string, string>;
  children: PNode[];
  text?: string;
}

const SVG_ID_RE = /_(?:R|r)_[A-Za-z0-9]+_/g;

export function parseHtmlFragment(html: string): PNode[] {
  const doc = parseDocument(html) as unknown as Record<string, unknown>;
  return childrenOf(doc);
}

function childrenOf(node: Record<string, unknown>): PNode[] {
  const children = (node.children as Record<string, unknown>[] | null) ?? [];
  const out: PNode[] = [];
  for (const child of children) {
    const type = child.type as string;
    if (type === "text") {
      const text = String(child.data ?? "").replace(/\s+/g, " ");
      if (text.trim()) out.push({ tag: "#text", attrs: {}, children: [], text: text.trim() });
    } else if (type === "tag" || type === "script" || type === "style") {
      const attrs: Record<string, string> = {};
      for (const [k, v] of Object.entries((child.attribs as Record<string, string>) ?? {})) {
        attrs[k] = String(v);
      }
      out.push({ tag: child.name as string, attrs, children: childrenOf(child) });
    }
  }
  return out;
}

/**
 * SVG presentational attributes that motion may write either as attributes or as
 * inline style declarations depending on version — visually equivalent either way.
 */
const SVG_PRESENTATIONAL = new Set([
  "opacity",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "transform",
  "pathlength",
]);

const SVG_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "g",
  "defs",
  "stop",
  "polyline",
  "polygon",
  "ellipse",
  "lineargradient",
  "radialgradient",
  "filter",
  "clippath",
  "mask",
]);

function parseStyle(style: string): string[] {
  return style
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.replace(SVG_ID_RE, "_ID_"));
}

function normAttrs(tag: string, attrs: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  if (SVG_TAGS.has(tag.toLowerCase())) {
    // coalesce presentational attrs + style into one sorted declaration list
    const decls = new Set<string>();
    for (const d of parseStyle(attrs.style ?? "")) decls.add(d);
    for (const [key, value] of Object.entries(attrs)) {
      const k = key.toLowerCase();
      if (k === "style") continue;
      if (SVG_PRESENTATIONAL.has(k)) {
        if (value !== "" && !value.includes(":")) decls.add(`${k}:${value.replace(SVG_ID_RE, "_ID_")}`);
      } else if (key === "class") {
        out[key] = value.split(/\s+/).filter(Boolean).sort().join(" ");
      } else {
        out[key] = value.replace(SVG_ID_RE, "_ID_");
      }
    }
    out["__decls"] = [...decls].sort().join(";");
    return out;
  }
  for (const [key, raw] of Object.entries(attrs)) {
    let value = raw;
    if (key === "class") {
      value = value.split(/\s+/).filter(Boolean).sort().join(" ");
    } else if (key === "style") {
      value = parseStyle(raw).sort().join(";");
    } else {
      value = value.replace(SVG_ID_RE, "_ID_");
    }
    out[key] = value;
  }
  return out;
}

export interface Diff {
  path: string;
  message: string;
}

/** Deep structural comparison. Returns list of differences (empty = equal). */
export function compare(a: PNode[], b: PNode[], path = ""): Diff[] {
  const diffs: Diff[] = [];
  if (a.length !== b.length) {
    diffs.push({
      path,
      message: `child count differs: ${a.length} vs ${b.length} (${describe(a)} vs ${describe(b)})`,
    });
    return diffs;
  }
  for (let i = 0; i < a.length; i++) {
    const na = a[i]!;
    const nb = b[i]!;
    if (na.tag !== nb.tag) {
      diffs.push({ path: `${path}/${i}`, message: `tag differs: <${na.tag}> vs <${nb.tag}>` });
      continue;
    }
    if (na.tag === "#text") {
      if (na.text !== nb.text) {
        diffs.push({ path: `${path}/${i}`, message: `text: "${na.text}" vs "${nb.text}"` });
      }
      continue;
    }
    const here = `${path}/${na.tag}[${i}]`;
    const aa = normAttrs(na.tag, na.attrs);
    const bb = normAttrs(nb.tag, nb.attrs);
    const keys = new Set([...Object.keys(aa), ...Object.keys(bb)]);
    for (const k of keys) {
      if (aa[k] !== bb[k]) {
        diffs.push({
          path: here,
          message: `attr ${k}: "${short(aa[k])}" vs "${short(bb[k])}"`,
        });
      }
    }
    diffs.push(...compare(na.children, nb.children, here));
  }
  return diffs;
}

function describe(nodes: PNode[]): string {
  return nodes
    .slice(0, 4)
    .map((n) => (n.tag === "#text" ? `"${(n.text ?? "").slice(0, 24)}"` : `<${n.tag}>`))
    .join(", ");
}

function short(v?: string): string {
  return (v ?? "").slice(0, 90);
}

/** Find the matching close for the <div ...> starting at `open` (index of '<div'). */
export function findDivEnd(source: string, open: number): number {
  const re = /<(\/?)div\b[^>]*?((?:\/)?)>/g;
  re.lastIndex = open;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (m[2]) continue; // self-closing (never for div, but safe)
    if (m[1]) {
      depth -= 1;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth += 1;
    }
  }
  throw new Error("unbalanced div");
}

/**
 * Extract the visual root element(s) from a golden preview frame:
 * the children of the `flex grow items-center gap-2` stage container.
 */
export function goldenVisual(goldenHtml: string): string {
  const stage = goldenHtml.indexOf('<div class="flex grow items-center gap-2');
  if (stage === -1) throw new Error("stage container not found in golden");
  const open = goldenHtml.indexOf("<div", goldenHtml.indexOf(">", stage));
  const end = findDivEnd(goldenHtml, open);
  return goldenHtml.slice(open, end);
}

/** The frame footer label of a golden preview. */
export function goldenLabel(goldenHtml: string): string {
  const m = /<div class="bg-muted\/25 px-2 py-2\.25[^"]*">([\s\S]*?)<\/div>/.exec(goldenHtml);
  return m ? m[1]! : "";
}
