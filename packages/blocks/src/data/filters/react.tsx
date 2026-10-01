"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

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

export interface FiltersLabels {
  /** Before the first rule. */
  where: string;
  /** Before each following rule. */
  and: string;
  clear: string;
  /** After the match count; `{total}` and `{unit}` are replaced. */
  of: string;
}

export const filtersDefaultLabels: FiltersLabels = {
  where: "Where",
  and: "And",
  clear: "Clear",
  of: "of {total} {unit}",
};

/** Replaces each `{key}` of a label with its value. */
function interpolate(label: string, values: Record<string, string>): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key]! : match,
  );
}

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
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: timing.headerDelay, ease: "easeOut" },
  },
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
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: timing.footerDelay, ease: "easeOut" },
  },
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
  /** Shown in place of the rules when `rules` is empty. */
  emptyLabel?: string;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<FiltersLabels>;
  /** BCP 47 locale of the counts (default `"en-US"`). */
  locale?: string;
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
  emptyLabel = "No filters",
  labels,
  locale = "en-US",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: FiltersProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [landed, setLanded] = useState(0);
  const active =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const state = animated ? { initial: "hidden", animate: active ? "visible" : "hidden" } : {};
  const activeRules = rules;
  const ruleCount = activeRules.length;
  const shownRules = animated ? Math.min(landed, ruleCount) : ruleCount;
  const count = Number.isFinite(total) ? total : 0;
  const lastMatches = shownRules === 0 ? count : activeRules[shownRules - 1]!.matches;
  const matches = Number.isFinite(lastMatches) ? lastMatches : count;
  const pct = count > 0 ? Math.min(Math.max((matches / count) * 100, MIN_PCT), MAX_PCT) : 0;
  const text = { ...filtersDefaultLabels, ...labels };
  const formatCount = new Intl.NumberFormat(locale).format;

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
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={`relative w-full${fill ? " flex h-full flex-col" : " max-w-84"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-card shadow-xs",
            fill && "flex flex-1 flex-col",
          )}
        >
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
              {text.clear}
            </button>
          </motion.div>
          <div className={cn("flex flex-col gap-1.5 bg-muted/40 px-3 py-3", fill && "flex-1")}>
            {ruleCount === 0 && (
              <motion.div
                className="flex items-center gap-2"
                variants={animated ? rowAnim : undefined}
                custom={0}
                {...state}
              >
                <span className="w-8 shrink-0" />
                <span className="py-1.5 text-[10px] text-muted-foreground">{emptyLabel}</span>
              </motion.div>
            )}
            {activeRules.map((rule, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                variants={animated ? rowAnim : undefined}
                custom={i}
                {...state}
              >
                <span className="w-8 shrink-0 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {i === 0 ? text.where : text.and}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5 shadow-xs">
                  <span className="truncate text-[10px] font-medium text-foreground">
                    {rule.field}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {rule.operator}
                  </span>
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
              >
                {interpolate(text.of, { total: formatCount(count), unit })}
              </motion.span>
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
