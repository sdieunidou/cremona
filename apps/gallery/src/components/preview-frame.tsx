import type { ReactNode } from "react";
import { FRAME_HEIGHTS, cn } from "@cremona/core";
import { PREVIEW_FRAME, PREVIEW_STAGE, PREVIEW_FOOTER } from "../lib/shell-classes.js";
import { ErrorBoundary, PreviewError } from "./error-boundary.js";

export interface PreviewFrameProps {
  label?: ReactNode;
  /** Variant `size` from block.json: the stage height (xs…xl, default md). */
  size?: string | null;
  className?: string;
  /** Rendered inside the frame, before the stage (toolbar, code panel). */
  overlay?: ReactNode;
  /** Takes the stage out of focus and pointer reach (while the code panel covers it). */
  stageInert?: boolean;
  children: ReactNode;
}

/** The frame a variant is previewed in: a stage of the variant's height, a toolbar and its label. */
export function PreviewFrame({
  label,
  size,
  className,
  overlay,
  stageInert,
  children,
}: PreviewFrameProps) {
  const height = FRAME_HEIGHTS[size ?? "md"] ?? FRAME_HEIGHTS.md!;
  return (
    <div className={cn(PREVIEW_FRAME, className)}>
      {overlay}
      <div className={cn(PREVIEW_STAGE, height)} inert={stageInert}>
        <ErrorBoundary fallback={(error) => <PreviewError error={error} />}>
          {children}
        </ErrorBoundary>
      </div>
      {label != null && <div className={PREVIEW_FOOTER}>{label}</div>}
    </div>
  );
}

export function PreviewGrid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  const colsClass =
    cols === 1
      ? ""
      : cols === 3
        ? "lg:grid-cols-2 xl:grid-cols-3"
        : cols === 4
          ? "lg:grid-cols-2 xl:grid-cols-4"
          : "lg:grid-cols-2";
  return <div className={cn("grid grid-cols-1 gap-2", colsClass)}>{children}</div>;
}
