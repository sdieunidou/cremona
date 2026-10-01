"use client";

import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MiniPanelStat {
  label: string;
  value: string;
  change: string;
  /** Direction of `change` (default: "down" when `change` starts with a minus sign). */
  trend?: "up" | "down";
  /** Which way of `change` is good news, coloured green (default "up"; "down" for churn, latency…). */
  positive?: "up" | "down";
}

export interface MiniPanelLabels {
  /** Panel title. */
  title: string;
  /** Period pills: the plain one, then the highlighted one. */
  otherPeriod: string;
  period: string;
  /** Shown in the chart when `values` is empty. */
  empty: string;
}

export const miniPanelDefaultLabels: MiniPanelLabels = {
  title: "Overview",
  otherPeriod: "7d",
  period: "30d",
  empty: "No data",
};

export const miniPanelDefaultStats: MiniPanelStat[] = [
  { label: "Revenue", value: "$48.2k", trend: "up", change: "+12.4%" },
  { label: "Users", value: "2,418", trend: "up", change: "+8.1%" },
  { label: "Churn", value: "1.2%", trend: "down", change: "-0.4%" },
];

export interface MiniPanelProps extends VisualProps {
  /** Stat tiles, side by side (three in the demo). */
  stats?: readonly MiniPanelStat[];
  /** Chart bars in their own unit, scaled to the largest; zero, negative and non-finite values draw no bar. */
  values?: readonly number[];
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<MiniPanelLabels>;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

/** Demo bar heights, in % of the chart. */
const bars = [55, 40, 75, 50, 70, 35, 45, 48, 85, 60, 90, 45, 78, 95, 65];

function barHeights(values: readonly number[]): number[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const max = Math.max(0, ...clean);
  return clean.map((v) => (max > 0 && v > 0 ? Math.max(4, (v / max) * 100) : 0));
}

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

const panelAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, delay: 0.2, ease: "easeOut" },
  },
} as const;

const barAnim: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: (index: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.35, delay: 0.7 + index * 0.03, ease: "easeOut" },
  }),
};

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

const skeletonRows = [
  {
    dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
    line: "h-1 flex-1 rounded-full bg-muted-foreground/15",
    tail: "h-1 w-10 rounded-full bg-muted-foreground/25",
  },
  {
    dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
    line: "h-1 flex-1 rounded-full bg-muted-foreground/15",
    tail: "h-1 w-8 rounded-full bg-muted-foreground/25",
  },
  {
    dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
    line: "h-1 flex-1 rounded-full bg-muted-foreground/15",
    tail: "h-1 w-12 rounded-full bg-muted-foreground/25",
  },
] as const;

export function MiniPanel({
  stats = miniPanelDefaultStats,
  values,
  labels,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: MiniPanelProps) {
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
  const text = { ...miniPanelDefaultLabels, ...labels };
  const heights = values === undefined ? bars : barHeights(values);

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={`relative w-full${fill ? " flex h-full flex-col" : " max-w-80"} rounded-2xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <motion.div
          className={cn("relative rounded-xl border bg-background", fill ? "flex-1" : "h-64")}
          variants={animated ? panelAnim : undefined}
          {...state}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Activity className="size-3 text-primary" strokeWidth={2.5} />
                <span className="text-[10px] font-semibold text-foreground">{text.title}</span>
              </div>
              <div className="flex gap-1">
                <span className="rounded-full px-1.5 py-px text-[9px] font-medium text-muted-foreground">
                  {text.otherPeriod}
                </span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                  {text.period}
                </span>
              </div>
            </div>
            <div
              className="grid grid-cols-3 gap-2 border-b border-border/50 px-3 py-2.5"
              style={
                stats.length === 3
                  ? undefined
                  : { gridTemplateColumns: `repeat(${Math.max(1, stats.length)}, minmax(0, 1fr))` }
              }
            >
              {stats.map((stat, i) => {
                const down =
                  stat.trend === "up" || stat.trend === "down"
                    ? stat.trend === "down"
                    : /^\s*[-−]/.test(stat.change);
                const good = stat.positive === "down" ? down : !down;
                const TrendIcon = down ? TrendingDown : TrendingUp;
                const trendColor = good
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400";
                return (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-medium tracking-wider text-muted-foreground uppercase">
                      {stat.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    <span
                      className={cn("flex items-center gap-0.5 text-[9px] font-medium", trendColor)}
                    >
                      <TrendIcon className="size-2" strokeWidth={3} />
                      {stat.change}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-1 border-b border-border/50 px-3 py-2">
              <div className="flex flex-1 items-end justify-between gap-0.5 rounded-md bg-muted/60 p-3">
                {heights.length === 0 && (
                  <span className="m-auto text-[9px] font-medium text-muted-foreground">
                    {text.empty}
                  </span>
                )}
                {heights.map((height, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={animated ? barAnim : undefined}
                    className="w-1 origin-bottom rounded-sm bg-chart-3"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 px-3 py-2.5">
              {skeletonRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={row.dot} />
                  <div className={row.line} />
                  <div className={row.tail} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
