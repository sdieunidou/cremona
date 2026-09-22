/** Code access: lazy raw sources + usage-snippet generation. */
import type { BlockEntry } from "./discovery.js";

const reactRawModules = import.meta.glob<string>(
  "../../../../packages/blocks/src/*/*/react.tsx",
  { query: "?raw", import: "default" },
);
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

function pascal(file: string): string {
  return file.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function jsxValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return `{${value}}`;
  if (typeof value === "boolean") return "";
  if (Array.isArray(value)) return `{${JSON.stringify(value)}}`;
  if (typeof value === "object" && value !== null) return `{${JSON.stringify(value)}}`;
  return `{${String(value)}}`;
}

/** Build the React usage snippet for a variant (import + JSX with exact props). */
export function reactUsage(entry: BlockEntry, label: string): string {
  const componentName = pascal(entry.meta.file);
  const props = entry.previewProps[entry.meta.variants.find((v) => v.label === label) ? label : label] ?? {};
  const icons = new Set<string>();
  const attrs: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" && v.startsWith("lucide:")) {
      icons.add(v.slice(7));
      attrs.push(`${k}={${v.slice(7)}}`);
    } else if (typeof v === "boolean") {
      if (v) attrs.push(k);
    } else if (typeof v === "number" || typeof v === "object") {
      if (v !== null) attrs.push(`${k}=${jsxValue(v)}`);
    } else if (v !== undefined && v !== null) {
      attrs.push(`${k}=${jsxValue(v)}`);
    }
  }
  const importLines = [
    `import { ${componentName} } from "@cremona/blocks/src/${entry.key}/react.js";`,
    ...(icons.size ? [`import { ${[...icons].join(", ")} } from "lucide-react";`] : []),
  ].join("\n");
  const body = attrs.length
    ? `<${componentName}\n  animated\n  ${attrs.join("\n  ")}\n/>`
    : `<${componentName} animated />`;
  return `${importLines}\n\n${body}`;
}

/** Props of one variant as raw data (hydrated: "lucide:X" resolved upstream). */
export function variantPropsOf(entry: BlockEntry, label: string): Record<string, unknown> {
  return entry.previewProps[label] ?? {};
}
