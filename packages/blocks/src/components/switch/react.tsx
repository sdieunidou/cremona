import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SwitchProps extends VisualProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
}

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
        className="flex w-fit items-center gap-3"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <label
          htmlFor="cremona-switch-demo"
          className={cn(
            "text-sm font-medium text-foreground",
            disabled && "opacity-50",
          )}
        >
          {label}
        </label>
        <button
          id="cremona-switch-demo"
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            checked ? "bg-primary" : "bg-input",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <motion.span
            className="mx-0.5 inline-block size-4 rounded-full bg-background shadow-xs"
            initial={{ x: checked ? 16 : 0 }}
            animate={{ x: checked ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        </button>
      </motion.div>
    </div>
  );
}
