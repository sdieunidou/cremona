/**
 * Generic golden parity runner shared by every block test.
 *
 * Renders the React component for each golden variant (initial "hidden" state,
 * like the POC SSR snapshots) and compares the DOM structure against the
 * extracted golden HTML.
 */
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentType } from "react";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  compare,
  findDivEnd,
  goldenVisual,
  parseHtmlFragment,
} from "./parity.js";

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
    .replace(/([\[,:]\s*)\.(\d)/g, "$10.$2");
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

/**
 * Serialize resolved props to JSON. Lucide icon components become
 * "lucide:<DisplayName>" strings (deserialized by the gallery/MCP via a registry).
 */
function serializeProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    out[k] = serializeValue(v);
  }
  return out;
}

function serializeValue(v: unknown): unknown {
  if (Array.isArray(v)) return v.map((item) => serializeValue(item));
  if (v && typeof v === "object") {
    const name = componentDisplayName(v);
    if (name) return `lucide:${name}`;
    // plain object: recurse (icons can be nested, e.g. items[{icon}])
    const out: Record<string, unknown> = {};
    for (const [k2, v2] of Object.entries(v)) out[k2] = serializeValue(v2);
    return out;
  }
  const name = componentDisplayName(v);
  if (typeof v === "function") return name ? `lucide:${name}` : null;
  return v;
}

/** lucide-react 1.x icons are forwardRef objects with a displayName. */
function componentDisplayName(v: unknown): string | null {
  if (v && (typeof v === "object" || typeof v === "function")) {
    const d = (v as { displayName?: unknown }).displayName;
    if (typeof d === "string") return d;
  }
  return null;
}

/** Write resolved variant props next to block.json (consumed by gallery + MCP). */
function writePreviewProps(blockDir: string, entries: { label: string; props: Record<string, unknown> }[]): void {
  try {
    const { writeFileSync } = require("node:fs") as typeof import("node:fs");
    const byLabel: Record<string, Record<string, unknown>> = {};
    for (const e of entries) byLabel[e.label] = e.props;
    writeFileSync(join(blockDir, "preview-props.json"), JSON.stringify(byLabel, null, 2) + "\n");
  } catch {
    // non-fatal: preview-props.json is an optimization, not a correctness gate
  }
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
  const meta: BlockGoldenInfo["meta"] = JSON.parse(readFileSync(join(blockDir, "block.json"), "utf8"));

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
        resolved.push({ label: g.label, props });
        const ours = renderToStaticMarkup(<Component animated trigger="inViewRepeat" {...props} />);
        const diffs = compare(
          parseHtmlFragment(goldenInner),
          parseHtmlFragment(ours),
        ).filter((d) => !ignoreAttrs.some((a) => d.message.includes(`attr ${a}`)));
        if (diffs.length) {
          const shown = diffs
            .slice(0, opts.maxDiffs ?? 10)
            .map((d) => `  ${d.path}: ${d.message}`)
            .join("\n");
          throw new Error(`parity diff (${diffs.length}) for "${g.label}":\n${shown}`);
        }
        expect(diffs).toHaveLength(0);
      });
    }

    afterAll(() => {
      writePreviewProps(
        blockDir,
        resolved.map((r) => ({ label: r.label, props: serializeProps(r.props) })),
      );
    });
  });
}
