/**
 * A tokenizer and tree for React's static markup (renderToStaticMarkup output).
 *
 * React writes well-formed markup: double-quoted, entity-escaped attribute values,
 * escaped text, `/>` for void and childless SVG elements. Nodes keep their source
 * offsets so attributes can be spliced into the original string byte for byte.
 */

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const RAW_TEXT = new Set(["script", "style"]);
const TAG = /<(\/?)([A-Za-z][A-Za-z0-9:-]*)((?:\s+[^\s"'>/=]+(?:="[^"]*")?)*)\s*(\/?)>/y;
const ATTR = /\s+([^\s"'>/=]+)(?:="([^"]*)")?/g;

/**
 * @typedef {{ tag: string, attrs: Map<string, string>, children: Node[], text?: string,
 *   nameEnd?: number, insertAt?: number, parent?: Node }} Node
 */

/** Parse markup into a tree; element nodes remember where new attributes can be inserted. */
export function parse(html) {
  /** @type {Node} */
  const root = { tag: "#root", attrs: new Map(), children: [] };
  const stack = [root];
  let i = 0;
  let textStart = 0;
  const flushText = (end) => {
    if (end > textStart) {
      const parent = stack[stack.length - 1];
      parent.children.push({
        tag: "#text",
        attrs: new Map(),
        children: [],
        text: html.slice(textStart, end),
      });
    }
  };
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) break;
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt);
      if (end === -1) throw new Error(`unterminated comment at ${lt}`);
      flushText(lt);
      i = textStart = end + 3;
      continue;
    }
    TAG.lastIndex = lt;
    const m = TAG.exec(html);
    if (!m) throw new Error(`malformed tag at ${lt}: ${html.slice(lt, lt + 60)}`);
    flushText(lt);
    const [whole, closing, name, rawAttrs, selfClosing] = m;
    const tag = name.toLowerCase();
    i = textStart = lt + whole.length;
    if (closing) {
      const open = stack.pop();
      if (!open || open.tag !== tag)
        throw new Error(`unbalanced </${tag}> at ${lt} (open: <${open?.tag}>)`);
      continue;
    }
    const attrs = new Map();
    for (const a of rawAttrs.matchAll(ATTR)) attrs.set(a[1], a[2] ?? "");
    const parent = stack[stack.length - 1];
    /** @type {Node} */
    const node = {
      tag,
      attrs,
      children: [],
      parent,
      nameEnd: lt + 1 + name.length,
      insertAt: lt + whole.length - (selfClosing ? 2 : 1),
    };
    parent.children.push(node);
    if (selfClosing || VOID.has(tag)) continue;
    if (RAW_TEXT.has(tag)) {
      const close = html.indexOf(`</${name}>`, i);
      if (close === -1) throw new Error(`unterminated <${tag}> at ${lt}`);
      node.children.push({
        tag: "#text",
        attrs: new Map(),
        children: [],
        text: html.slice(i, close),
      });
      i = textStart = close + name.length + 3;
      continue;
    }
    stack.push(node);
  }
  flushText(html.length);
  if (stack.length !== 1) throw new Error(`unclosed <${stack[stack.length - 1].tag}>`);
  return root;
}

/** Element children only. */
export function elements(node) {
  return node.children.filter((c) => c.tag !== "#text");
}

/** Every element of the tree, in document order. */
export function* walk(node) {
  for (const child of node.children) {
    if (child.tag === "#text") continue;
    yield child;
    yield* walk(child);
  }
}

const ENTITIES = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

/** Decode the entities React writes in attribute values. */
export function decode(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === "#")
      return String.fromCodePoint(
        body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : Number(body.slice(1)),
      );
    return ENTITIES[body] ?? whole;
  });
}

/** Encode a value for a double-quoted attribute. */
export function encodeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Split a CSS declaration list (`a:b;c:url(x;y)`) into [property, value] pairs. */
export function parseStyle(css) {
  const out = new Map();
  let depth = 0;
  let quote = "";
  let start = 0;
  const push = (end) => {
    const decl = css.slice(start, end);
    const colon = decl.indexOf(":");
    if (colon > 0) out.set(decl.slice(0, colon).trim().toLowerCase(), decl.slice(colon + 1).trim());
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) {
      push(i);
      start = i + 1;
    }
  }
  push(css.length);
  return out;
}

/** Insert `extra` (a string of ` name="value"` pairs) into each node's start tag. */
export function spliceAttributes(html, insertions) {
  const sorted = [...insertions].sort((a, b) => b[0] - a[0]);
  let out = html;
  for (const [at, extra] of sorted) out = out.slice(0, at) + extra + out.slice(at);
  return out;
}
