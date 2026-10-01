"use client";

import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const lineDefault = {
  title: "Active users",
  badge: "YTD",
  value: "12,481",
  change: "+24.1%",
  points: [0.18, 0.3, 0.22, 0.42, 0.36, 0.55, 0.48, 0.68, 0.62, 0.82, 0.78, 0.95],
  ticks: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
} as const;

const W = 240;
const H = 90;
const MAX_TICKS = 8;
const TICK_CHARS = 40;

/**
 * The series as heights between 0 (bottom) and 1 (top), `null` where a value is
 * missing. `points` already in 0..1 are used as they are; `values` — and
 * `points` outside 0..1 — are scaled to `min`..`max`, the series' own range by default.
 */
function toFractions(
  points: readonly number[],
  values?: readonly number[],
  min?: number,
  max?: number,
): (number | null)[] {
  const raw = values ?? points;
  const finite = raw.filter((v) => Number.isFinite(v));
  const fixedMin = typeof min === "number" && Number.isFinite(min);
  const fixedMax = typeof max === "number" && Number.isFinite(max);
  if (!values && !fixedMin && !fixedMax && finite.every((v) => v >= 0 && v <= 1))
    return raw.map((v) => (Number.isFinite(v) ? v : null));
  const lo = fixedMin ? min! : Math.min(...finite);
  const hi = fixedMax ? max! : Math.max(...finite);
  const span = hi - lo;
  return raw.map((v) =>
    Number.isFinite(v) ? (span > 0 ? Math.min(1, Math.max(0, (v - lo) / span)) : 0.5) : null,
  );
}

function toPoints(values: readonly (number | null)[]): [number, number][] {
  if (values.length === 1 && values[0] !== null) {
    const y = (1 - values[0]!) * 84 + 3;
    return [
      [0, y],
      [W, y],
    ];
  }
  const step = W / (values.length - 1);
  const points: [number, number][] = [];
  values.forEach((v, i) => {
    if (v !== null) points.push([i * step, (1 - v) * 84 + 3]);
  });
  return points;
}

function toPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0]![0]},${points[0]![1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]!;
    const [, py] = points[i - 1]!;
    const mx = (points[i - 1]![0] + x) / 2;
    d += ` C ${mx},${py} ${mx},${y} ${x},${y}`;
  }
  return d;
}

function areaPath(points: [number, number][], values: readonly (number | null)[]): string {
  if (points.length < 2) return "";
  const right = values[values.length - 1] === null ? points[points.length - 1]![0] : W;
  const left = values[0] === null ? points[0]![0] : 0;
  return `${toPath(points)} L ${right},${H} L ${left},${H} Z`;
}

/** At most MAX_TICKS labels, spread over the whole axis (first and last kept). */
function pickTicks(ticks: readonly string[]): string[] {
  if (ticks.length <= MAX_TICKS) return [...ticks];
  return Array.from(
    { length: MAX_TICKS },
    (_, i) => ticks[Math.round((i * (ticks.length - 1)) / (MAX_TICKS - 1))]!,
  );
}

const wrap = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const wrapIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const headAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const valueAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.25, ease: "easeOut" } },
} as const;

const pillAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.35 },
  },
} as const;

const areaAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay: 1, ease: "easeOut" } },
} as const;

const lineAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, delay: 0.45, ease: "easeOut" },
      opacity: { duration: 0.2, delay: 0.45 },
    },
  },
} as const;

const dotAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 1.45 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface LineProps extends VisualProps {
  title?: string;
  badge?: string;
  value?: string;
  change?: string;
  /** Which way of `change` is good news, coloured green (default "up"; "down" for churn, latency…). */
  positive?: "up" | "down";
  /**
   * The series as heights, 0 (bottom) to 1 (top). Values outside 0..1 are scaled
   * to the series' own range, like `values`.
   */
  points?: readonly number[];
  /** The series in its own unit, scaled to `min`..`max`. Takes precedence over `points`. */
  values?: readonly number[];
  /** Value at the bottom of the plot (default: the smallest value). */
  min?: number;
  /** Value at the top of the plot (default: the largest value). */
  max?: number;
  /** Shown in place of the plot when the series has no finite value. */
  emptyLabel?: string;
  ticks?: readonly string[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Line({
  title = lineDefault.title,
  badge = lineDefault.badge,
  value = lineDefault.value,
  change = lineDefault.change,
  positive = "up",
  points = lineDefault.points,
  values,
  min,
  max,
  emptyLabel = "No data",
  ticks = lineDefault.ticks,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: LineProps) {
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
  const gradientId = useId();
  const down = /^\s*[-−]/.test(change);
  const good = positive === "down" ? down : !down;
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;
  const series = toFractions(points, values, min, max);
  const pts = toPoints(series);
  const line = toPath(pts);
  const area = areaPath(pts, series);
  const last = pts[pts.length - 1];
  const shownTicks = pickTicks(ticks);
  const crowdedTicks = shownTicks.join("").length > TICK_CHARS;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-80",
          "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
          fill && "flex h-full flex-col",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? wrapIso : wrap) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-3xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50%"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div
          className={cn(
            "relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card px-4 pt-3.5 pb-3 shadow-xs",
            fill && "flex-1",
          )}
        >
          <motion.div
            className="flex items-center justify-between"
            variants={animated ? headAnim : undefined}
            {...state}
          >
            <span className="text-xs font-medium tracking-wide text-muted-foreground">{title}</span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {badge}
            </span>
          </motion.div>
          <div className="flex items-end gap-2">
            <motion.span
              className="text-2xl font-semibold tracking-tight text-foreground tabular-nums"
              variants={animated ? valueAnim : undefined}
              {...state}
            >
              {value}
            </motion.span>
            <motion.span
              className={cn(
                "mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset",
                good
                  ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-400",
              )}
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <TrendIcon className="size-3" strokeWidth={2.75} />
              {change}
            </motion.span>
          </div>
          {!last ? (
            <motion.div
              className={cn(
                "relative flex items-center justify-center",
                fill ? "min-h-22 flex-1" : "h-22",
              )}
              variants={animated ? areaAnim : undefined}
              {...state}
            >
              <div className="absolute inset-x-0 bottom-0.75 border-t border-dashed border-border" />
              <span className="text-[10px] font-medium text-muted-foreground">{emptyLabel}</span>
            </motion.div>
          ) : (
            <div className={cn("relative", fill && "min-h-22 flex-1")}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className={cn("block w-full", fill ? "h-full" : "h-22")}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={area}
                  fill={`url(#${gradientId})`}
                  variants={animated ? areaAnim : undefined}
                  {...state}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect={fill ? "non-scaling-stroke" : undefined}
                  variants={animated ? lineAnim : undefined}
                  {...state}
                />
              </svg>
              <motion.div
                className="absolute size-2.5 -translate-1/2 rounded-full border-2 border-chart-1 bg-card"
                style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }}
                variants={animated ? dotAnim : undefined}
                {...state}
              />
            </div>
          )}
          <motion.div
            className={cn("flex justify-between", crowdedTicks && "gap-2")}
            variants={animated ? headAnim : undefined}
            {...state}
          >
            {shownTicks.map((t, i) => (
              <span
                key={i}
                className={cn(
                  "text-[9px] font-medium text-muted-foreground",
                  crowdedTicks && "min-w-0 truncate",
                )}
              >
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
