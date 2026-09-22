import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MiniPanelProps extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const stats = [
  { label: "Revenue", value: "$48.2k", trend: "up", change: "+12.4%" },
  { label: "Users", value: "2,418", trend: "up", change: "+8.1%" },
  { label: "Churn", value: "1.2%", trend: "down", change: "-0.4%" },
] as const;

const bars = [55, 40, 75, 50, 70, 35, 45, 48, 85, 60, 90, 45, 78, 95, 65];

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
  { dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40", line: "h-1 flex-1 rounded-full bg-muted-foreground/15", tail: "h-1 w-10 rounded-full bg-muted-foreground/25" },
  { dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40", line: "h-1 flex-1 rounded-full bg-muted-foreground/15", tail: "h-1 w-8 rounded-full bg-muted-foreground/25" },
  { dot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/40", line: "h-1 flex-1 rounded-full bg-muted-foreground/15", tail: "h-1 w-12 rounded-full bg-muted-foreground/25" },
] as const;

export function MiniPanel({
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

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={`relative w-full${fill ? "" : " max-w-80"} rounded-2xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
          className="relative h-64 rounded-xl border bg-background"
          variants={animated ? panelAnim : undefined}
          {...state}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Activity className="size-3 text-primary" strokeWidth={2.5} />
                <span className="text-[10px] font-semibold text-foreground">Overview</span>
              </div>
              <div className="flex gap-1">
                <span className="rounded-full px-1.5 py-px text-[9px] font-medium text-muted-foreground">
                  7d
                </span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                  30d
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-border/50 px-3 py-2.5">
              {stats.map((stat) => {
                const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
                const trendColor =
                  stat.trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400";
                return (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-medium tracking-wider text-muted-foreground uppercase">
                      {stat.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    <span className={cn("flex items-center gap-0.5 text-[9px] font-medium", trendColor)}>
                      <TrendIcon className="size-2" strokeWidth={3} />
                      {stat.change}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-1 border-b border-border/50 px-3 py-2">
              <div className="flex flex-1 items-end justify-between gap-0.5 rounded-md bg-muted/60 p-3">
                {bars.map((height, i) => (
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
