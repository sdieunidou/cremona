import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const donutDefault = {
  title: "Storage",
  badge: "Pro Plan",
  centerValue: "82%",
  centerLabel: "of 100GB",
  segments: [
    { label: "Documents", value: 38, color: "var(--color-chart-1)" },
    { label: "Media", value: 26, color: "var(--color-chart-2)" },
    { label: "Apps", value: 18, color: "var(--color-chart-3)" },
    { label: "Free", value: 18, color: "var(--color-primary)" },
  ],
} as const;

const SIZE = 120;
const STROKE = 14;
const RADIUS = 53;
const CIRC = 2 * Math.PI * RADIUS;
const GAP = 4;

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Arc extends Segment {
  dash: string;
  offset: number;
  visibleLength: number;
  percent: number;
}

function computeArcs(segments: readonly Segment[]): Arc[] {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  let acc = 0;
  return segments.map((s) => {
    const frac = s.value / total;
    const arc = frac * CIRC;
    const length = Math.max(0, arc - GAP);
    const offset = -acc;
    const dash = `${length} ${CIRC}`;
    const percent = Math.round(frac * 100);
    acc += arc;
    return { ...s, dash, offset, visibleLength: length, percent };
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

const svgAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.35 },
  },
} as const;

const segAnim: Variants = {
  hidden: ({ offset }: { offset: number }) => ({
    strokeDasharray: `0 ${CIRC}`,
    strokeDashoffset: offset,
    opacity: 0,
  }),
  visible: ({ offset, visibleLength }: { offset: number; visibleLength: number }) => ({
    strokeDasharray: `${visibleLength} ${CIRC}`,
    strokeDashoffset: offset,
    opacity: 1,
    transition: {
      strokeDasharray: { duration: 0.5, ease: "easeOut" },
      opacity: { duration: 0.2 },
    },
  }),
};

const centerAnim = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 1.1 },
  },
} as const;

const legendAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 1.2 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface DonutProps extends VisualProps {
  title?: string;
  badge?: string;
  centerValue?: string;
  centerLabel?: string;
  segments?: readonly Segment[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Donut({
  title = donutDefault.title,
  badge = donutDefault.badge,
  centerValue = donutDefault.centerValue,
  centerLabel = donutDefault.centerLabel,
  segments = donutDefault.segments,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: DonutProps) {
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
  const arcs = computeArcs(segments);

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
        <div className="relative flex flex-col gap-3 rounded-2xl border bg-card px-4 py-4 shadow-xs">
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
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              <motion.svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                aria-hidden="true"
                variants={animated ? svgAnim : undefined}
                {...state}
              >
                <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                  {arcs.map((arc, i) => (
                    <motion.circle
                      key={i}
                      custom={{ offset: arc.offset, visibleLength: arc.visibleLength }}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={RADIUS}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={arc.dash}
                      strokeDashoffset={arc.offset}
                      variants={animated ? segAnim : undefined}
                    />
                  ))}
                </g>
              </motion.svg>
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center will-change-transform"
                variants={animated ? centerAnim : undefined}
                {...state}
              >
                <span className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
                  {centerValue}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">{centerLabel}</span>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1"
            variants={animated ? legendAnim : undefined}
            {...state}
          >
            {arcs.map((arc, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between gap-2"
                variants={animated ? itemAnim : undefined}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="inline-flex size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: arc.color }}
                  />
                  <span className="truncate text-[10px] font-medium text-foreground">{arc.label}</span>
                </div>
                <span
                  className="text-[10px] text-muted-foreground tabular-nums"
                  dangerouslySetInnerHTML={{ __html: `${arc.percent}<!-- -->%` }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
