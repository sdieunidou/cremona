import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ShoppingCart, TrendingUp, Users, Zap } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface WidgetGridProps extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const stats = [
  { icon: Users, label: "Users", value: "2.4k" },
  { icon: TrendingUp, label: "Growth", value: "+12%" },
  { icon: ShoppingCart, label: "Orders", value: "184" },
  { icon: Zap, label: "Active", value: "64" },
] as const;

const bars = [50, 65, 40, 80, 55, 50, 35, 46, 75, 60, 90, 70];

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

const donutArcAnim = {
  hidden: { strokeDasharray: "0 100" },
  visible: {
    strokeDasharray: "61 100",
    transition: { duration: 0.8, delay: 0.7, ease: "easeOut" },
  },
} as const;

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
        className={`relative w-full${fill ? "" : " max-w-90"} rounded-2xl border border-border/50 bg-muted/75 p-1.5 will-change-transform ${fadeOut ? "mask-b-from-60%" : ""}`}
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
          className="relative grid h-60 grid-cols-4 grid-rows-[auto_1fr_auto] gap-1.5"
          variants={animated ? gridAnim : undefined}
          {...state}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
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
          })}
          <motion.div
            variants={animated ? cellAnim : undefined}
            className="col-span-3 flex flex-col gap-1.5 rounded-xl border border-border/50 bg-background p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-foreground">Traffic</span>
              <span className="text-[8px] text-muted-foreground">Last 9d</span>
            </div>
            <div className="flex flex-1 items-end justify-between gap-0.5 rounded-md bg-muted/60 p-3">
              {bars.map((height, i) => (
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
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={animated ? undefined : "61 100"}
                  variants={animated ? donutArcAnim : undefined}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-foreground">61%</span>
              </div>
            </div>
            <span className="text-[8px] font-medium text-muted-foreground">Capacity</span>
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
