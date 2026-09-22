import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ProgressProps extends VisualProps {
  /** 0–100. Omit for an indeterminate bar. */
  value?: number;
  thin?: boolean;
  color?: "primary" | "success" | "warning" | "destructive";
}

const fillClasses: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Progress({
  value,
  thin = false,
  color = "primary",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value));
  const pct = `${clamped}%`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={cn("w-full", !fill && "max-w-64")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div
          role="progressbar"
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
              className="h-full w-2/5 rounded-full bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: ["-100%", "250%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : animated ? (
            <motion.div
              className={cn("h-full rounded-full", fillClasses[color])}
              initial={{ width: "0%" }}
              animate={{ width: pct }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
          ) : (
            <div
              className={cn("h-full rounded-full", fillClasses[color])}
              style={{ width: pct }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
