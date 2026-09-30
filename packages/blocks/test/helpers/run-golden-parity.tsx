/**
 * Generic golden parity runner shared by every block test.
 *
 * Renders the React component for each golden variant (initial "hidden" state,
 * like the POC SSR snapshots) and compares the DOM structure against the
 * extracted golden HTML.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, isValidElement, type ComponentType } from "react";
import * as lucide from "lucide-react";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compare, findDivEnd, goldenVisual, parseHtmlFragment } from "./parity.js";

export interface VariantSpec {
  label: string;
  props?: Record<string, unknown>;
  /** skip parity for this variant (e.g. interactive-only previews) */
  skip?: boolean;
}

export interface BlockGoldenInfo {
  /** block.json contents */
  meta: { variants: { label: string; slug: string; propsRaw: string; size?: string | null }[] };
}

/** Minimal JS-literal parser for propsRaw from the minified page chunks. */
export function parsePropsRaw(raw: string): Record<string, unknown> {
  if (!raw || raw === "{}") return {};
  let s = raw
    .replace(/`/g, '"')
    .replace(/!0\b/g, "true")
    .replace(/!1\b/g, "false")
    // leading-dot floats: [.7 -> [0.7, ,.5 -> ,0.5, :.3 -> :0.3
    .replace(/([[,:]\s*)\.(\d)/g, "$10.$2");
  // quote unquoted keys
  s = s.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3');
  try {
    return JSON.parse(s);
  } catch {
    // last resort: identifiers (icons/functions) become null
    s = s.replace(/([{,]\s*"[A-Za-z_$][\w$]*"\s*:\s*)([A-Za-z_$][\w$.]*)/g, "$1null");
    return JSON.parse(s);
  }
}

/** Resolve props for a variant: parsed raw props, overridden by the test. */
function resolveProps(
  variant: BlockGoldenInfo["meta"]["variants"][number],
  spec?: VariantSpec,
): Record<string, unknown> {
  if (spec?.props) return spec.props;
  const parsed = parsePropsRaw(variant.propsRaw ?? "");
  // identifiers (icon components etc.) resolved to null by the parser: drop them
  for (const [k, v] of Object.entries(parsed)) {
    if (v === null) delete parsed[k];
  }
  return parsed;
}

/** displayName of every lucide-react icon — the only components preview props may carry. */
const LUCIDE = new Set(
  Object.values(lucide)
    .map((v) => (v as { displayName?: unknown }).displayName)
    .filter((d): d is string => typeof d === "string"),
);

/**
 * Serialize resolved props to JSON. Icon components become "lucide:<Name>";
 * icon elements (<Icon className=… />) become { $element: "lucide:<Name>", props }.
 * Anything else that JSON cannot carry fails the test instead of being written.
 */
function serializeProps(props: Record<string, unknown>, path = "props"): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) out[k] = serializeValue(v, `${path}.${k}`);
  return out;
}

function iconName(v: unknown, path: string): string {
  const name = (v as { displayName?: unknown } | null)?.displayName;
  if (typeof name !== "string" || !LUCIDE.has(name))
    throw new Error(`preview props: ${path} is a component that is not a lucide icon`);
  return `lucide:${name}`;
}

function serializeValue(v: unknown, path: string): unknown {
  if (isValidElement(v)) {
    const { children, ...rest } = (v.props ?? {}) as Record<string, unknown>;
    const type = typeof v.type === "string" ? v.type : iconName(v.type, path);
    const out: Record<string, unknown> = {
      $element: type,
      props: serializeProps(rest, `${path}.props`),
    };
    if (children !== undefined)
      out.children = (Array.isArray(children) ? children : [children]).map((c, i) =>
        serializeValue(c, `${path}.children[${i}]`),
      );
    return out;
  }
  if (Array.isArray(v)) return v.map((item, i) => serializeValue(item, `${path}[${i}]`));
  if (typeof v === "function") return iconName(v, path);
  if (v && typeof v === "object") {
    if ((v as { $$typeof?: unknown }).$$typeof) return iconName(v, path); // forwardRef icon
    const proto = Object.getPrototypeOf(v);
    if (proto !== Object.prototype && proto !== null)
      throw new Error(`preview props: ${path} is not a plain object`);
    return serializeProps(v as Record<string, unknown>, path);
  }
  return v;
}

/** Inverse of serializeValue — what the gallery and MCP consumers do with the JSON. */
const ICONS = new Map(
  Object.values(lucide)
    .filter((v) => typeof (v as { displayName?: unknown }).displayName === "string")
    .map((v) => [`lucide:${(v as { displayName: string }).displayName}`, v as never]),
);
function hydrate(v: unknown): unknown {
  if (typeof v === "string" && v.startsWith("lucide:")) return ICONS.get(v);
  if (Array.isArray(v)) return v.map(hydrate);
  if (v && typeof v === "object") {
    const el = v as { $element?: string; props?: Record<string, unknown>; children?: unknown[] };
    if (typeof el.$element === "string") {
      const type = el.$element.startsWith("lucide:") ? ICONS.get(el.$element) : el.$element;
      return createElement(
        type as never,
        hydrate(el.props ?? {}) as never,
        ...((el.children ?? []).map(hydrate) as never[]),
      );
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, hydrate(x)]));
  }
  return v;
}

/** Write resolved variant props next to block.json (consumed by gallery + MCP). */
function writePreviewProps(
  blockDir: string,
  entries: { label: string; props: Record<string, unknown> }[],
): void {
  const byLabel: Record<string, Record<string, unknown>> = {};
  for (const e of entries) byLabel[e.label] = e.props;
  writeFileSync(join(blockDir, "preview-props.json"), JSON.stringify(byLabel, null, 2) + "\n");
}

export interface RunParityOptions {
  blockDir: string; // absolute path to packages/blocks/src/<cat>/<block>
  Component: ComponentType<Record<string, unknown>>;
  /** extra per-variant prop overrides (matched by golden label) */
  variants?: VariantSpec[];
  /** visual root selector prefix inside the golden frame */
  rootClass?: string;
  /** ignore these attribute keys during comparison */
  ignoreAttrs?: string[];
  /** max diffs printed */
  maxDiffs?: number;
}

export function runGoldenParity(name: string, opts: RunParityOptions): void {
  const {
    blockDir,
    Component,
    variants = [],
    rootClass = 'class="relative isolate flex size-full',
    ignoreAttrs = [],
  } = opts;
  const goldenDir = join(blockDir, "golden");
  const meta: BlockGoldenInfo["meta"] = JSON.parse(
    readFileSync(join(blockDir, "block.json"), "utf8"),
  );

  describe(`golden parity: ${name}`, () => {
    const goldens = meta.variants.filter((v) => existsSync(join(goldenDir, `${v.slug}.html`)));
    it("has golden variants", () => {
      expect(goldens.length).toBeGreaterThan(0);
    });

    const resolved: { label: string; props: Record<string, unknown> }[] = [];

    for (const g of goldens) {
      const spec = variants.find((v) => v.label === g.label);
      it(`matches golden: ${g.label}`, () => {
        if (spec?.skip) return;
        const html = readFileSync(join(goldenDir, `${g.slug}.html`), "utf8");
        const rootStart = html.indexOf(`<div aria-hidden="true" ${rootClass}`);
        let goldenInner: string;
        if (rootStart === -1) {
          goldenInner = goldenVisual(html);
        } else {
          const end = findDivEnd(html, rootStart);
          goldenInner = html.slice(rootStart, end);
        }
        const props = resolveProps(g, spec);
        const ours = renderToStaticMarkup(<Component animated trigger="inViewRepeat" {...props} />);
        const diffs = compare(parseHtmlFragment(goldenInner), parseHtmlFragment(ours)).filter(
          (d) => !ignoreAttrs.some((a) => d.message.includes(`attr ${a}`)),
        );
        if (diffs.length) {
          const shown = diffs
            .slice(0, opts.maxDiffs ?? 10)
            .map((d) => `  ${d.path}: ${d.message}`)
            .join("\n");
          throw new Error(`parity diff (${diffs.length}) for "${g.label}":\n${shown}`);
        }
        expect(diffs).toHaveLength(0);
        // the JSON written for the gallery/MCP must render exactly like the in-memory props
        const json = JSON.parse(JSON.stringify(serializeProps(props))) as Record<string, unknown>;
        const replay = renderToStaticMarkup(
          <Component
            animated
            trigger="inViewRepeat"
            {...(hydrate(json) as Record<string, unknown>)}
          />,
        );
        expect(replay, `preview-props round-trip for "${g.label}"`).toBe(ours);
        resolved.push({ label: g.label, props });
      });
    }

    afterAll(() => {
      // a filtered (-t) or failing run must not truncate the file
      if (resolved.length !== goldens.length) return;
      writePreviewProps(
        blockDir,
        resolved.map((r) => ({ label: r.label, props: serializeProps(r.props) })),
      );
    });
  });
}
