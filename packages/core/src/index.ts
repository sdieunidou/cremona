/**
 * @cremona/core — framework-agnostic constants, types and helpers shared by
 * the React and Stimulus adapters.
 */

/** When the entry animation should play. */
export type TriggerMode = "mount" | "inView" | "inViewRepeat";

/** Props shared by every Cremona visual. */
export interface VisualProps {
  /** Play the entrance animation (default true). When false, render the final state. */
  animated?: boolean;
  /** How the entrance is triggered. */
  trigger?: TriggerMode;
  className?: string;
}

/** The isometric transform used by the `isometric` variant family. */
export const ISO_HIDDEN = "rotateX(0deg) rotateZ(0deg)";
export const ISO_VISIBLE = "rotateX(45deg) rotateZ(-45deg)";
export const ISO_TRANSITION = { duration: 0.5, ease: "easeOut" } as const;

/** The rainbow gradient used by card glows (red→violet). */
export const RAINBOW_GRADIENT =
  "linear-gradient(to right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))";

/** Entry-state token set, common to many blocks (extracted from the POC). */
export const EASE_OUT = "easeOut";

export interface VariantDef {
  /** Human label shown under the preview frame. */
  label: string;
  /** File slug of the golden reference (without extension). */
  slug?: string;
  /** Props passed to the visual for this variant. */
  props?: Record<string, unknown>;
  /** Preview frame height preset. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export interface BlockMeta {
  category: string;
  file: string;
  name: string;
  description: string;
  added: string;
  kind: "block" | "layout" | "component";
  sourcePath: string;
  page: { cols: number; animated: boolean; trigger: string };
  variants: VariantDef[];
}

export const FRAME_HEIGHTS: Record<string, string> = {
  xs: "h-48",
  sm: "h-64",
  md: "h-96",
  lg: "h-[28rem]",
  xl: "h-[32rem]",
};

/** Grid classes per column count (matches the POC preview pages). */
export function gridCols(cols: number): string {
  switch (cols) {
    case 1:
      return "";
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-2 xl:grid-cols-3";
    case 4:
      return "lg:grid-cols-2 xl:grid-cols-4";
    default:
      return "lg:grid-cols-2";
  }
}

/** Tiny classname combiner (no dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
