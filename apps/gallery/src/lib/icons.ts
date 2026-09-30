/** Deserialize preview props: "lucide:<Name>" strings back to icon components, { $element } back to elements. */
import { createElement, type ComponentType, type ReactNode } from "react";
import { ICONS } from "./icon-map.js";

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

export function isIconRef(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("lucide:");
}

export function resolveIcon(value: string): IconComponent | null {
  return (ICONS[value.slice("lucide:".length)] as IconComponent | undefined) ?? null;
}

/** Deep-clone props, converting icon refs into components (arrays stay arrays at every depth). */
export function hydrateProps(props: Record<string, unknown>): Record<string, unknown> {
  return hydrateValue(props) as Record<string, unknown>;
}

type ElementRef = { $element: string; props?: Record<string, unknown>; children?: unknown[] };
function isElementRef(value: unknown): value is ElementRef {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ElementRef).$element === "string"
  );
}

function hydrateValue(value: unknown): unknown {
  if (isIconRef(value)) return resolveIcon(value) ?? undefined;
  if (isElementRef(value)) {
    const type = isIconRef(value.$element) ? resolveIcon(value.$element) : value.$element;
    if (!type) return null;
    const props = hydrateValue(value.props ?? {}) as Record<string, unknown>;
    const children = (value.children ?? []).map(hydrateValue) as ReactNode[];
    return createElement(type, props, ...children);
  }
  if (Array.isArray(value)) return value.map(hydrateValue);
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = hydrateValue(v);
    return out;
  }
  return value;
}
