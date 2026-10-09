"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const barDefault = {
  title: "Revenue",
  badge: "7d",
  value: "$48.2k",
  change: "+18.4%",
  items: [
    { label: "Mon", value: 56 },
    { label: "Tue", value: 38 },
    { label: "Wed", value: 72 },
    { label: "Thu", value: 48 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 30 },
    { label: "Sun", value: 22 },
  ],
} as const;

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

/** Bars show at least this much of the plot height when their value is not zero. */
const MIN_BAR = 2;
/** Up to this many bars the chart keeps its preview spacing and one label per bar. */
const ROOMY = 15;

const barsAnim = (count: number) =>
  ({
    hidden: {},
    visible: {
      transition: { staggerChildren: count > ROOMY ? 0.9 / count : 0.06, delayChildren: 0.45 },
    },
  }) as const;

function gapFor(count: number): string {
  if (count <= ROOMY) return "gap-2";
  if (count <= 30) return "gap-1";
  if (count <= 60) return "gap-0.5";
  return count <= 100 ? "gap-px" : "gap-0";
}

const barAnim = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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

export interface BarProps extends VisualProps {
  title?: string;
  badge?: string;
  value?: string;
  change?: string;
  /** Which way of `change` is good news, coloured green (default "up"; "down" for churn, latency…). */
  positive?: "up" | "down";
  /** One bar per item. Negative values hang from a zero baseline; missing ones draw no bar. */
  items?: readonly { label: string; value: number }[];
  /** Shown in place of the bars when `items` is empty. */
  emptyLabel?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Bar({
  title = barDefault.title,
  badge = barDefault.badge,
  value = barDefault.value,
  change = barDefault.change,
  positive = "up",
  items = barDefault.items,
  emptyLabel = "No data",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: BarProps) {
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
  const bars = items.map((item) => ({
    label: String(item.label),
    value: Number.isFinite(item.value) ? item.value : 0,
  }));
  const count = bars.length;
  const max = count ? Math.max(...bars.map((b) => b.value)) : 0;
  const low = count ? Math.min(...bars.map((b) => b.value)) : 0;
  const maxIndex = max > 0 ? bars.findIndex((b) => b.value === max) : -1;
  // with a negative (or no positive) value, bars hang from a zero baseline
  const signed = count > 0 && (low < 0 || max <= 0);
  const span = Math.max(0, max) - Math.min(0, low);
  const zero = span > 0 ? (Math.max(0, max) / span) * 100 : 100;
  const crowded = count > ROOMY;
  const longLabels = bars.some((b) => b.label.length > 6);
  const labelChars = Math.max(1, ...bars.map((b) => b.label.length));
  const labelEvery = crowded
    ? Math.ceil(count / Math.max(2, Math.floor(48 / (labelChars + 2))))
    : 1;
  const gap = gapFor(count);
  const down = /^\s*[-−]/.test(change);
  const good = positive === "down" ? down : !down;
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;

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
          <div className={cn("flex flex-col gap-2 pt-1", fill && "flex-1")}>
            {count === 0 ? (
              <motion.div
                className={cn(
                  "relative flex items-center justify-center",
                  fill ? "min-h-24 flex-1" : "h-24",
                )}
                variants={animated ? headAnim : undefined}
                {...state}
              >
                <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-border" />
                <span className="text-[10px] font-medium text-muted-foreground">{emptyLabel}</span>
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  "flex items-end",
                  gap,
                  fill ? "min-h-24 flex-1" : "h-24",
                  signed && "relative",
                )}
                variants={animated ? barsAnim(count) : undefined}
                {...state}
              >
                {signed && (
                  <div
                    className="absolute inset-x-0 h-px -translate-y-1/2 bg-border"
                    style={{ top: `${zero}%` }}
                  />
                )}
                {bars.map((bar, i) => {
                  const isMax = i === maxIndex;
                  const color = isMax ? "bg-chart-3" : "bg-chart-3/25 dark:bg-chart-3/40";
                  if (signed) {
                    const size = span > 0 ? (Math.abs(bar.value) / span) * 100 : 0;
                    const height = bar.value === 0 ? 0 : Math.max(MIN_BAR, size);
                    return (
                      <div key={i} className="relative flex-1 self-stretch">
                        <motion.div
                          className={cn(
                            "absolute inset-x-0",
                            bar.value < 0
                              ? "origin-top rounded-b-md"
                              : "origin-bottom rounded-t-md",
                            color,
                          )}
                          style={{
                            top: `${bar.value < 0 ? zero : zero - height}%`,
                            height: `${height}%`,
                          }}
                          variants={animated ? barAnim : undefined}
                        />
                      </div>
                    );
                  }
                  const height = bar.value > 0 ? Math.max(MIN_BAR, (bar.value / max) * 100) : 0;
                  return (
                    <div key={i} className="flex flex-1 items-end self-stretch">
                      <motion.div
                        className={cn("w-full origin-bottom rounded-t-md", color)}
                        style={{ height: `${height}%` }}
                        variants={animated ? barAnim : undefined}
                      />
                    </div>
                  );
                })}
              </motion.div>
            )}
            {count > 0 && (
              <motion.div
                className={cn("flex", crowded ? gap : "gap-1.5")}
                variants={animated ? headAnim : undefined}
                {...state}
              >
                {bars.map((bar, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 text-center text-[9px] font-medium tabular-nums",
                      i === maxIndex ? "text-foreground" : "text-muted-foreground",
                      crowded
                        ? "flex min-w-0 justify-center whitespace-nowrap"
                        : longLabels && "min-w-0 truncate",
                    )}
                  >
                    {i % labelEvery === 0 ? bar.label : ""}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
