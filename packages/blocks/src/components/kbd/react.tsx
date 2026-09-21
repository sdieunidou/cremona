import { Fragment, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface KbdProps extends VisualProps {
  keys?: string[];
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const keyClasses =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-xs";

export function Kbd({
  keys = ["⌘"],
  animated = false,
  trigger = "inView",
  className,
}: KbdProps) {
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

  const navigates = keys.some((k) => k === "↑" || k === "↓");

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className="flex flex-col items-center gap-2"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="flex items-center gap-1">
          {keys.map((key, i) => (
            <Fragment key={`${key}-${i}`}>
              {i > 0 && (
                <span aria-hidden="true" className="text-xs text-muted-foreground">
                  +
                </span>
              )}
              <kbd className={keyClasses}>{key}</kbd>
            </Fragment>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {navigates ? "Navigate the results list" : "Open the command menu"}
        </p>
      </motion.div>
    </div>
  );
}
