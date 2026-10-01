"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MonitorSeries {
  label: string;
  /** Any CSS colour. */
  color: string;
  /** Samples, oldest first, as fractions of the plot (0–1) or as percentages (0–100). */
  points: readonly number[];
  /**
   * Noise (0–1) that turns `points` into a simulated live signal, which keeps
   * scrolling while animated. Leave it out to draw `points` as they are, with
   * the last sample as the reading.
   */
  jitter?: number;
}

export const monitorDefaultSeries: MonitorSeries[] = [
  {
    label: "MEM",
    color: "var(--color-emerald-500)",
    points: [0.52, 0.57, 0.5, 0.58, 0.53, 0.49, 0.56, 0.51, 0.57, 0.54],
    jitter: 0.05,
  },
  {
    label: "CPU",
    color: "var(--color-primary)",
    points: [0.16, 0.21, 0.19, 0.27, 0.34, 0.47, 0.6, 0.73, 0.85, 0.9],
    jitter: 0.045,
  },
];

const DEFAULT_SAMPLES = 48;
const DEFAULT_INTERVAL = 600;
const MIN_INTERVAL = 200;
const MIN_SAMPLES = 8;
const EXTRA_POINTS = 3;
const VIEW_WIDTH = 240;
const VIEW_HEIGHT = 84;
const GRID_DIVISIONS = 40;
const NOISE_SCALE = 0.55;

function noise(offsetIndex: number, seriesIndex: number): number {
  return (
    Math.sin(seriesIndex * 1.7 + offsetIndex * 0.9) * 0.5 +
    Math.sin(seriesIndex * 4.1 + offsetIndex * 2.3) * 0.32 +
    Math.sin(seriesIndex * 2.9 + offsetIndex * 5.7) * 0.18
  );
}

function interpolate(points: readonly number[], offset: number, total: number): number {
  if (points.length === 0) return 0.5;
  const pos = Math.min(offset / Math.max(total - 1, 1), 1) * (points.length - 1);
  const i = Math.floor(pos);
  const next = Math.min(i + 1, points.length - 1);
  return points[i]! + (points[next]! - points[i]!) * (pos - i);
}

/** Finite samples as fractions of the plot; a series with a value above 1 is in percent. */
function toFractions(points: readonly number[]): number[] {
  const finite = points.filter((v) => Number.isFinite(v));
  const percent = finite.some((v) => v > 1);
  return finite.map((v) => Math.min(1, Math.max(0, percent ? v / 100 : v)));
}

function sampleValue(
  points: readonly number[],
  jitter: number,
  seriesIndex: number,
  offset: number,
  total: number,
): number {
  const value =
    interpolate(points, offset, total) + noise(offset * NOISE_SCALE, seriesIndex) * jitter;
  return Math.min(Math.max(value, 0.04), 0.96);
}

interface SeriesLine {
  entry: MonitorSeries;
  /** Drawn from its samples as they are, outside the scrolling group. */
  exact: boolean;
  points: string;
  reading: number | null;
}

/** The samples spread over the plot, oldest at the left edge, newest at the right. */
function exactLine(points: readonly number[]): string {
  const values = points.length === 1 ? [points[0]!, points[0]!] : points;
  const step = VIEW_WIDTH / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => `${(i * step).toFixed(2)},${((1 - v) * 80 + 2).toFixed(2)}`)
    .join(" ");
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

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.15,
      ease: "easeOut",
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
} as const;

const legendAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 18 },
  },
} as const;

const axisAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.35, ease: "easeOut" } },
} as const;

const clipAnim = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 1,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
} as const;

const sweepAnim = {
  hidden: { x: "-100%", opacity: 1 },
  visible: {
    x: "0%",
    opacity: [1, 1, 0] as [number, number, number],
    transition: {
      x: { duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      opacity: {
        duration: 1,
        delay: 0.3,
        times: [0, 0.5, 1] as [number, number, number],
        ease: "easeIn",
      },
    },
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

export interface ResourceMonitorProps extends VisualProps {
  title?: string;
  series?: readonly MonitorSeries[];
  samples?: number;
  interval?: number;
  showGrid?: boolean;
  showAxis?: boolean;
  hover?: boolean;
  /** Shown over the plot when no series has a sample. */
  emptyLabel?: string;
  /** BCP 47 locale of the readings and the axis (default `"en-US"`). */
  locale?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function ResourceMonitor({
  title = "App",
  series = monitorDefaultSeries,
  samples = DEFAULT_SAMPLES,
  interval = DEFAULT_INTERVAL,
  showGrid = true,
  showAxis = true,
  hover = false,
  emptyLabel = "No data",
  locale = "en-US",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ResourceMonitorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const lastTickRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [tick, setTick] = useState(0);
  const loop = useLoopActive(ref, animated);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const state = animated ? { initial: "hidden", animate: inView ? "visible" : "hidden" } : {};
  const simulated = series.some((entry) => (entry.jitter ?? 0) > 0);
  const live = animated && inView && (!hover || hovered) && loop && simulated;
  const percent = new Intl.NumberFormat(locale, { style: "unit", unit: "percent" });
  const tickMs = Math.max(Number.isFinite(interval) ? interval : DEFAULT_INTERVAL, MIN_INTERVAL);
  const sampleCount = Math.max(
    Math.round(Number.isFinite(samples) ? samples : DEFAULT_SAMPLES),
    MIN_SAMPLES,
  );
  const totalPoints = sampleCount + EXTRA_POINTS;
  const step = VIEW_WIDTH / sampleCount;
  const duration = tickMs / 1000;

  useEffect(() => {
    if (!inView) lastTickRef.current = null;
  }, [inView]);

  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout>;
    const tickFn = () => {
      lastTickRef.current = Date.now();
      setTick((t) => t + 1);
      timer = setTimeout(tickFn, tickMs);
    };
    const elapsed = lastTickRef.current === null ? 0 : Date.now() - lastTickRef.current;
    timer = setTimeout(tickFn, Math.max(0, tickMs - elapsed));
    return () => clearTimeout(timer);
  }, [live, tickMs]);

  const seriesData = series.map((entry, si): SeriesLine => {
    const fractions = toFractions(entry.points);
    const jitter = entry.jitter ?? 0;
    if (jitter <= 0) {
      return {
        entry,
        exact: true,
        points: fractions.length ? exactLine(fractions) : "",
        reading: fractions.length ? Math.round(fractions[fractions.length - 1]! * 100) : null,
      };
    }
    const values = Array.from({ length: totalPoints }, (_, pi) =>
      sampleValue(fractions, jitter, si + 1, tick + pi, totalPoints),
    );
    return {
      entry,
      exact: false,
      points: values
        .map((v, i) => {
          const x = (i - 1) * step;
          const y = (1 - v) * 80 + 2;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" "),
      reading: Math.round(values[totalPoints - 2]! * 100),
    };
  });
  const empty = !seriesData.some((d) => d.points);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-80",
          "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
          fill && "flex h-full flex-col",
        )}
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
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div
          className={cn(
            "relative flex flex-col gap-3 rounded-2xl border bg-card px-4 pt-3.5 pb-3 shadow-xs",
            fill && "flex-1",
          )}
        >
          <motion.div
            className="flex items-center justify-between gap-3"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex min-w-0 items-center gap-2">
              {animated && (
                <span className="relative flex size-2 shrink-0">
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full bg-primary/60",
                      loop && "animate-ping",
                    )}
                  />
                  <span className="relative size-2 rounded-full bg-primary" />
                </span>
              )}
              <span className="truncate text-xs font-semibold text-foreground">{title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              {seriesData.map(({ entry, reading }, i) => (
                <motion.span
                  key={`${entry.label}-${i}`}
                  className="flex items-center gap-1 text-[10px] leading-none"
                  variants={animated ? legendAnim : undefined}
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-muted-foreground">{entry.label}</span>
                  <span className="min-w-[3ch] text-right font-semibold text-foreground tabular-nums">
                    {reading === null ? "—" : percent.format(reading || 0)}
                  </span>
                </motion.span>
              ))}
            </div>
          </motion.div>
          <div className={cn("flex items-stretch gap-1.5", fill && "flex-1")}>
            {showAxis && (
              <motion.div
                className="flex w-6 shrink-0 flex-col justify-between text-[9px] font-medium text-muted-foreground tabular-nums"
                variants={animated ? axisAnim : undefined}
                {...state}
              >
                <span>{percent.format(100)}</span>
                <span>{percent.format(0)}</span>
              </motion.div>
            )}
            <div className={cn("relative min-w-0 flex-1", fill ? "min-h-24" : "h-24")}>
              <motion.div className="h-full" variants={animated ? clipAnim : undefined} {...state}>
                <svg
                  viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                  preserveAspectRatio="none"
                  className="block size-full"
                  aria-hidden="true"
                >
                  {showGrid &&
                    Array.from({ length: GRID_DIVISIONS + 1 }, (_, i) => {
                      const x = (i / GRID_DIVISIONS) * VIEW_WIDTH;
                      return (
                        <line
                          key={i}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={VIEW_HEIGHT}
                          stroke="var(--color-border)"
                          strokeWidth={1}
                          strokeOpacity={0.45}
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  <motion.g
                    key={tick}
                    initial={animated ? { x: 0 } : undefined}
                    animate={animated ? { x: live || tick > 0 ? -step : 0 } : undefined}
                    transition={{ duration, ease: "linear" }}
                  >
                    {seriesData.map(({ entry, points, exact }, i) =>
                      exact ? null : (
                        <polyline
                          key={`${entry.label}-${i}`}
                          points={points}
                          fill="none"
                          stroke={entry.color}
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ),
                    )}
                  </motion.g>
                  {seriesData.map(({ entry, points, exact }, i) =>
                    exact && points ? (
                      <polyline
                        key={`${entry.label}-${i}`}
                        points={points}
                        fill="none"
                        stroke={entry.color}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    ) : null,
                  )}
                  <line
                    x1={0}
                    y1={1}
                    x2={VIEW_WIDTH}
                    y2={1}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1={0}
                    y1={83}
                    x2={VIEW_WIDTH}
                    y2={83}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </motion.div>
              {empty && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {emptyLabel}
                  </span>
                </div>
              )}
              {animated && (
                <motion.div className="absolute inset-0" variants={sweepAnim} {...state}>
                  <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-card via-card/80 to-transparent" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
