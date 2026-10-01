import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SwitchProps extends VisualProps {
  /** State on first render; clicking toggles it. */
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  /** A full-width row: the label at the start, the switch at the end. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Switch({
  checked = false,
  label = "Email notifications",
  disabled = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SwitchProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [on, setOn] = useState(checked);
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

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "flex items-center gap-3",
          fill ? "w-full justify-between self-start" : "w-fit",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <label
          htmlFor={id}
          className={cn("text-sm font-medium text-foreground", disabled && "opacity-50")}
        >
          {label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={on}
          disabled={disabled}
          onClick={() => setOn((v) => !v)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
            focusRing,
            on ? "bg-primary" : "bg-input",
          )}
        >
          <motion.span
            className="mx-0.5 inline-block size-4 rounded-full bg-background shadow-xs"
            initial={{ x: on ? 16 : 0 }}
            animate={{ x: on ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        </button>
      </motion.div>
    </div>
  );
}
