"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SkeletonProps extends VisualProps {
  layout?: "text" | "avatar" | "media" | "card";
  /** Number of bars in the text layout. */
  lines?: number;
  /** Text read by screen readers. */
  label?: string;
  /** Full width; the card layout also takes the full height. */
  fill?: boolean;
}

const NO_REF = { current: null };

const lineWidths = ["w-full", "w-4/5", "w-3/5", "w-2/3"];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Skeleton({
  layout = "text",
  lines = 4,
  label = "Loading…",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const pulse = useLoopActive(ref, animated);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const bar = cn("rounded-full bg-muted-foreground/10", pulse && "animate-pulse");
  const block = cn("bg-muted-foreground/10", pulse && "animate-pulse");
  const count = Math.max(1, Math.floor(lines));

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        role="status"
        className={cn(
          "w-full",
          !fill && "max-w-56",
          layout === "card"
            ? "rounded-xl border bg-card p-4 shadow-xs"
            : layout === "avatar"
              ? "flex items-center gap-3"
              : "flex flex-col gap-2.5",
          fill && layout !== "card" && "self-start",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <span className="sr-only">{label}</span>
        {layout === "text" &&
          Array.from({ length: count }, (_, i) => (
            <div key={i} className={cn("h-2.5", lineWidths[i % lineWidths.length], bar)} />
          ))}
        {layout === "avatar" && (
          <>
            <div className={cn("size-10 shrink-0 rounded-full", block)} />
            <div className="flex flex-1 flex-col gap-2">
              <div className={cn("h-2.5 w-1/2", bar)} />
              <div className={cn("h-2.5 w-3/4", bar)} />
            </div>
          </>
        )}
        {layout === "media" && (
          <>
            <div className={cn("aspect-video w-full rounded-lg", block)} />
            <div className={cn("h-2.5 w-3/4", bar)} />
            <div className={cn("h-2.5 w-1/2", bar)} />
          </>
        )}
        {layout === "card" && (
          <>
            <div className="flex items-center gap-3">
              <div className={cn("size-9 shrink-0 rounded-full", block)} />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className={cn("h-2.5 w-1/2", bar)} />
                <div className={cn("h-2 w-1/3", bar)} />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className={cn("h-2 w-full", bar)} />
              <div className={cn("h-2 w-5/6", bar)} />
              <div className={cn("h-2 w-2/3", bar)} />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
