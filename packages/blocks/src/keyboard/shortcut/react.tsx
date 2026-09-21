import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const shortcutDefaultCopy: { keys: string[] } = {
  keys: ["⌘", "K"],
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const keycap: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 350, damping: 18, delay: 0.15 + index * 0.1 },
  }),
};

export interface ShortcutProps extends VisualProps {
  keys?: string[];
  isometric?: boolean;
}

export function Shortcut({
  keys = shortcutDefaultCopy.keys,
  animated = false,
  trigger = "inView",
  isometric = false,
  className,
}: ShortcutProps) {
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
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className="flex items-center gap-2.5"
        style={
          !animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined
        }
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        {keys.map((key, i) => (
          <motion.div
            key={`${key}-${i}`}
            className="rounded-xl border border-border/50 bg-muted/60 p-1 shadow-sm will-change-transform"
            variants={animated ? keycap : undefined}
            custom={i}
            {...state}
          >
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="flex min-w-11 items-center justify-center rounded-lg border bg-card bg-linear-to-b from-card via-card to-muted/25 px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-xs select-none hover:to-muted/45 active:translate-y-px active:to-muted/60 active:shadow-none"
            >
              {key}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
