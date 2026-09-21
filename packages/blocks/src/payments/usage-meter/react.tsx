import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Activity, ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface UsageItem {
  label: string;
  detail: string;
  amount: string;
  color?: string;
}

export const usageMeterDefaultItems: UsageItem[] = [
  { label: "API requests", detail: "1.24M calls", amount: "$124.00", color: "bg-chart-1" },
  { label: "Bandwidth", detail: "820 GB", amount: "$82.00", color: "bg-chart-2" },
  { label: "Compute", detail: "42 hrs", amount: "$42.60", color: "bg-chart-4" },
];

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
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const meterAnim = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, delay: 0.3, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
  },
} as const;

const listAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const totalAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.75, ease: "easeOut" },
  },
} as const;

const amountAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay: 0.85 },
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

export interface UsageMeterProps extends VisualProps {
  title?: string;
  period?: string;
  meterLabel?: string;
  meterUsage?: string;
  meterCaption?: string;
  usedRatio?: number;
  items?: readonly UsageItem[];
  total?: string;
  totalLabel?: string;
  trend?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function UsageMeter({
  title = "Usage this month",
  period = "18 days left",
  meterLabel = "API requests",
  meterUsage = "1.24M / 2M",
  meterCaption = "62% of included quota used",
  usedRatio = 0.62,
  items = usageMeterDefaultItems,
  total = "$248.60",
  totalLabel = "Estimated total",
  trend = "+12%",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: UsageMeterProps) {
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
  const meterWidth = `${Math.max(0, Math.min(usedRatio, 1)) * 100}%`;
  const down = trend.trim().startsWith("-");
  const TrendIcon: LucideIcon = down ? ArrowDown : ArrowUp;
  const trendPill = down
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={cn(
          "relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
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
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center justify-between border-b px-4 py-3"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                <Activity className="size-3.5" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-foreground">{title}</span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {period}
            </span>
          </motion.div>
          <div className="border-b px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">{meterLabel}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{meterUsage}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                style={{ width: meterWidth }}
                variants={animated ? meterAnim : undefined}
                {...state}
              />
            </div>
            <span className="mt-1.5 block text-[10px] text-muted-foreground">{meterCaption}</span>
          </div>
          <motion.div
            className="flex flex-col px-4 py-2"
            variants={animated ? listAnim : undefined}
            {...state}
          >
            {items.map((item, i) => (
              <motion.div
                key={i}
                className={cn(
                  "flex items-center justify-between py-1.5",
                  i === items.length - 1 ? "" : "border-b border-border/50",
                )}
                variants={animated ? itemAnim : undefined}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={cn("size-2 shrink-0 rounded-full", item.color ?? "bg-primary")} />
                  <span className="shrink-0 text-[11px] font-medium text-foreground">{item.label}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{item.detail}</span>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-foreground tabular-nums">
                  {item.amount}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="flex items-end justify-between border-t px-4 py-3"
            variants={animated ? totalAnim : undefined}
            {...state}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">{totalLabel}</span>
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="text-lg leading-none font-bold text-foreground tabular-nums"
                  variants={animated ? amountAnim : undefined}
                >
                  {total}
                </motion.span>
                {trend && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] leading-none font-semibold",
                      trendPill,
                    )}
                  >
                    <TrendIcon className="size-2.5" strokeWidth={2.5} />
                    {trend.replace(/^[+-]/, "")}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border bg-background px-2.5 py-1.5 text-[10px] font-medium text-foreground shadow-xs hover:bg-muted"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              Manage plan
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
