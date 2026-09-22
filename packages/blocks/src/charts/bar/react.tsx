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

const barsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.45 } },
} as const;

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
  items?: readonly { label: string; value: number }[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Bar({
  title = barDefault.title,
  badge = barDefault.badge,
  value = barDefault.value,
  change = barDefault.change,
  items = barDefault.items,
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
  const max = Math.max(...items.map((i) => i.value));
  const maxIndex = items.findIndex((i) => i.value === max);
  const down = change.startsWith("-");
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;

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
        className={cn(
          "relative w-full", !fill && "max-w-80", "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
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
        <div className="relative flex flex-col gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-xs">
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
                down
                  ? "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
              )}
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <TrendIcon className="size-3" strokeWidth={2.75} />
              {change}
            </motion.span>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <motion.div
              className="flex h-24 items-end gap-2"
              variants={animated ? barsAnim : undefined}
              {...state}
            >
              {items.map((item, i) => {
                const height = (item.value / max) * 100;
                const isMax = i === maxIndex;
                return (
                  <div key={i} className="flex flex-1 items-end self-stretch">
                    <motion.div
                      className={cn(
                        "w-full origin-bottom rounded-t-md",
                        isMax ? "bg-chart-3" : "bg-chart-3/25 dark:bg-chart-3/40",
                      )}
                      style={{ height: `${height}%` }}
                      variants={animated ? barAnim : undefined}
                    />
                  </div>
                );
              })}
            </motion.div>
            <motion.div
              className="flex gap-1.5"
              variants={animated ? headAnim : undefined}
              {...state}
            >
              {items.map((item, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 text-center text-[9px] font-medium tabular-nums",
                    i === maxIndex ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
