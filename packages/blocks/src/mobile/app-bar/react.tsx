import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, MoreVertical, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface AppBarProps extends VisualProps {
  title?: string;
  large?: boolean;
  scrolled?: boolean;
}

const trailing: LucideIcon[] = [Search, MoreVertical];

const barIn = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const chipIn = (i: number): Variants => ({
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, delay: 0.15 + i * 0.07 },
  },
});

export function AppBar({
  title = "Photos",
  large = false,
  scrolled = false,
  animated = false,
  trigger = "inView",
  className,
}: AppBarProps) {
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
        className="w-full"
        variants={animated ? barIn : undefined}
        {...state}
      >
        <div
          className={cn(
            "relative flex h-12 w-full items-center gap-2 border-b bg-background px-3",
            scrolled ? "border-border shadow-sm" : "border-border/60",
          )}
        >
          <motion.button
            type="button"
            aria-label="Back"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted"
            variants={animated ? chipIn(0) : undefined}
            {...state}
          >
            <ChevronLeft className="size-4.5" strokeWidth={2} />
          </motion.button>
          {!large && (
            <p className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              {title}
            </p>
          )}
          {large && <div className="flex-1" />}
          <div className="flex items-center gap-1">
            {trailing.map((Icon, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={i === 0 ? "Search" : "More options"}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-muted"
                variants={animated ? chipIn(i + 1) : undefined}
                {...state}
              >
                <Icon className="size-4.5" strokeWidth={2} />
              </motion.button>
            ))}
          </div>
          {scrolled && (
            <div
              className="absolute inset-x-0 bottom-0 h-0.5 w-2/3 bg-primary"
              aria-hidden="true"
            />
          )}
        </div>
        {large && (
          <div className="w-full bg-background px-3 pb-2.5">
            <p className="text-2xl font-bold tracking-tight text-foreground">Library</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
