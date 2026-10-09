/**
 * preview-props.json — the props of every variant of a block, keyed by variant label — as the
 * tests, the gallery and the Stimulus generator read it: a lucide icon component is the string
 * "lucide:<Name>", an element is { "$element": "lucide:<Name>" | "<tag>", "props": …, "children": … }.
 */
import { createElement } from "react";
import * as lucide from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Props = Record<string, unknown>;

const ICONS = new Map(
  Object.values(lucide)
    .filter((v) => typeof (v as { displayName?: unknown }).displayName === "string")
    .map((v) => [`lucide:${(v as { displayName: string }).displayName}`, v as never]),
);

/** JSON values back to props: icons and `{ $element }` elements. */
export function hydrateProps(v: unknown): unknown {
  if (typeof v === "string" && v.startsWith("lucide:")) {
    const icon = ICONS.get(v);
    if (!icon) throw new Error(`preview props: ${v} is not a lucide-react icon`);
    return icon;
  }
  if (Array.isArray(v)) return v.map(hydrateProps);
  if (v && typeof v === "object") {
    const el = v as { $element?: string; props?: Props; children?: unknown[] };
    if (typeof el.$element === "string") {
      const type = el.$element.startsWith("lucide:") ? ICONS.get(el.$element) : el.$element;
      if (!type) throw new Error(`preview props: ${el.$element} is not a lucide-react icon`);
      return createElement(
        type as never,
        hydrateProps(el.props ?? {}) as never,
        ...((el.children ?? []).map(hydrateProps) as never[]),
      );
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, hydrateProps(x)]));
  }
  return v;
}

/** The raw preview-props.json of a block folder. */
export function readPreviewProps(blockDir: string): Record<string, Props> {
  const path = join(blockDir, "preview-props.json");
  if (!existsSync(path))
    throw new Error(`${path} is missing: a block needs the props of its variants`);
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, Props>;
}
