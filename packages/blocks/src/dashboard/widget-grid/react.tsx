"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ShoppingCart, TrendingUp, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface WidgetGridStat {
  label: string;
  value: string;
  /** A lucide icon component (default: the demo icon of that position). */
  icon?: LucideIcon;
}

export interface WidgetGridLabels {
  /** Title and period of the bar chart. */
  chartTitle: string;
  chartPeriod: string;
  /** Under the ring. */
  percentLabel: string;
  /** Shown in the chart when `values` is empty. */
  empty: string;
}

export const widgetGridDefaultLabels: WidgetGridLabels = {
  chartTitle: "Traffic",
  chartPeriod: "Last 9d",
  percentLabel: "Capacity",
  empty: "No data",
};

export const widgetGridDefaultStats: WidgetGridStat[] = [
  { icon: Users, label: "Users", value: "2.4k" },
  { icon: TrendingUp, label: "Growth", value: "+12%" },
  { icon: ShoppingCart, label: "Orders", value: "184" },
  { icon: Zap, label: "Active", value: "64" },
];

export interface WidgetGridProps extends VisualProps {
  /** Stat tiles (four in the demo, which share the first row). */
  stats?: readonly WidgetGridStat[];
  /** Chart bars in their own unit, scaled to the largest; zero, negative and non-finite values draw no bar. */
  values?: readonly number[];
  /** Ring fill, 0–100 (default 61); a non-finite value draws no arc and reads "—". */
  percent?: number;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<WidgetGridLabels>;
  /** BCP 47 locale of the ring percentage (default `"en-US"`). */
  locale?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const demoIcons: LucideIcon[] = [Users, TrendingUp, ShoppingCart, Zap];

/** Demo bar heights, in % of the chart. */
const bars = [50, 65, 40, 80, 55, 50, 35, 46, 75, 60, 90, 70];

function barHeights(values: readonly number[]): number[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const max = Math.max(0, ...clean);
  return clean.map((v) => (max > 0 && v > 0 ? Math.max(4, (v / max) * 100) : 0));
}

const skeletonRows = [
  { tail: "h-1 w-10 rounded-full bg-muted-foreground/25", width: "80%" },
  { tail: "h-1 w-8 rounded-full bg-muted-foreground/25", width: "55%" },
  { tail: "h-1 w-6 rounded-full bg-muted-foreground/25", width: "25%" },
  { tail: "h-1 w-12 rounded-full bg-muted-foreground/25", width: "70%" },
] as const;

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

const gridAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
} as const;

const cellAnim = {
  hidden: { opacity: 0, scale: 0.94, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const donutArcAnim = (arc: number) =>
  ({
    hidden: { strokeDasharray: "0 100" },
    visible: {
      strokeDasharray: `${arc} 100`,
      transition: { duration: 0.8, delay: 0.7, ease: "easeOut" },
    },
  }) as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 1.05, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 1.05, ease: "easeOut" },
  },
} as const;

export function WidgetGrid({
  stats = widgetGridDefaultStats,
  values,
  percent = 61,
  labels,
  locale = "en-US",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: WidgetGridProps) {
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
  const text = { ...widgetGridDefaultLabels, ...labels };
  const heights = values === undefined ? bars : barHeights(values);
  const known = Number.isFinite(percent);
  const arc = known ? Math.max(0, Math.min(100, percent)) : 0;
  const percentText = known
    ? new Intl.NumberFormat(locale, { style: "unit", unit: "percent", useGrouping: false }).format(
        Math.round(percent) || 0,
      )
    : "—";
  const tiles = stats.map((stat, i) => {
    const Icon = stat.icon ?? demoIcons[i % demoIcons.length]!;
    return (
      <motion.div
        key={i}
        variants={animated ? cellAnim : undefined}
        className="flex flex-col gap-0.5 rounded-xl border border-border/50 bg-background px-3 py-2"
      >
        <Icon className="size-3 text-primary" strokeWidth={2.5} />
        <span className="text-xs font-semibold text-foreground">{stat.value}</span>
        <span className="text-[8px] font-medium tracking-wider text-muted-foreground uppercase">
          {stat.label}
        </span>
      </motion.div>
    );
  });

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={`relative w-full${fill ? " flex h-full flex-col" : " max-w-90"} rounded-2xl border border-border/50 bg-muted/75 p-1.5 will-change-transform ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-12 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
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
          className={cn(
            "relative grid grid-cols-4 grid-rows-[auto_1fr_auto] gap-1.5",
            fill ? "flex-1" : "h-60",
          )}
          variants={animated ? gridAnim : undefined}
          {...state}
        >
          {stats.length === 4 ? (
            tiles
          ) : (
            // other counts share the first row in a grid of their own
            <div
              className="col-span-4 grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, stats.length)}, minmax(0, 1fr))`,
              }}
            >
              {tiles}
            </div>
          )}
          <motion.div
            variants={animated ? cellAnim : undefined}
            className="col-span-3 flex flex-col gap-1.5 rounded-xl border border-border/50 bg-background p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-foreground">{text.chartTitle}</span>
              <span className="text-[8px] text-muted-foreground">{text.chartPeriod}</span>
            </div>
            <div className="flex flex-1 items-end justify-between gap-0.5 rounded-md bg-muted/60 p-3">
              {heights.length === 0 && (
                <span className="m-auto text-[8px] text-muted-foreground">{text.empty}</span>
              )}
              {heights.map((height, i) => (
                <div
                  key={i}
                  className="w-1 rounded-sm bg-chart-3"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </motion.div>
          <motion.div
            variants={animated ? cellAnim : undefined}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/50 bg-background p-2"
          >
            <div className="relative size-12">
              <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  strokeWidth="5"
                  pathLength="100"
                  className="stroke-primary/15"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  strokeWidth="5"
                  pathLength="100"
                  strokeLinecap={arc > 0 ? "round" : "butt"}
                  className="stroke-primary"
                  strokeDasharray={animated ? undefined : `${arc} 100`}
                  variants={animated ? donutArcAnim(arc) : undefined}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-foreground">{percentText}</span>
              </div>
            </div>
            <span className="text-[8px] font-medium text-muted-foreground">
              {text.percentLabel}
            </span>
          </motion.div>
          <motion.div
            variants={animated ? cellAnim : undefined}
            className="col-span-4 flex flex-col gap-1.5 rounded-xl border border-border/50 bg-background p-2"
          >
            {skeletonRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                <div className="relative h-1 flex-1 rounded-full bg-muted-foreground/15">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-muted-foreground/40"
                    style={{ width: row.width }}
                  />
                </div>
                <div className={row.tail} />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
