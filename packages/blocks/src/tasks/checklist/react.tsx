import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Flag } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ChecklistItem {
  title: string;
  detail?: string;
  done?: boolean;
  priority?: "high" | "med" | "low";
}

export const checklistDefaultItems: readonly ChecklistItem[] = [
  { title: "Review onboarding spec", detail: "v3 · final pass", done: true, priority: "high" },
  { title: "Reply to design feedback", detail: "Sarah · #design-review", done: true, priority: "med" },
  { title: "Ship notification center", detail: "Deploy v2.4 · production", done: false, priority: "high" },
  { title: "Draft Q2 OKRs", detail: "Due Friday", done: false, priority: "med" },
  { title: "Refactor billing module", detail: "Split into 3 PRs", done: false, priority: "low" },
];

const priorityStyles: Record<NonNullable<ChecklistItem["priority"]>, string> = {
  high: "text-destructive",
  med: "text-amber-600 dark:text-amber-400",
  low: "text-muted-foreground",
};

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

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const progressAnim = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, delay: 0.4, ease: "easeOut" } },
} as const;

const listAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const checkAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.35, delay: 0.2, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface ChecklistProps extends VisualProps {
  title?: string;
  items?: readonly ChecklistItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Checklist({
  title = "Today's tasks",
  items = checklistDefaultItems,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ChecklistProps) {
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
  const doneCount = items.filter((item) => item.done).length;
  const progress = items.length > 0 ? doneCount / items.length : 0;

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
        className={`relative w-full${fill ? "" : " max-w-80"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
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
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex flex-col gap-2 border-b px-3 py-3"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{title}</span>
              {/* renderToString emitted `2<!-- -->/<!-- -->5`; three text nodes for parity */}
              <span
                className="text-[10px] font-medium text-muted-foreground tabular-nums"
                dangerouslySetInnerHTML={{ __html: `${doneCount}<!-- -->/<!-- -->${items.length}` }}
              />
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                style={{ width: `${progress * 100}%`, transform: animated ? undefined : "scaleX(1)" }}
                variants={animated ? progressAnim : undefined}
                {...state}
              />
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col divide-y"
            variants={animated ? listAnim : undefined}
            {...state}
          >
            {items.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/40"
                variants={animated ? itemAnim : undefined}
              >
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${item.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
                >
                  {item.done && (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.polyline points="20 6 9 17 4 12" variants={animated ? checkAnim : undefined} />
                    </svg>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`truncate text-xs font-medium ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {item.title}
                  </span>
                  {item.detail && (
                    <span
                      className={`truncate text-[10px] text-muted-foreground ${item.done ? "line-through" : ""}`}
                    >
                      {item.detail}
                    </span>
                  )}
                </div>
                {item.priority && (
                  <Flag
                    className={`size-3 shrink-0 ${item.done ? "text-muted-foreground/40" : priorityStyles[item.priority]}`}
                    strokeWidth={2.25}
                    fill="currentColor"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
