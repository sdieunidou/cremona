import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface SkeletonProps extends VisualProps {
  layout?: "text" | "avatar" | "media" | "card";
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Skeleton({
  layout = "text",
  animated = false,
  trigger = "inView",
  className,
}: SkeletonProps) {
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
        variants={animated ? entrance : undefined}
        {...state}
      >
        {layout === "text" && (
          <div className="flex w-full max-w-56 flex-col gap-2.5">
            <div className="h-2.5 w-full animate-pulse rounded-full bg-muted-foreground/10" />
            <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-muted-foreground/10" />
            <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-muted-foreground/10" />
            <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-muted-foreground/10" />
          </div>
        )}
        {layout === "avatar" && (
          <div className="flex w-full max-w-56 items-center gap-3">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted-foreground/10" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted-foreground/10" />
              <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        )}
        {layout === "media" && (
          <div className="flex w-full max-w-56 flex-col gap-2.5">
            <div className="aspect-video w-full animate-pulse rounded-lg bg-muted-foreground/10" />
            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted-foreground/10" />
            <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted-foreground/10" />
          </div>
        )}
        {layout === "card" && (
          <div className="w-full max-w-56 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted-foreground/10" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted-foreground/10" />
                <div className="h-2 w-1/3 animate-pulse rounded-full bg-muted-foreground/10" />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-2 w-full animate-pulse rounded-full bg-muted-foreground/10" />
              <div className="h-2 w-5/6 animate-pulse rounded-full bg-muted-foreground/10" />
              <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
