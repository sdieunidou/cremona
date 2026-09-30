/** Code access: lazy raw sources + usage-snippet generation. */
import type { BlockEntry } from "./discovery.js";

const reactRawModules = import.meta.glob<string>("../../../../packages/blocks/src/*/*/react.tsx", {
  query: "?raw",
  import: "default",
});
const stimRawModules = import.meta.glob<string>(
  "../../../../packages/stimulus/templates/*/*/*.html",
  { query: "?raw", import: "default" },
);

export function reactSourcePath(key: string): string | undefined {
  const path = `../../../../packages/blocks/src/${key}/react.tsx`;
  return reactRawModules[path] ? path : undefined;
}

export function loadReactSource(key: string): Promise<string | null> {
  const path = reactSourcePath(key);
  if (!path) return Promise.resolve(null);
  return reactRawModules[path]!();
}

export function stimulusTemplatePath(key: string, slug: string): string | undefined {
  const path = `../../../../packages/stimulus/templates/${key}/${slug}.html`;
  return stimRawModules[path] ? path : undefined;
}

export function loadStimulusTemplate(key: string, slug: string): Promise<string | undefined> {
  const path = stimulusTemplatePath(key, slug);
  if (!path) return Promise.resolve(undefined);
  return stimRawModules[path]!();
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** A preview-props value as a JS expression: "lucide:X" → `X`, { $element } → JSX. */
function jsExpr(value: unknown, icons: Set<string>): string {
  if (typeof value === "string") {
    if (!value.startsWith("lucide:")) return JSON.stringify(value);
    icons.add(value.slice(7));
    return value.slice(7);
  }
  if (value === null || typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `[${value.map((v) => jsExpr(v, icons)).join(", ")}]`;
  const element = value as {
    $element?: unknown;
    props?: Record<string, unknown>;
    children?: unknown[];
  };
  if (typeof element.$element === "string") {
    const tag = element.$element.startsWith("lucide:")
      ? jsExpr(element.$element, icons)
      : element.$element;
    const attrs = Object.entries(element.props ?? {})
      .map(([k, v]) => ` ${k}={${jsExpr(v, icons)}}`)
      .join("");
    const children = (element.children ?? []).map((c) => `{${jsExpr(c, icons)}}`).join("");
    return children ? `<${tag}${attrs}>${children}</${tag}>` : `<${tag}${attrs} />`;
  }
  const entries = Object.entries(value).map(
    ([k, v]) => `${IDENTIFIER.test(k) ? k : JSON.stringify(k)}: ${jsExpr(v, icons)}`,
  );
  return `{ ${entries.join(", ")} }`;
}

/** Build the React usage snippet for a variant (import + JSX with exact props). */
export function reactUsage(entry: BlockEntry, label: string): string {
  const props = entry.previewProps[label] ?? {};
  const icons = new Set<string>();
  const attrs = Object.entries(props).map(([k, v]) => {
    if (v === true) return k;
    // plain JSX attribute strings do not process escapes or entities
    if (typeof v === "string" && !v.startsWith("lucide:") && !/["\\\n&{}<>]/.test(v))
      return `${k}=${JSON.stringify(v)}`;
    return `${k}={${jsExpr(v, icons)}}`;
  });
  const importLines = [
    `import { ${entry.exportName} } from "@cremona/blocks/src/${entry.key}/react.js";`,
    ...(icons.size ? [`import { ${[...icons].join(", ")} } from "lucide-react";`] : []),
  ].join("\n");
  const body = attrs.length
    ? `<${entry.exportName}\n  animated\n  ${attrs.join("\n  ")}\n/>`
    : `<${entry.exportName} animated />`;
  return `${importLines}\n\n${body}`;
}
