import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const sparklineDefault = {
  title: "Active users",
  value: "1,284",
  change: "+12.5%",
  points: [0.3, 0.42, 0.28, 0.5, 0.45, 0.62, 0.55, 0.78, 0.7, 0.92],
} as const;

const W = 80;
const H = 30;

function toPoints(values: readonly number[]): [number, number][] {
  const step = W / (values.length - 1);
  return values.map((v, i) => [i * step, 3 + (1 - v) * 24]);
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

function areaPath(points: [number, number][]): string {
  return `${toPath(points)} L ${W},${H} L 0,${H} Z`;
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

const titleAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2, ease: "easeOut" } },
} as const;

const valueAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.3, ease: "easeOut" } },
} as const;

const pillAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.4 },
  },
} as const;

const lineAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.9, delay: 0.5, ease: "easeOut" },
      opacity: { duration: 0.15, delay: 0.5 },
    },
  },
} as const;

const areaAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 1, ease: "easeOut" } },
} as const;

const dotAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 1.3 },
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

export interface SparklineProps extends VisualProps {
  title?: string;
  value?: string;
  change?: string;
  points?: readonly number[];
  isometric?: boolean;
  gradient?: boolean;
  /**
   * Wrap the card in the tray the other data blocks carry
   * (`rounded-3xl border-border/50 bg-muted/75 p-1.5`). Off by default so the
   * flat card stays the block's own look; turn it on to line this block up
   * with `charts/bar`, `charts/donut`, `charts/gauge`, `charts/heatmap`,
   * `metrics/stat-card` and `states/empty` on the same screen.
   */
  framed?: boolean;
}

export function Sparkline({
  title = sparklineDefault.title,
  value = sparklineDefault.value,
  change = sparklineDefault.change,
  points = sparklineDefault.points,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  framed = false,
  className,
}: SparklineProps) {
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
  const down = change.startsWith("-");
  const TrendIcon = down ? ArrowDownRight : ArrowUpRight;
  const pts = toPoints(points);
  const line = toPath(pts);
  const area = areaPath(pts);
  const last = pts[pts.length - 1]!;

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
        className={
          framed
            ? "relative w-full max-w-64 rounded-3xl border border-border/50 bg-muted/75 p-1.5"
            : "relative w-full max-w-64"
        }
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? wrapIso : wrap) : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className={
                framed
                  ? "absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                  : "absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              }
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className={
                framed
                  ? "absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50%"
                  : "absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50%"
              }
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div
          className={
            framed
              ? "relative flex items-center gap-3 rounded-2xl border bg-card px-3.5 py-3 shadow-xs"
              : "relative flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 shadow-xs"
          }
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <motion.span
              className="truncate text-[10px] font-medium tracking-wide text-muted-foreground"
              variants={animated ? titleAnim : undefined}
              {...state}
            >
              {title}
            </motion.span>
            <motion.span
              className="text-base font-semibold tracking-tight text-foreground tabular-nums"
              variants={animated ? valueAnim : undefined}
              {...state}
            >
              {value}
            </motion.span>
            <motion.span
              className={cn(
                "inline-flex w-fit items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ring-inset",
                down
                  ? "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
              )}
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <TrendIcon className="size-2.5" strokeWidth={2.75} />
              {change}
            </motion.span>
          </div>
          <div className="relative shrink-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="block h-10 w-20"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path d={area} fill={`url(#${gradientId})`} variants={animated ? areaAnim : undefined} {...state} />
              <motion.path
                d={line}
                fill="none"
                stroke="var(--color-chart-1)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={animated ? lineAnim : undefined}
                {...state}
              />
            </svg>
            <motion.div
              className="absolute size-2 -translate-1/2 rounded-full border-[1.75px] bg-card"
              style={{
                left: `${(last[0] / W) * 100}%`,
                top: `${(last[1] / H) * 100}%`,
                borderColor: "var(--color-chart-1)",
              }}
              variants={animated ? dotAnim : undefined}
              {...state}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
