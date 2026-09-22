import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const gaugeDefault = {
  title: "Health score",
  badge: "Live",
  label: "All systems healthy",
  change: "+4.2%",
  minLabel: "0",
  maxLabel: "100",
} as const;

const PERCENT = 92;
const CX = 100;
const CY = 96;
const RADIUS = 78;
const STROKE = 14;
const PAD = STROKE / 2 / (Math.PI * RADIUS);
const VIEWBOX = "0 0 200 112";
const ARC = `M 22 ${CY} A ${RADIUS} ${RADIUS} 0 0 1 178 ${CY}`;

function needle(percent: number): { x: number; y: number } {
  const angle = Math.PI - percent * Math.PI;
  return { x: CX + RADIUS * Math.cos(angle), y: CY - RADIUS * Math.sin(angle) };
}

export interface GaugeZone {
  /** Upper bound of the band, 0–100. */
  to: number;
  /**
   * Class applied to the band. The arc strokes `currentColor`, so this is a
   * **text** colour: `text-amber-300 dark:text-amber-400/30`.
   */
  className?: string;
  /**
   * @deprecated Use `className`. Kept for the same meaning — a class, not a
   * CSS value. A CSS colour (`var(--color-red-500)`, `#f00`, `oklch(...)`) is
   * also accepted and applied as a stroke.
   */
  color?: string;
}

/** CSS colour forms that can never be a class name. */
const CSS_COLOR = /^(var\(|#|rgba?\(|hsla?\(|okl(ch|ab)\(|l(ab|ch)\(|color(-mix)?\()/;

/**
 * A zone's paint is a class, not a CSS value — `color` was easy to read the
 * other way round, and passing `var(--color-red-500)` silently produced an
 * unstyled band. Resolve both rather than dropping the value on the floor.
 */
function zonePaint(zone: GaugeZone): { className?: string; style?: { stroke: string } } {
  const paint = zone.className ?? zone.color ?? "";
  return CSS_COLOR.test(paint) ? { style: { stroke: paint } } : { className: paint };
}

interface ZoneSpan extends GaugeZone {
  span: number;
  offset: number;
}

function computeZones(zones: readonly GaugeZone[]): ZoneSpan[] {
  let acc = 0;
  return zones.map((zone, i) => {
    const to = Math.max(acc, Math.min(100, zone.to));
    const start = acc / 100 + (i === 0 ? 0 : PAD);
    const end = to / 100 - (i === zones.length - 1 ? 0 : PAD);
    acc = to;
    return { ...zone, span: Math.max(0.001, end - start), offset: -start };
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.35, ease: "easeOut" } },
} as const;

const pillAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 1.15 },
  },
} as const;

const labelAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const trackAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.25, ease: "easeOut" } },
} as const;

const arcAnim: Variants = {
  hidden: { pathLength: 0 },
  visible: (progress: number) => ({
    pathLength: progress,
    transition: {
      duration: 0.9,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const dotAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 16, delay: 1.15 },
  },
} as const;

const footerAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 1.05, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface GaugeProps extends VisualProps {
  title?: string;
  badge?: string;
  percent?: number;
  value?: string;
  label?: string;
  change?: string;
  minLabel?: string;
  maxLabel?: string;
  color?: string;
  zones?: readonly GaugeZone[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Gauge({
  title = gaugeDefault.title,
  badge = gaugeDefault.badge,
  percent = PERCENT,
  value,
  label = gaugeDefault.label,
  change = gaugeDefault.change,
  minLabel = gaugeDefault.minLabel,
  maxLabel = gaugeDefault.maxLabel,
  color = "var(--color-primary)",
  zones,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: GaugeProps) {
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
  const clamped = Math.max(0, Math.min(100, percent));
  const progress = clamped / 100;
  const valueText = value ?? String(Math.round(clamped));
  const zoneSpans = zones ? computeZones(zones) : [];
  const needlePos = needle(progress);
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
          <div className="relative mx-auto w-full max-w-56">
            <svg viewBox={VIEWBOX} className="w-full overflow-visible">
              <motion.path
                d={ARC}
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                variants={animated ? trackAnim : undefined}
                {...state}
              />
              {zoneSpans.map((zone, i) => {
                const paint = zonePaint(zone);
                return (
                <motion.path
                  key={i}
                  d={ARC}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  className={cn("opacity-30", paint.className)}
                  style={paint.style}
                  pathLength={1}
                  strokeDasharray={`${zone.span} 1`}
                  strokeDashoffset={zone.offset}
                  variants={animated ? trackAnim : undefined}
                  {...state}
                />
                );
              })}
              <motion.path
                d={ARC}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                custom={progress}
                variants={animated ? arcAnim : undefined}
                pathLength={1}
                strokeDasharray={animated ? undefined : `${progress} 1`}
              />
              <motion.circle
                cx={needlePos.x}
                cy={needlePos.y}
                r={4}
                fill="var(--color-card)"
                stroke={color}
                strokeWidth={3}
                variants={animated ? dotAnim : undefined}
                {...state}
              />
            </svg>
            <div className="absolute inset-x-0 top-0 bottom-[16%] flex flex-col items-center justify-end gap-0.5">
              <motion.span
                className="text-2xl leading-none font-semibold tracking-tight text-foreground tabular-nums"
                variants={animated ? valueAnim : undefined}
                {...state}
              >
                {valueText}
              </motion.span>
              <motion.span
                className="max-w-40 truncate text-[10px] font-medium text-muted-foreground"
                variants={animated ? labelAnim : undefined}
                {...state}
              >
                {label}
              </motion.span>
            </div>
          </div>
          <motion.div
            className="flex items-center justify-between"
            variants={animated ? footerAnim : undefined}
            {...state}
          >
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
              {minLabel}
            </span>
            <motion.span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-inset",
                down
                  ? "bg-red-500/10 text-red-600 ring-red-500/15 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/15 dark:text-emerald-400",
              )}
              variants={animated ? pillAnim : undefined}
            >
              <TrendIcon className="size-3" strokeWidth={2.75} />
              {change}
            </motion.span>
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
              {maxLabel}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
