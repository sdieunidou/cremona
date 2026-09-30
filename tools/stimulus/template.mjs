/**
 * One Stimulus template: the block's final render, annotated with its initial
 * state, ids namespaced per template, media paths made root-absolute.
 */
import { annotate } from "./annotate.mjs";

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

/** Placeholder media (`../../media/…`, relative to the gallery pages) as `/media/…`. */
export function absoluteMedia(html) {
  return html.replace(/(["(\s,]|&quot;)(?:\.\.\/)+media\//g, "$1/media/");
}

/** React 19 hoists `<link rel="preload" as="image">` hints for images: not part of the visual. */
export function stripResourceHints(html) {
  return html.replace(/<link rel="preload"[^>]*\/>/g, "");
}

/** The golden's visual root, extracted like the parity runner does. */
function goldenRoot(golden, parity) {
  const start = golden.indexOf('<div aria-hidden="true" class="relative isolate flex size-full');
  return start === -1
    ? parity.goldenVisual(golden)
    : golden.slice(start, parity.findDivEnd(golden, start));
}

/**
 * Build one template.
 * @param {{ render: Function, parity: object }} renderer
 * @param {{ Component: Function, props: object, key: string, slug: string, golden: string }} variant
 */
export function buildTemplate(renderer, { Component, props, key, slug, golden }) {
  const initialProps = { ...props, animated: true, trigger: "inViewRepeat" };
  const reference = renderer.render(Component, initialProps);
  const diffs = renderer.parity.compare(
    renderer.parity.parseHtmlFragment(goldenRoot(golden, renderer.parity)),
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
  return { ...result, final, html: absoluteMedia(namespaceIds(result.html, prefix)) };
}
