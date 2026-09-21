import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Database, Play, Table2, Timer } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface QueryCondition {
  field: string;
  operator: string;
  value: string;
}

export const queryDefaultConditions: QueryCondition[] = [
  { field: "status", operator: "=", value: "paid" },
  { field: "total", operator: ">", value: "100" },
];

export const queryDefaultColumns = ["id", "customer", "total"];

export const queryDefaultRows: string[][] = [
  ["4291", "Emma Wilson", "$249.00"],
  ["4288", "Lisa Chang", "$512.00"],
  ["4283", "Noah Reyes", "$134.50"],
  ["4279", "Ivy Sandoval", "$408.00"],
];

const timing = {
  sourceDelay: 0.2,
  conditionsStart: 0.38,
  conditionStep: 0.2,
  chipOffset: 0.09,
  runGap: 0.18,
  sweepDuration: 0.6,
  sweepFillRatio: 0.7,
  resultsGap: 0.06,
  rowStep: 0.09,
  footerGap: 0.16,
} as const;

const sweepStart = (index: number) =>
  timing.conditionsStart + Math.max(index - 1, 0) * timing.conditionStep + 0.32;
const sweepRun = (index: number) => sweepStart(index) + timing.runGap;
const sweepEnd = (index: number) => sweepRun(index) + timing.sweepDuration * timing.sweepFillRatio;
const resultsStart = (index: number) => sweepEnd(index) + timing.resultsGap;

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

const sourceAnim = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: timing.sourceDelay, ease: "easeOut" } },
} as const;

const conditionAnim: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: timing.conditionsStart + index * timing.conditionStep,
      ease: "easeOut",
    },
  }),
} as const;

const valueAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 14,
      delay: timing.conditionsStart + index * timing.conditionStep + timing.chipOffset,
    },
  }),
} as const;

const runAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 14, delay: timing.sourceDelay + 0.1 },
  },
} as const;

const sweepVariants = (index: number): Variants => ({
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: [0, 1, 1],
    opacity: [1, 1, 0],
    transition: {
      duration: timing.sweepDuration,
      delay: sweepRun(index),
      times: [0, timing.sweepFillRatio, 1],
      ease: "easeInOut",
    },
  },
});

const headAnim = (index: number): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, delay: resultsStart(index), ease: "easeOut" } },
});

const resultRowVariants = (index: number): Variants => ({
  hidden: { opacity: 0, y: 6 },
  visible: (row: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      delay: resultsStart(index) + 0.12 + row * timing.rowStep,
      ease: "easeOut",
    },
  }),
});

const footerVariants = (index: number, rowCount: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: resultsStart(index) + 0.12 + rowCount * timing.rowStep + timing.footerGap,
      ease: "easeOut",
    },
  },
});

const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

/** Auto-links email addresses inside a string (POC build renders them as mailto anchors). */
function EmailText({ text }: { text: string }) {
  const match = EMAIL_RE.exec(text);
  if (!match) return <>{text}</>;
  const email = match[1]!;
  const parts = text.split(email);
  return (
    <>
      {parts[0]}
      <a href={`mailto:${email}`}>{email}</a>
      {parts[1]}
    </>
  );
}

export interface QueryProps extends VisualProps {
  source?: string;
  duration?: string;
  conditions?: readonly QueryCondition[];
  columns?: readonly string[];
  rows?: readonly (readonly string[])[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Query({
  source = "orders",
  conditions = queryDefaultConditions,
  columns = queryDefaultColumns,
  rows = queryDefaultRows,
  duration = "24 ms",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: QueryProps) {
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
  const activeConditions = conditions.length ? conditions : queryDefaultConditions;
  const activeColumns = columns.length ? columns : queryDefaultColumns;
  const activeRows = (rows.length ? rows : queryDefaultRows).map((row) =>
    activeColumns.map((_, i) => row[i] ?? ""),
  );
  const conditionCount = activeConditions.length;
  const sweep = sweepVariants(conditionCount);
  const head = headAnim(conditionCount);
  const rowVariants = resultRowVariants(conditionCount);
  const footer = footerVariants(conditionCount, activeRows.length);

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
        className={`relative flex w-full max-w-88 flex-col gap-1.5 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center justify-between border-b px-3 py-2.25"
            variants={animated ? sourceAnim : undefined}
            {...state}
          >
            <div className="flex min-w-0 items-center gap-1">
              <Database className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
              <span className="shrink-0 text-[10px]/4 text-muted-foreground">From</span>
              <span className="min-w-0 truncate text-[10px]/4 font-semibold text-foreground underline decoration-primary/25 underline-offset-2">
                {source}
              </span>
            </div>
            <motion.button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-1.25 text-[9px] leading-none font-semibold text-primary-foreground"
              variants={animated ? runAnim : undefined}
              {...state}
            >
              <Play className="size-2 shrink-0 fill-current" strokeWidth={3} />
              Run
            </motion.button>
          </motion.div>
          <div className="flex flex-col gap-1.5 bg-muted/40 px-3 py-2.5">
            {activeConditions.map((condition, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                variants={animated ? conditionAnim : undefined}
                custom={i}
                {...state}
              >
                <span className="w-8 shrink-0 text-[10px]/4 text-muted-foreground">
                  {i === 0 ? "Where" : "And"}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5 shadow-xs">
                  <span className="truncate font-mono text-[10px] font-medium text-foreground">
                    {condition.field}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {condition.operator}
                  </span>
                  <motion.span
                    className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary ring-1 ring-primary/15 ring-inset dark:text-foreground"
                    variants={animated ? valueAnim : undefined}
                    custom={i}
                    {...state}
                  >
                    {condition.value}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
          {animated && (
            <motion.div
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
              variants={sweep}
              {...state}
            />
          )}
        </div>
        <div className="relative">
          {gradient && !fadeOut && (
            <>
              <motion.div
                className="absolute -inset-x-px -bottom-1.5 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? glowAnim : undefined}
                {...state}
              />
              <motion.div
                className="absolute -inset-x-1.5 -bottom-1.5 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
                variants={animated ? veilAnim : undefined}
                {...state}
              />
            </>
          )}
          <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xs">
            <table className="w-full table-fixed">
              <motion.thead variants={animated ? head : undefined} {...state}>
                <tr className="border-b bg-muted/25">
                  {activeColumns.map((column, i) => (
                    <th
                      key={i}
                      className={`truncate py-1.75 text-left text-[10px] font-medium text-muted-foreground ${i === 0 ? "pr-1.5 pl-3" : i === activeColumns.length - 1 ? "pr-3 pl-1.5" : "px-1.5"}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </motion.thead>
              <tbody>
                {activeRows.map((row, i) => (
                  <motion.tr
                    key={i}
                    className="border-b border-border/50"
                    variants={animated ? rowVariants : undefined}
                    custom={i}
                    {...state}
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`truncate py-1.75 text-[10px] ${j === 0 ? "pr-1.5 pl-3 font-mono text-muted-foreground" : j === row.length - 1 ? "pr-3 pl-1.5 font-medium text-foreground" : "px-1.5 text-foreground"}`}
                      >
                        <EmailText text={cell} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <motion.div
              className="flex items-center justify-between px-3 py-2"
              variants={animated ? footer : undefined}
              {...state}
            >
              <div className="flex items-center gap-1.5">
                <Table2 className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                {/* renderToString emitted `N<!-- --> rows`; two text nodes for parity */}
                <span
                  className="text-[10px] leading-none text-muted-foreground tabular-nums"
                  dangerouslySetInnerHTML={{ __html: `${activeRows.length}<!-- --> rows` }}
                />
              </div>
              <div className="flex items-center gap-1">
                <Timer className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                <span className="text-[10px] leading-none text-muted-foreground tabular-nums">
                  {duration}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
