import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const funnelDefault = {
  title: "Signup funnel",
  badge: "30d",
  change: "+2.4%",
  stages: [
    { label: "Visitors", value: 24800 },
    { label: "Signups", value: 9420 },
    { label: "Activated", value: 4120 },
    { label: "Paid", value: 1580 },
  ],
} as const;

const MIN_WIDTH = 14;
const MIN_COLOR = 34;
const COLOR_STEP = 18;
const numberFormat = new Intl.NumberFormat("en-US");

function formatPercent(p: number): string {
  return `${p >= 10 ? Math.round(p) : p.toFixed(1)}%`;
}

interface Stage {
  label: string;
  value: number;
  color?: string;
}

interface FunnelStage extends Stage {
  percent: number;
  fill: string;
  clipPath: string;
}

function computeStages(stages: readonly Stage[]): FunnelStage[] {
  const base = stages[0]?.value || 1;
  const widths = stages.map((s) => Math.max(MIN_WIDTH, Math.min(100, (s.value / base) * 100)));
  return stages.map((s, i) => {
    const width = widths[i]!;
    const next = widths[i + 1] ?? width;
    const percent = (s.value / base) * 100;
    return {
      ...s,
      percent,
      fill:
        s.color ??
        `color-mix(in oklab, var(--color-primary) ${Math.max(MIN_COLOR, 100 - i * COLOR_STEP)}%, transparent)`,
      clipPath: `polygon(${(100 - width) / 2}% 0%, ${(100 + width) / 2}% 0%, ${(100 + next) / 2}% 100%, ${(100 - next) / 2}% 100%)`,
    };
  });
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

const stagesAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.45 } },
} as const;

const rowAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const barAnim = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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

export interface FunnelProps extends VisualProps {
  title?: string;
  badge?: string;
  value?: string;
  change?: string;
  stages?: readonly Stage[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Funnel({
  title = funnelDefault.title,
  badge = funnelDefault.badge,
  value,
  change = funnelDefault.change,
  stages = funnelDefault.stages,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: FunnelProps) {
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
  const rows = computeStages(stages);
  const valueText = value ?? formatPercent(rows.at(-1)?.percent ?? 0);
  const down = change.startsWith("-");
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;

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
              {valueText}
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
          <motion.div
            className="flex flex-col gap-1 pt-0.5"
            variants={animated ? stagesAnim : undefined}
            {...state}
          >
            {rows.map((row, i) => (
              <motion.div
                key={i}
                className="flex h-9 items-center gap-2"
                variants={animated ? rowAnim : undefined}
              >
                <span className="w-14 shrink-0 truncate text-right text-[10px] font-medium text-muted-foreground">
                  {row.label}
                </span>
                <div className="relative h-full flex-1">
                  <motion.div
                    className="size-full origin-top"
                    style={{ backgroundColor: row.fill, clipPath: row.clipPath }}
                    variants={animated ? barAnim : undefined}
                  />
                </div>
                <div className="flex w-14 shrink-0 flex-col leading-tight">
                  <span className="text-[10px] font-semibold text-foreground tabular-nums">
                    {numberFormat.format(row.value)}
                  </span>
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {formatPercent(row.percent)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
