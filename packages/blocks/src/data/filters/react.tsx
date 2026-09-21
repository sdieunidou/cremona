import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface FilterRule {
  field: string;
  operator: string;
  value: string;
  matches: number;
}

export const filtersDefaultRules: FilterRule[] = [
  { field: "Plan", operator: "is", value: "Pro", matches: 1640 },
  { field: "Status", operator: "is", value: "Active", matches: 1284 },
  { field: "MRR", operator: "is over", value: "$500", matches: 612 },
  { field: "Signed up", operator: "after", value: "Jan 1", matches: 318 },
];

const timing = {
  headerDelay: 0.15,
  footerDelay: 0.3,
  rowsStart: 0.55,
  rowStep: 0.18,
  chipOffset: 0.1,
  countOffset: 0.14,
  barSettle: 0.2,
  labelShift: 0.2,
} as const;

const MIN_PCT = 6;
const MAX_PCT = 100;

const formatCount = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const headerAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: timing.headerDelay, ease: "easeOut" } },
} as const;

const rowAnim: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.32,
      delay: timing.rowsStart + index * timing.rowStep,
      ease: "easeOut",
    },
  }),
} as const;

const chipAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 14,
      delay: timing.rowsStart + index * timing.rowStep + timing.chipOffset,
    },
  }),
} as const;

const footerAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: timing.footerDelay, ease: "easeOut" } },
} as const;

const countAnim = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
} as const;

export interface FiltersProps extends VisualProps {
  title?: string;
  unit?: string;
  total?: number;
  rules?: readonly FilterRule[];
  addLabel?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Filters({
  title = "Filters",
  unit = "customers",
  total = 2480,
  rules = filtersDefaultRules,
  addLabel = "Add filter",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: FiltersProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [landed, setLanded] = useState(0);
  const active =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const state = animated
    ? { initial: "hidden", animate: active ? "visible" : "hidden" }
    : {};
  const activeRules = rules.length ? rules : filtersDefaultRules;
  const ruleCount = activeRules.length;
  const shownRules = animated ? Math.min(landed, ruleCount) : ruleCount;
  const matches = shownRules === 0 ? total : activeRules[shownRules - 1]!.matches;
  const pct = Math.min(Math.max(total > 0 ? (matches / total) * 100 : 100, MIN_PCT), MAX_PCT);

  useEffect(() => {
    if (!animated || !active) return;
    const timers = Array.from({ length: ruleCount }, (_, i) =>
      setTimeout(
        () => setLanded(i + 1),
        (timing.rowsStart + i * timing.rowStep + timing.countOffset) * 1000,
      ),
    );
    return () => {
      timers.forEach(clearTimeout);
      setLanded(0);
    };
  }, [animated, active, ruleCount]);

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
        className={`relative w-full max-w-84 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center justify-between border-b px-3 py-2.75"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3 text-muted-foreground" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-foreground">{title}</span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="text-[10px] font-medium text-muted-foreground"
            >
              Clear
            </button>
          </motion.div>
          <div className="flex flex-col gap-1.5 bg-muted/40 px-3 py-3">
            {activeRules.map((rule, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                variants={animated ? rowAnim : undefined}
                custom={i}
                {...state}
              >
                <span className="w-8 shrink-0 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {i === 0 ? "Where" : "And"}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5 shadow-xs">
                  <span className="truncate text-[10px] font-medium text-foreground">
                    {rule.field}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{rule.operator}</span>
                  <motion.span
                    className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/15 ring-inset"
                    variants={animated ? chipAnim : undefined}
                    custom={i}
                    {...state}
                  >
                    {rule.value}
                  </motion.span>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    className="ml-auto shrink-0 text-muted-foreground/70"
                  >
                    <X className="size-2.5" strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ))}
            <motion.div
              className="flex items-center gap-2"
              variants={animated ? rowAnim : undefined}
              custom={ruleCount}
              {...state}
            >
              <span className="w-8 shrink-0" />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className="flex flex-1 items-center gap-1.5 rounded-lg border border-dashed px-2 py-1.5 text-[10px] font-medium text-muted-foreground"
              >
                <Plus className="size-2.5" strokeWidth={3} />
                {addLabel}
              </button>
            </motion.div>
          </div>
          <motion.div
            className="relative flex flex-col gap-2 border-t px-3 py-2.75"
            variants={animated ? footerAnim : undefined}
            {...state}
          >
            <div className="flex items-baseline gap-1.5">
              <motion.span
                className="text-sm font-semibold text-foreground tabular-nums"
                variants={animated ? countAnim : undefined}
                initial={animated ? "hidden" : undefined}
                animate={animated ? "visible" : undefined}
              >
                {formatCount(matches)}
              </motion.span>
              <motion.span
                layout={animated ? "position" : false}
                transition={{ duration: timing.labelShift, ease: "easeOut" }}
                className="text-[10px] text-muted-foreground"
                // renderToString emitted `of <!-- -->N<!-- --> <!-- -->unit`;
                // four text nodes for parity
                dangerouslySetInnerHTML={{
                  __html: `of <!-- -->${formatCount(total)}<!-- --> <!-- -->${unit}`,
                }}
              />
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={animated ? { width: "100%" } : undefined}
                animate={animated ? { width: `${pct}%` } : undefined}
                style={animated ? undefined : { width: `${pct}%` }}
                transition={{ duration: timing.barSettle, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
