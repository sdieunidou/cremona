"use client";

import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const heatmapDefault = {
  title: "Active hours",
  badge: "4w",
  value: "12.4k",
  change: "+9.2%",
  legendLow: "Less",
  legendHigh: "More",
  columns: ["12a", "", "4a", "", "8a", "", "12p", "", "4p", "", "8p", ""],
  rows: [
    { label: "Mon", values: [8, 4, 0, 6, 24, 62, 88, 96, 84, 58, 30, 14] },
    { label: "Tue", values: [10, 5, 4, 8, 28, 70, 92, 100, 88, 60, 32, 16] },
    { label: "Wed", values: [9, 4, 3, 7, 26, 66, 90, 94, 86, 62, 34, 18] },
    { label: "Thu", values: [11, 6, 4, 9, 30, 68, 86, 92, 82, 56, 28, 15] },
    { label: "Fri", values: [12, 6, 5, 10, 26, 58, 78, 82, 70, 44, 22, 12] },
    { label: "Sat", values: [14, 8, 0, 6, 14, 26, 36, 40, 34, 26, 20, 12] },
    { label: "Sun", values: [10, 0, 0, 5, 12, 22, 30, 34, 30, 24, 18, 10] },
  ],
} as const;

const LEVELS = [0, 22, 42, 68, 100];
const CELL = 20;
const GAP = 4;
const LABEL_W = 34;
/** Label column plus its gap when a row label needs more than `w-7`. */
const WIDE_LABEL_W = 54;
/** Up to this many columns the grid keeps its preview spacing. */
const ROOMY = 14;

/** Intensity level 0–4; -1 for a missing (non-finite) value. */
function levelOf(value: number, max: number): number {
  if (!Number.isFinite(value)) return -1;
  return value <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((value / max) * 4)));
}

function colorFor(level: number, color: string): string {
  if (level < 0) return "transparent";
  return level === 0
    ? "var(--color-muted)"
    : `color-mix(in oklab, ${color} ${LEVELS[level]}%, transparent)`;
}

export interface HeatmapRow {
  label: string;
  /** One value per column; a missing column reads 0, a non-finite value draws an empty cell. */
  values: readonly number[];
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

const cellAnim: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, delay: 0.45 + i * 0.022, ease: "easeOut" },
  }),
} as const;

const labelAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.3, ease: "easeOut" } },
} as const;

const legendAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.85, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface HeatmapProps extends VisualProps {
  title?: string;
  badge?: string;
  value?: string;
  change?: string;
  /** Which way of `change` is good news, coloured green (default "up"; "down" for churn, latency…). */
  positive?: "up" | "down";
  rows?: readonly HeatmapRow[];
  columns?: readonly string[];
  color?: string;
  legend?: boolean;
  legendLow?: string;
  legendHigh?: string;
  /** Shown in place of the grid when there is no row or column. */
  emptyLabel?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Heatmap({
  title = heatmapDefault.title,
  badge = heatmapDefault.badge,
  value = heatmapDefault.value,
  change = heatmapDefault.change,
  positive = "up",
  rows = heatmapDefault.rows,
  columns = heatmapDefault.columns,
  color = "var(--color-primary)",
  legend = true,
  legendLow = heatmapDefault.legendLow,
  legendHigh = heatmapDefault.legendHigh,
  emptyLabel = "No data",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: HeatmapProps) {
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
  const count = Math.max(columns.length, ...rows.map((r) => r.values.length));
  const max = Math.max(1, ...rows.flatMap((r) => r.values).filter((v) => Number.isFinite(v)));
  const gridTemplate = `repeat(${count}, minmax(0, 1fr))`;
  const gapPx = count <= ROOMY ? GAP : count <= 30 ? 2 : 1;
  const gap = count <= ROOMY ? "gap-1" : count <= 30 ? "gap-0.5" : "gap-px";
  const wideLabels = rows.some((r) => String(r.label).length > 5);
  const maxWidth = (wideLabels ? WIDE_LABEL_W : LABEL_W) + count * CELL + (count - 1) * gapPx;
  const empty = rows.length === 0 || count === 0;
  const down = /^\s*[-−]/.test(change);
  const good = positive === "down" ? down : !down;
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;
  const hasColumnLabels = columns.some((c) => c !== "");

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
            "relative flex flex-col gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-xs",
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
                  ? "bg-success/10 text-success ring-success/15"
                  : "bg-destructive/10 text-destructive ring-destructive/15",
              )}
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <TrendIcon className="size-3" strokeWidth={2.75} />
              {change}
            </motion.span>
          </div>
          {empty ? (
            <motion.div
              className={cn(
                "flex items-center justify-center rounded-lg border border-dashed",
                fill ? "min-h-20 flex-1" : "h-20",
              )}
              variants={animated ? labelAnim : undefined}
              {...state}
            >
              <span className="text-[10px] font-medium text-muted-foreground">{emptyLabel}</span>
            </motion.div>
          ) : (
            <div className={cn("flex flex-col gap-1.5 pt-0.5", fill && "my-auto")}>
              <div className="mx-auto flex w-full gap-1.5" style={{ maxWidth }}>
                <div className={cn("flex shrink-0 flex-col", wideLabels ? "w-12" : "w-7", gap)}>
                  {rows.map((row, i) => (
                    <motion.span
                      key={i}
                      className="flex flex-1 items-center justify-end text-[8px] font-medium text-muted-foreground"
                      variants={animated ? labelAnim : undefined}
                      {...state}
                    >
                      {wideLabels ? (
                        <span className="min-w-0 truncate">{row.label}</span>
                      ) : (
                        row.label
                      )}
                    </motion.span>
                  ))}
                </div>
                <div className={cn("flex flex-1 flex-col", gap)}>
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className={cn("grid", gap)}
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {Array.from({ length: count }, (_, c) => {
                        const level = levelOf(row.values[c] ?? 0, max);
                        return (
                          <motion.div
                            key={c}
                            className={cn(
                              "aspect-square rounded-[3px]",
                              level < 0 && "ring-1 ring-border ring-inset",
                            )}
                            style={{ backgroundColor: colorFor(level, color) }}
                            custom={i + c}
                            variants={animated ? cellAnim : undefined}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {hasColumnLabels && (
                <motion.div
                  className="mx-auto flex w-full gap-1.5"
                  style={{ maxWidth }}
                  variants={animated ? labelAnim : undefined}
                  {...state}
                >
                  <span className={cn("shrink-0", wideLabels ? "w-12" : "w-7")} />
                  <div
                    className={cn("grid flex-1", gap)}
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {Array.from({ length: count }, (_, c) => (
                      <span
                        key={c}
                        className="text-center text-[8px] font-medium text-muted-foreground tabular-nums"
                      >
                        {columns[c] ?? ""}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
          {legend && (
            <motion.div
              className="flex items-center justify-end gap-1.5"
              variants={animated ? legendAnim : undefined}
              {...state}
            >
              <span className="text-[8px] font-medium text-muted-foreground">{legendLow}</span>
              <div className="flex gap-0.5">
                {LEVELS.map((_, level) => (
                  <span
                    key={level}
                    className="size-2 rounded-xs"
                    style={{ backgroundColor: colorFor(level, color) }}
                  />
                ))}
              </div>
              <span className="text-[8px] font-medium text-muted-foreground">{legendHigh}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
