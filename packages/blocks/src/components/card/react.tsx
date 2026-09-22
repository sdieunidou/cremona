import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CardProps extends VisualProps {
  title?: string;
  description?: string;
  footer?: string;
  badge?: string;
  action?: string;
  skeleton?: boolean;
}

const entrance = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
} as const;

const rowIn = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

export function Card({
  title = "Usage this month",
  description = "API calls across every region, refreshed hourly.",
  footer = "Updated 4 minutes ago",
  badge = "Pro plan",
  action = "View report",
  skeleton = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CardProps) {
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
        className={cn("w-full", !fill && "max-w-80", "rounded-xl border bg-card text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="flex flex-col gap-1.5 p-5">
          <div className="flex items-center justify-between">
            {skeleton ? (
              <div className="h-3.5 w-28 rounded-full bg-muted-foreground/15" />
            ) : (
              <p className="text-sm font-semibold text-foreground">{title}</p>
            )}
            {badge && (
              <span className="inline-flex h-4.5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          {skeleton ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="h-2.5 w-full rounded-full bg-muted-foreground/10" />
              <div className="h-2.5 w-4/5 rounded-full bg-muted-foreground/10" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <motion.div
          className="flex flex-col gap-2 border-t px-5 py-3.5"
          variants={animated ? rowIn : undefined}
          {...state}
        >
          {skeleton ? (
            <>
              <div className="h-2 w-3/4 rounded-full bg-muted-foreground/10" />
              <div className="h-2 w-1/2 rounded-full bg-muted-foreground/10" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Requests</span>
                <span className="font-semibold text-foreground tabular-nums">1.2M</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Errors</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  0.02%
                </span>
              </div>
            </>
          )}
        </motion.div>
        <div className="flex items-center justify-between border-t px-5 py-2.5">
          {skeleton ? (
            <div className="h-2 w-24 rounded-full bg-muted-foreground/10" />
          ) : (
            <span className="text-[11px] text-muted-foreground">{footer}</span>
          )}
          {action && !skeleton && (
            <span className="text-[11px] font-medium text-primary">{action}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
