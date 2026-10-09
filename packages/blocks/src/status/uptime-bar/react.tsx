"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type UptimeStatus = "operational" | "degraded" | "outage";

/** The demo window, whose headline reports its past outage as current. */
export const uptimeBarDefault = {
  incidents: [13, 14, 31, 49],
  outages: [22],
  status: "outage",
} as const;

const barColors: Record<"ok" | "degraded" | "outage", string> = {
  ok: "bg-success/85 dark:bg-success/80",
  degraded: "bg-warning/90",
  outage: "bg-destructive/85",
};

export interface UptimeBarLabels {
  /** Status line of each status. */
  operational: string;
  degraded: string;
  outage: string;
  /** Legend of the degraded and outage days. */
  legendDegraded: string;
  legendOutage: string;
  /** Start of the window; `{count}` is replaced by the number of days. */
  daysAgo: string;
  /** `daysAgo` when the count is one. */
  daysAgoOne: string;
  /** End of the window. */
  today: string;
}

export const uptimeBarDefaultLabels: UptimeBarLabels = {
  operational: "All systems operational",
  degraded: "Degraded performance",
  outage: "Major outage",
  legendDegraded: "Degraded",
  legendOutage: "Outage",
  daysAgo: "{count} days ago",
  daysAgoOne: "{count} day ago",
  today: "Today",
};

/** Replaces each `{key}` of a label with its value. */
function interpolate(label: string, values: Record<string, string>): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key]! : match,
  );
}

const statusMeta: Record<UptimeStatus, { dot: string; ping: string; badge: string }> = {
  operational: {
    dot: "bg-success",
    ping: "bg-success/60",
    badge: "border-success/20 bg-success/10 text-success",
  },
  degraded: {
    dot: "bg-warning",
    ping: "bg-warning/60",
    badge: "border-warning/20 bg-warning/10 text-warning",
  },
  outage: {
    dot: "bg-destructive",
    ping: "bg-destructive/60",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

const card = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.5 },
  },
} as const;

const barsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.012, delayChildren: 0.25 } },
} as const;

const barAnim = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

export interface UptimeBarProps extends VisualProps {
  title?: string;
  /** Days in the window; the last one is today. */
  days?: number;
  uptime?: string;
  /** Day indexes (0 = oldest) with degraded performance. */
  incidents?: readonly number[];
  /** Day indexes (0 = oldest) with an outage. */
  outages?: readonly number[];
  /** The current status. Defaults to today's: the last day's outage or incident, else operational. */
  status?: UptimeStatus;
  showLegend?: boolean;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<UptimeBarLabels>;
  /** BCP 47 locale of the uptime and day count (default `"en-US"`). */
  locale?: string;
  isometric?: boolean;
  gradient?: boolean;
}

export function UptimeBar({
  title = "Uptime",
  days = 60,
  uptime,
  incidents,
  outages,
  status,
  showLegend = true,
  labels,
  locale = "en-US",
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: UptimeBarProps) {
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
  const loop = useLoopActive(ref, animated);
  const dayCount = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0;
  const inWindow = (day: number) => Number.isInteger(day) && day >= 0 && day < dayCount;
  const incidentSet = new Set((incidents ?? uptimeBarDefault.incidents).filter(inWindow));
  const outageSet = new Set((outages ?? uptimeBarDefault.outages).filter(inWindow));
  const downDays = new Set([...incidentSet, ...outageSet]).size;
  const text = { ...uptimeBarDefaultLabels, ...labels };
  const percent = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const computedUptime = dayCount
    ? percent.format(Number((((dayCount - downDays) / dayCount) * 100).toFixed(2)))
    : "—";
  const uptimeLabel = uptime ?? computedUptime;
  const today = dayCount - 1;
  const current: UptimeStatus =
    incidents === undefined && outages === undefined
      ? uptimeBarDefault.status
      : outageSet.has(today)
        ? "outage"
        : incidentSet.has(today)
          ? "degraded"
          : "operational";
  const shown: UptimeStatus = status && Object.hasOwn(statusMeta, status) ? status : current;
  const meta = statusMeta[shown];
  const daysAgo =
    new Intl.PluralRules(locale).select(dayCount) === "one" ? text.daysAgoOne : text.daysAgo;
  const hasIncidents = [...incidentSet].some((day) => !outageSet.has(day));
  const hasOutages = outageSet.size > 0;
  const footerAnim = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, delay: 0.6 + dayCount * 0.012, ease: "easeOut" },
    },
  } as const;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-80",
          "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fill && "flex h-full flex-col",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div
          className={cn(
            "relative flex flex-col gap-3 rounded-2xl border bg-card p-3.5 shadow-xs",
            fill && "flex-1",
          )}
        >
          <motion.div
            className="flex items-center justify-between"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span
                  className={cn("absolute inset-0 rounded-full", loop && "animate-ping", meta.ping)}
                />
                <span className={cn("relative size-2 rounded-full", meta.dot)} />
              </span>
              <span className="text-xs font-semibold text-foreground">{title}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{text[shown]}</span>
            </div>
            <motion.span
              className={cn(
                "rounded-full border px-1.75 py-px text-[9px] font-semibold",
                meta.badge,
              )}
              variants={animated ? badgeAnim : undefined}
              {...state}
            >
              {uptimeLabel}
            </motion.span>
          </motion.div>
          <motion.div
            className={cn("flex h-7 items-stretch gap-px", fill && "my-auto")}
            variants={animated ? barsAnim : undefined}
            {...state}
          >
            {Array.from({ length: dayCount }).map((_, i) => {
              const color = outageSet.has(i)
                ? barColors.outage
                : incidentSet.has(i)
                  ? barColors.degraded
                  : barColors.ok;
              return (
                <motion.div
                  key={i}
                  className={cn("flex-1 origin-bottom rounded-xs", color)}
                  variants={animated ? barAnim : undefined}
                />
              );
            })}
          </motion.div>
          <motion.div
            className="flex items-center justify-between text-[10px] font-medium text-muted-foreground"
            variants={animated ? footerAnim : undefined}
            {...state}
          >
            <span>
              {interpolate(daysAgo, { count: new Intl.NumberFormat(locale).format(dayCount) })}
            </span>
            {showLegend && (hasIncidents || hasOutages) && (
              <div className="flex items-center gap-2.5">
                {hasIncidents && (
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-warning" />
                    {text.legendDegraded}
                  </span>
                )}
                {hasOutages && (
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    {text.legendOutage}
                  </span>
                )}
              </div>
            )}
            <span>{text.today}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
