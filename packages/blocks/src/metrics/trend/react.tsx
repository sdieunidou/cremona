"use client";

import { useId, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn, frameClasses, toFractions, type VisualProps } from "@cremona/core";

export const trendDefault = {
  label: "Visitors",
  value: "12,481",
  change: "+18.2%",
  direction: "primary",
  points: [0.32, 0.28, 0.45, 0.4, 0.58, 0.55, 0.7, 0.82, 0.88],
} as const;

export type Direction = "primary" | "up" | "down" | "warning";

const directionStyles: Record<
  Direction,
  { icon: LucideIcon; pill: string; stroke: string; fillTop: string; fillBottom: string }
> = {
  primary: {
    icon: ArrowUpRight,
    pill: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 dark:bg-primary dark:text-primary-foreground dark:ring-0",
    stroke: "var(--color-primary)",
    fillTop: "var(--color-primary)",
    fillBottom: "var(--color-primary)",
  },
  up: {
    icon: ArrowUpRight,
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/15",
    stroke: "var(--color-emerald-500)",
    fillTop: "var(--color-emerald-500)",
    fillBottom: "var(--color-emerald-500)",
  },
  down: {
    icon: ArrowDownRight,
    pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/15",
    stroke: "var(--color-rose-500)",
    fillTop: "var(--color-rose-500)",
    fillBottom: "var(--color-rose-500)",
  },
  warning: {
    icon: TriangleAlert,
    pill: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-500/15",
    stroke: "var(--color-orange-500)",
    fillTop: "var(--color-orange-500)",
    fillBottom: "var(--color-orange-500)",
  },
};

const W = 200;
const H = 56;

function toPoints(values: readonly (number | null)[]): [number, number][] {
  const step = W / (values.length - 1);
  const points: [number, number][] = [];
  values.forEach((v, i) => {
    if (v !== null) points.push([i * step, (1 - v) * H]);
  });
  // a single value is a constant: draw it across the plot
  if (points.length === 1) {
    const y = points[0]![1];
    return [
      [0, y],
      [W, y],
    ];
  }
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

const wrap = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const wrapIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const labelAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2, ease: "easeOut" } },
} as const;

const pillAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.3 },
  },
} as const;

const valueAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.35, ease: "easeOut" } },
} as const;

const lineAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1, delay: 0.5, ease: "easeOut" },
      opacity: { duration: 0.2, delay: 0.5 },
    },
  },
} as const;

const areaAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 1, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const backCardAnim: Variants = {
  hidden: { rotate: 0, opacity: 0 },
  visible: (rotate: number) => ({
    rotate,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.15 },
  }),
};

export interface TrendProps extends VisualProps {
  label?: string;
  value?: string;
  change?: string;
  /** Colour and icon of the pill and the line; an unknown value reads as `primary`. */
  direction?: Direction;
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
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
  stacked?: boolean;
}

export function Trend({
  label = trendDefault.label,
  value = trendDefault.value,
  change = trendDefault.change,
  direction = trendDefault.direction,
  points = trendDefault.points,
  values,
  min,
  max,
  emptyLabel = "No data",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  stacked = false,
  fill = false,
  className,
}: TrendProps) {
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
  const styles = directionStyles[direction] ?? directionStyles.primary;
  const TrendIcon = styles.icon;
  const series = toFractions(points, values, min, max);
  const pts = toPoints(series);
  const line = toPath(pts);
  const area = areaPath(pts, series);

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-72",
          "will-change-transform",
          fadeOut && "mask-b-from-60%",
          fill && "flex h-full flex-col",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? wrapIso : wrap) : undefined}
        {...state}
      >
        {stacked && (
          <>
            <motion.div
              className="absolute inset-0 rounded-3xl border bg-card shadow-xs"
              style={{
                transformOrigin: "bottom center",
                ...(animated ? {} : { transform: "rotate(-6deg)" }),
              }}
              custom={-6}
              variants={animated ? backCardAnim : undefined}
            />
            <motion.div
              className="absolute inset-0 rounded-3xl border bg-card shadow-xs"
              style={{
                transformOrigin: "bottom center",
                ...(animated ? {} : { transform: "rotate(6deg)" }),
              }}
              custom={6}
              variants={animated ? backCardAnim : undefined}
            />
          </>
        )}
        <div
          className={cn(
            "relative rounded-3xl border border-border/50 bg-muted/75 p-1.5",
            fill && "flex flex-1 flex-col",
          )}
        >
          {gradient && !fadeOut && (
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
              "relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs",
              fill && "flex-1",
            )}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <motion.span
                className="text-xs font-medium tracking-wide text-muted-foreground"
                variants={animated ? labelAnim : undefined}
                {...state}
              >
                {label}
              </motion.span>
              <motion.span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  styles.pill,
                )}
                variants={animated ? pillAnim : undefined}
                {...state}
              >
                <TrendIcon className="size-3" strokeWidth={2.75} />
                {change}
              </motion.span>
            </div>
            <motion.div
              className="px-4 text-2xl font-semibold tracking-tight text-foreground tabular-nums"
              variants={animated ? valueAnim : undefined}
              {...state}
            >
              {value}
            </motion.div>
            {pts.length === 0 ? (
              <motion.div
                className={cn(
                  "relative mt-3 flex items-center justify-center",
                  fill ? "min-h-14 flex-1" : "h-14",
                )}
                variants={animated ? areaAnim : undefined}
                {...state}
              >
                <div className="absolute inset-x-4 bottom-2 border-t border-dashed border-border" />
                <span className="text-[10px] font-medium text-muted-foreground">{emptyLabel}</span>
              </motion.div>
            ) : (
              <div className={cn("relative mt-3", fill && "min-h-14 flex-1")}>
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  className={cn("block w-full", fill ? "h-full" : "h-14")}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={styles.fillTop} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={styles.fillBottom} stopOpacity="0" />
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
                    stroke={styles.stroke}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect={fill ? "non-scaling-stroke" : undefined}
                    variants={animated ? lineAnim : undefined}
                    {...state}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
