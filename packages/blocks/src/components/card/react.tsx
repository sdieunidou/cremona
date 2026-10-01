"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CardRow {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

export interface CardProps extends VisualProps {
  title?: string;
  description?: string;
  footer?: string;
  badge?: string;
  /** Footer action text. */
  action?: string;
  /** Footer action link target. */
  actionHref?: string;
  /** Label/value rows (default: API usage). */
  rows?: CardRow[];
  /** Loading placeholders instead of the content. */
  skeleton?: boolean;
  /** Full width and height of the box; the footer sticks to the bottom. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const demoRows: CardRow[] = [
  { label: "Requests", value: "1.2M" },
  { label: "Errors", value: "0.02%", tone: "success" },
];

const toneClasses: Record<string, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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
  actionHref,
  rows = demoRows,
  skeleton = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const pulse = useLoopActive(ref, animated && skeleton);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const bar = cn("rounded-full", pulse && "animate-pulse");
  const actionClasses = cn(
    "rounded-sm text-[11px] font-medium text-primary underline-offset-4 hover:underline",
    focusRing,
  );

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        aria-busy={skeleton || undefined}
        className={cn(
          "w-full",
          fill ? "flex flex-col" : "max-w-80",
          "rounded-xl border bg-card text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="flex flex-col gap-1.5 p-5">
          <div className="flex items-center justify-between">
            {skeleton ? (
              <div className={cn("h-3.5 w-28 bg-muted-foreground/15", bar)} />
            ) : (
              <p className="text-sm font-semibold text-foreground">{title}</p>
            )}
            {badge &&
              (skeleton ? (
                <div className={cn("h-4.5 w-14 bg-muted-foreground/10", bar)} />
              ) : (
                <span className="inline-flex h-4.5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-semibold text-primary">
                  {badge}
                </span>
              ))}
          </div>
          {skeleton ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <div className={cn("h-2.5 w-full bg-muted-foreground/10", bar)} />
              <div className={cn("h-2.5 w-4/5 bg-muted-foreground/10", bar)} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <motion.div
          className={cn("border-t px-5 py-3.5", fill && "flex-1")}
          variants={animated ? rowIn : undefined}
          {...state}
        >
          {skeleton ? (
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div
                  key={`${row.label}-${i}`}
                  className={cn("h-2 bg-muted-foreground/10", i % 2 ? "w-1/2" : "w-3/4", bar)}
                />
              ))}
            </div>
          ) : (
            <dl className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div
                  key={`${row.label}-${i}`}
                  className="flex items-center justify-between text-xs"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd
                    className={cn("font-semibold tabular-nums", toneClasses[row.tone ?? "default"])}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </motion.div>
        <div className="flex items-center justify-between border-t px-5 py-2.5">
          {skeleton ? (
            <div className={cn("h-2 w-24 bg-muted-foreground/10", bar)} />
          ) : (
            <span className="text-[11px] text-muted-foreground">{footer}</span>
          )}
          {action &&
            !skeleton &&
            (actionHref ? (
              <a href={actionHref} className={actionClasses}>
                {action}
              </a>
            ) : (
              <button type="button" className={actionClasses}>
                {action}
              </button>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
