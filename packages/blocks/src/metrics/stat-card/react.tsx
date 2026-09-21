import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  DollarSign,
  Minus,
  ShoppingCart,
  Users,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const statCardDefaultCopy = {
  icon: DollarSign,
  label: "Revenue",
  value: "$48,213",
  change: "+12.4%",
  period: "vs last month",
  trend: "up",
} as const;

type Trend = "up" | "down" | "neutral";

const trendStyles: Record<Trend, { icon: LucideIcon; pill: string }> = {
  up: {
    icon: ArrowUpRight,
    pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/15",
  },
  down: {
    icon: ArrowDownRight,
    pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/15",
  },
  neutral: {
    icon: Minus,
    pill: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  },
};

const card = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const iconBox = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.2 },
  },
} as const;

const labelAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.25, ease: "easeOut" } },
} as const;

const valueAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.35, ease: "easeOut" } },
} as const;

const pillAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.5 },
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

export interface StatCardProps extends VisualProps {
  icon?: LucideIcon;
  label?: string;
  value?: string;
  change?: string;
  period?: string;
  trend?: Trend;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function StatCard({
  icon = statCardDefaultCopy.icon,
  label: labelText = statCardDefaultCopy.label,
  value = statCardDefaultCopy.value,
  change = statCardDefaultCopy.change,
  period = statCardDefaultCopy.period,
  trend = statCardDefaultCopy.trend,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: StatCardProps) {
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
  const trendStyle = trendStyles[trend];
  const TrendIcon = trendStyle.icon;
  const Icon = icon;

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
          "relative w-full max-w-72 rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform",
          fadeOut && "mask-b-from-60%",
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
        <div className="relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0"
              variants={animated ? iconBox : undefined}
              {...state}
            >
              <Icon className="size-4" strokeWidth={2.25} />
            </motion.div>
            <motion.span
              className="text-xs font-medium tracking-wide text-muted-foreground"
              variants={animated ? labelAnim : undefined}
              {...state}
            >
              {labelText}
            </motion.span>
          </div>
          <motion.div
            className="text-3xl font-semibold tracking-tight text-foreground tabular-nums"
            variants={animated ? valueAnim : undefined}
            {...state}
          >
            {value}
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                trendStyle.pill,
              )}
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <TrendIcon className="size-3" strokeWidth={2.75} />
              {change}
            </motion.span>
            <motion.span
              className="text-[10px] font-medium text-muted-foreground"
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              {period}
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
