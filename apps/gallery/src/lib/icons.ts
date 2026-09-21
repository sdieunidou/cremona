/** Deserialize preview props: "lucide:<Name>" strings back to icon components. */
import * as lucide from "lucide-react";
import type { ComponentType } from "react";

const registry = new Map<string, ComponentType<{ className?: string; strokeWidth?: number }>>();
for (const value of Object.values(lucide)) {
  const icon = value as { displayName?: string; $$typeof?: symbol };
  // lucide-react 1.x icons are forwardRef objects (function in older versions)
  const isComponent =
    typeof value === "function" || icon.$$typeof === Symbol.for("react.forward_ref");
  if (isComponent && icon.displayName) {
    registry.set(`lucide:${icon.displayName}`, value as never);
  }
}

export function isIconRef(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("lucide:");
}

export function resolveIcon(value: string): ComponentType<{ className?: string; strokeWidth?: number }> | null {
  return registry.get(value) ?? null;
}

/** Deep-clone props, converting icon refs into components. */
export function hydrateProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (isIconRef(v)) {
      out[k] = resolveIcon(v) ?? undefined;
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) => (typeof item === "object" && item !== null ? hydrateProps(item) : item));
    } else if (typeof v === "object" && v !== null) {
      out[k] = hydrateProps(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
