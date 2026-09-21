import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const comparisonDefault = {
  title: "Conversion Rate",
  before: "2.4%",
  after: "4.8%",
  improvement: "+100% lift",
  beforeBar: 50,
  afterBar: 100,
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

const gridAnim = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: 0.4, delay: 0.2, ease: "easeOut" } },
} as const;

const beforeAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.45, ease: "easeOut" } },
} as const;

const afterAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.85, ease: "easeOut" } },
} as const;

const beforeBarAnim = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, delay: 0.55, ease: "easeOut" } },
} as const;

const afterBarAnim = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.55, delay: 0.95, ease: "easeOut" } },
} as const;

const arrowAnim = {
  hidden: { scale: 0, opacity: 0, x: -6 },
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 360, damping: 16, delay: 0.7 },
  },
} as const;

const pillAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 16, delay: 1.15 },
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

export interface ComparisonProps extends VisualProps {
  title?: string;
  before?: string;
  after?: string;
  improvement?: string;
  beforeBar?: number;
  afterBar?: number;
  isometric?: boolean;
  gradient?: boolean;
}

export function Comparison({
  title = comparisonDefault.title,
  before = comparisonDefault.before,
  after = comparisonDefault.after,
  improvement = comparisonDefault.improvement,
  beforeBar = comparisonDefault.beforeBar,
  afterBar = comparisonDefault.afterBar,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  className,
}: ComparisonProps) {
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
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className="relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? wrapIso : wrap) : undefined}
        {...state}
      >
        {gradient && (
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
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3.5 py-2.5">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <motion.span
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0"
              variants={animated ? pillAnim : undefined}
              {...state}
            >
              <CircleCheck className="size-3" strokeWidth={2.5} />
              {improvement}
            </motion.span>
          </div>
          <motion.div
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5"
            variants={animated ? gridAnim : undefined}
            {...state}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
                Before
              </span>
              <motion.span
                className="text-xl font-semibold tracking-tight text-muted-foreground tabular-nums"
                variants={animated ? beforeAnim : undefined}
              >
                {before}
              </motion.span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full origin-left rounded-full bg-muted-foreground/40"
                  style={{ width: `${beforeBar}%` }}
                  variants={animated ? beforeBarAnim : undefined}
                />
              </div>
            </div>
            <motion.div
              className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset"
              variants={animated ? arrowAnim : undefined}
              {...state}
            >
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-semibold tracking-wider text-primary uppercase">
                After
              </span>
              <motion.span
                className="text-xl font-semibold tracking-tight text-foreground tabular-nums"
                variants={animated ? afterAnim : undefined}
              >
                {after}
              </motion.span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full origin-left rounded-full bg-primary"
                  style={{ width: `${afterBar}%` }}
                  variants={animated ? afterBarAnim : undefined}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
