import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ImportMapping {
  source: string;
  target?: string;
}

export const importDefaultMappings: ImportMapping[] = [
  { source: "Email Address", target: "email" },
  { source: "Full Name", target: "name" },
  { source: "Company", target: "company" },
  { source: "Signup Date", target: "created_at" },
  { source: "Internal Ref" },
];

const timing = { start: 0.15, step: 0.09, duration: 0.4 } as const;

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

const rowAnim: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.duration,
      delay: timing.start + index * timing.step,
      ease: "easeOut",
    },
  }),
} as const;

export interface ImportProps extends VisualProps {
  fileName?: string;
  rowCount?: number;
  unit?: string;
  mappings?: readonly ImportMapping[];
  sourceLabel?: string;
  targetLabel?: string;
  skipLabel?: string;
  actionLabel?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Import({
  fileName = "customers.csv",
  rowCount = 2480,
  unit = "rows ready",
  mappings = importDefaultMappings,
  sourceLabel = "CSV column",
  targetLabel = "Field",
  skipLabel = "Skip",
  actionLabel = "Import",
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ImportProps) {
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
  const activeMappings = mappings.length ? mappings : importDefaultMappings;
  const footerIndex = activeMappings.length + 2;

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
        className={`relative w-full${fill ? "" : " max-w-88"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
            className="flex items-center gap-2 border-b px-3 py-2.75"
            variants={animated ? rowAnim : undefined}
            custom={0}
            {...state}
          >
            <FileSpreadsheet className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
            <span className="min-w-0 truncate text-[11px]/4 font-semibold text-foreground">
              {fileName}
            </span>
          </motion.div>
          <div className="flex flex-col gap-1.5 bg-muted/40 px-3 py-3">
            <motion.div
              className="flex items-center gap-2 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase"
              variants={animated ? rowAnim : undefined}
              custom={1}
              {...state}
            >
              <span className="flex-1 truncate">{sourceLabel}</span>
              <span className="w-6 shrink-0" />
              <span className="flex-1 truncate">{targetLabel}</span>
            </motion.div>
            {activeMappings.map((mapping, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                variants={animated ? rowAnim : undefined}
                custom={i + 2}
                {...state}
              >
                <div className="flex min-w-0 flex-1 items-center rounded-lg border bg-card px-2 py-1.5 shadow-xs">
                  <span className="truncate text-[10px] font-medium text-foreground">
                    {mapping.source}
                  </span>
                </div>
                <div className="flex w-6 shrink-0 items-center gap-0.5">
                  <span
                    className={`h-px flex-1 ${mapping.target ? "bg-primary/40" : "bg-border"}`}
                  />
                  <ArrowRight
                    className={`size-2.5 shrink-0 ${mapping.target ? "text-primary" : "text-muted-foreground/50"}`}
                    strokeWidth={3}
                  />
                </div>
                <div
                  className={`flex min-w-0 flex-1 items-center rounded-lg px-2 py-1.5 ${mapping.target ? "border border-dashed border-primary/25 bg-primary/5" : "border border-dashed"}`}
                >
                  <span
                    className={`truncate text-[10px] font-medium ${mapping.target ? "font-mono text-primary/80 dark:text-foreground" : "text-muted-foreground"}`}
                  >
                    {mapping.target ?? skipLabel}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="flex items-center justify-between border-t px-3 py-2.5"
            variants={animated ? rowAnim : undefined}
            custom={footerIndex}
            {...state}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCount(rowCount)}
              </span>
              <span className="text-[10px] text-muted-foreground">{unit}</span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold text-primary-foreground"
            >
              {actionLabel}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
