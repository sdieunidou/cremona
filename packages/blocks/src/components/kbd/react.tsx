import { Fragment, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface KbdProps extends VisualProps {
  keys?: string[];
  /** Text under the keys ("" hides it; default: a caption for the demo shortcuts). */
  caption?: string;
  /** Stays centred in the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const ARROWS = new Set(["↑", "↓", "←", "→"]);

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const keyClasses =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-muted px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-xs";

export function Kbd({
  keys = ["⌘"],
  caption,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: KbdProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  // Arrow keys are alternatives, not a chord: no "+" between them.
  const arrows = keys.length > 0 && keys.every((k) => ARROWS.has(k));
  const text = caption ?? (arrows ? "Navigate the results list" : "Open the command menu");

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("flex flex-col items-center gap-2", fill && "self-center")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="flex items-center gap-1">
          {keys.map((key, i) => (
            <Fragment key={`${key}-${i}`}>
              {i > 0 && !arrows && (
                <span aria-hidden="true" className="text-xs text-muted-foreground">
                  +
                </span>
              )}
              <kbd className={keyClasses}>{key}</kbd>
            </Fragment>
          ))}
        </div>
        {text && <p className="text-xs text-muted-foreground">{text}</p>}
      </motion.div>
    </div>
  );
}
