"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type ProgressVariant = "default" | "success" | "warning" | "destructive";

export interface ProgressProps extends VisualProps {
  /** 0–100. Omit for an indeterminate bar. */
  value?: number;
  thin?: boolean;
  variant?: ProgressVariant;
  /** @deprecated Use `variant` ("primary" is `variant="default"`). */
  color?: "primary" | "success" | "warning" | "destructive";
  /** Accessible name of the bar. */
  label?: string;
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const fillClasses: Record<ProgressVariant, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const fillIn = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } },
} as const;

// Indeterminate bar (w-2/5): at rest it sits centred on the track; the loop sweeps it across.
const REST = "75%";

export function Progress({
  value,
  thin = false,
  variant,
  color,
  label = "Progress",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const indeterminate = value === undefined;
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const loop = useLoopActive(ref, animated && indeterminate);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const tone: ProgressVariant = variant ?? (!color || color === "primary" ? "default" : color);
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("w-full", fill ? "self-start" : "max-w-64")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : clamped}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            thin ? "h-1" : "h-2",
          )}
        >
          {indeterminate ? (
            <motion.div
              className={cn("h-full w-2/5 rounded-full", fillClasses[tone])}
              initial={{ x: REST }}
              animate={loop ? { x: ["-100%", "250%"] } : { x: REST }}
              transition={
                loop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }
              }
            />
          ) : (
            <motion.div
              className={cn(
                "h-full origin-left rounded-full transition-[width] duration-500 ease-out",
                fillClasses[tone],
              )}
              style={{ width: `${clamped}%` }}
              variants={animated ? fillIn : undefined}
              {...state}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
