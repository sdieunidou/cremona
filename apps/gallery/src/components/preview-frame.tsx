import type { ComponentType, ReactNode } from "react";
import { PREVIEW_FRAME, PREVIEW_STAGE, PREVIEW_FOOTER } from "../lib/shell-classes.js";
import { FRAME_HEIGHTS, cn } from "@cremona/core";

export interface PreviewFrameProps {
  label?: ReactNode;
  size?: string | null;
  className?: string;
  children: ReactNode;
}

/** Faithful reproduction of the POC preview frame. */
export function PreviewFrame({ label, size = "md", className, children }: PreviewFrameProps) {
  const height = FRAME_HEIGHTS[size ?? "md"] ?? FRAME_HEIGHTS.md!;
  return (
    <div className={cn(PREVIEW_FRAME, className)}>
      <div className={cn(PREVIEW_STAGE, height)}>
        {children}
      </div>
      {label != null && <div className={PREVIEW_FOOTER}>{label}</div>}
    </div>
  );
}

/** Home card (grid item) — POC-faithful. */
export function BlockCard({
  href,
  onClick,
  title,
  description,
  children,
}: {
  href: string;
  onClick?: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <a
      className="group flex flex-col overflow-hidden rounded-lg border border-border/50 hover:border-border active:border-border/75"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-muted/20 [content-visibility:auto] dark:bg-muted/15">
        {children}
      </div>
      <div className="border-t border-border/50 px-3 py-2.5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-0.75 line-clamp-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
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

export type { ComponentType };
