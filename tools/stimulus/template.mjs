/**
 * One Stimulus template: the block's final render, annotated with its initial
 * state, ids namespaced per template, media paths made root-absolute.
 */
import { annotate } from "./annotate.mjs";
import { decode, encodeAttr, parseStyle } from "./markup.mjs";

/** Id prefix of a template: `cr-<category>-<file>-<variant index>-`. */
export function templatePrefix(key, slug) {
  return `cr-${key.replace("/", "-")}-${slug.split("-")[0]}-`;
}

const ID_LISTS = new Set([
  "for",
  "headers",
  "list",
  "form",
  "aria-activedescendant",
  "aria-controls",
  "aria-describedby",
  "aria-details",
  "aria-errormessage",
  "aria-flowto",
  "aria-labelledby",
  "aria-owns",
]);

/**
 * Prefix every id a block hard-codes (React's useId values already carry the
 * prefix) and every reference to it, so templates can share a page.
 */
export function namespaceIds(html, prefix) {
  const ids = new Map();
  for (const [, id] of html.matchAll(/\sid="([^"]+)"/g))
    if (!id.startsWith(`_${prefix}`)) ids.set(id, `${prefix}${id}`);
  if (!ids.size) return html;
  const ref = (value) =>
    value.replace(/url\((&quot;|')?#([^)&']+)\1\)/g, (whole, quote = "", id) =>
      ids.has(id) ? `url(${quote}#${ids.get(id)}${quote})` : whole,
    );
  return html.replace(/(\s)([A-Za-z][\w:.-]*)="([^"]*)"/g, (whole, space, name, value) => {
    let next;
    if (name === "id") next = ids.get(value) ?? value;
    else if (ID_LISTS.has(name))
      next = value
        .split(" ")
        .map((token) => ids.get(token) ?? token)
        .join(" ");
    else if ((name === "href" || name === "xlink:href") && value.startsWith("#"))
      next = ids.has(value.slice(1)) ? `#${ids.get(value.slice(1))}` : value;
    else next = ref(value);
    return `${space}${name}="${next}"`;
  });
}

/** React 19 hoists `<link rel="preload" as="image">` hints for images: not part of the visual. */
export function stripResourceHints(html) {
  return html.replace(/<link rel="preload"[^>]*\/>/g, "");
}

/** Utilities that set only `display`, whatever their variants. */
const DISPLAY = new Set([
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "contents",
  "flow-root",
  "hidden",
  "table",
  "inline-table",
  "list-item",
]);
/** Utilities that set only a property an inline style can also set, whatever their variants. */
const OVERRIDDEN = {
  display: (utility) => DISPLAY.has(utility),
  "transform-origin": (utility) => utility.startsWith("origin-"),
};

/** The utility of a class token, without its variants (`md:hover:flex` gives `flex`). */
function utility(token) {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i++) {
    if (token[i] === "[") depth++;
    else if (token[i] === "]") depth--;
    else if (token[i] === ":" && depth === 0) cut = i;
  }
  return token.slice(cut + 1).replace(/^[!-]+/, "");
}

/** A declaration as a Tailwind v4 arbitrary-property class: `_` is a space, `\_` an underscore. */
function propertyClass(property, value) {
  if (/[[\]"'\\]|!important/.test(value) || !/^[a-z]+(-[a-z]+)*$/.test(property))
    throw new Error(`style declaration without a class form: ${property}:${value}`);
  return `[${property}:${value.replace(/_/g, "\\_").replace(/\s+/g, "_")}]`;
}

/**
 * Replace every inline `style` attribute with arbitrary-property classes appended to the
 * element's classes: the markup then needs no `style-src 'unsafe-inline'`. A class that sets only
 * a property the inline style also set (`flex` next to `display: none`) is dropped: inline won,
 * a class would not.
 */
export function stylesToClasses(html) {
  return html.replace(/<[A-Za-z][^\s>/]*(?:\s[^>]*?)?\sstyle="[^"]*"[^>]*>/g, (tag) => {
    const attr = (name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
    const declarations = parseStyle(decode(attr("style")[1]));
    const existing = attr("class");
    const kept = decode(existing?.[1] ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => ![...declarations.keys()].some((p) => OVERRIDDEN[p]?.(utility(token))));
    const classes = [
      ...kept,
      ...[...declarations].map(([property, value]) => propertyClass(property, value)),
    ].join(" ");
    const named = ` class="${encodeAttr(classes)}"`;
    if (existing) return tag.replace(/\sstyle="[^"]*"/, "").replace(/\sclass="[^"]*"/, named);
    return tag.replace(/\sstyle="[^"]*"/, named);
  });
}

/**
 * Build one template.
 * @param {{ render: Function, parity: object }} renderer
 * @param {{ Component: Function, props: object, key: string, slug: string, golden: string }} variant
 */
export function buildTemplate(renderer, { Component, props, key, slug, golden }) {
  const initialProps = { ...props, animated: true, trigger: "inViewRepeat" };
  const reference = stripResourceHints(renderer.render(Component, initialProps));
  const diffs = renderer.parity.compare(
    renderer.parity.parseHtmlFragment(renderer.parity.goldenStage(golden)),
    renderer.parity.parseHtmlFragment(reference),
  );
  if (diffs.length)
    throw new Error(
      `initial render differs from its golden (${diffs.length} diffs, first: ${diffs[0].path}: ${diffs[0].message}) — run the block's parity test`,
    );

  const prefix = templatePrefix(key, slug);
  const final = stripResourceHints(
    renderer.render(Component, { ...props, animated: false }, prefix),
  );
  const initial = stripResourceHints(renderer.render(Component, initialProps, prefix));
  const result = annotate(final, initial);
  return { ...result, final, html: stylesToClasses(namespaceIds(result.html, prefix)) };
}
