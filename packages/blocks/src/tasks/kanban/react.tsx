import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { MessageSquare, Paperclip } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface KanbanCard {
  title: string;
  comments?: number;
  attachments?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  dot?: "neutral" | "active" | "success" | "warning" | "destructive";
  cards: readonly KanbanCard[];
}

export const kanbanDefaultColumns: readonly KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    dot: "neutral",
    cards: [
      { title: "Audit empty states", comments: 4 },
      { title: "Fix billing tax calc", attachments: 2 },
      { title: "Add CSV export" },
    ],
  },
  {
    id: "progress",
    title: "Progress",
    dot: "active",
    cards: [{ title: "Notification center v2", comments: 7 }, { title: "Refactor billing module" }],
  },
  {
    id: "done",
    title: "Done",
    dot: "success",
    cards: [{ title: "Onboarding spec v3", comments: 12 }, { title: "Hotfix · login redirect" }],
  },
];

const dotStyles: Record<NonNullable<KanbanColumn["dot"]>, string> = {
  neutral: "bg-muted-foreground/40",
  active: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
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

const gridAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.25 } },
} as const;

const columnAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.07, delayChildren: 0.05 },
  },
} as const;

const cardAnim = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface KanbanProps extends VisualProps {
  title?: string;
  meta?: string;
  columns?: readonly KanbanColumn[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Kanban({
  title = "Kanban board",
  meta,
  columns = kanbanDefaultColumns,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: KanbanProps) {
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
  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);

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
        className={`relative w-full${fill ? "" : " max-w-96"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
            className="flex items-center justify-between border-b px-3 py-2.75"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <span className="rounded-full bg-primary/10 px-1.75 py-px text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {meta ?? `${totalCards} tasks`}
            </span>
          </motion.div>
          <motion.div
            className="grid gap-2 p-2"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            variants={animated ? gridAnim : undefined}
            {...state}
          >
            {columns.map((col) => (
              <motion.div
                key={col.id}
                className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-1.5"
                variants={animated ? columnAnim : undefined}
              >
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${dotStyles[col.dot ?? "neutral"]}`} />
                    <span className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {col.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground tabular-nums">
                    {col.cards.length}
                  </span>
                </div>
                {col.cards.length === 0 && (
                  <div className="h-12 rounded-md border-2 border-dashed border-border/40" />
                )}
                {col.cards.map((cardItem, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col gap-1.5 rounded-md border bg-background p-2 shadow-xs"
                    variants={animated ? cardAnim : undefined}
                  >
                    <span className="line-clamp-2 text-[10px]/tight font-medium text-foreground">
                      {cardItem.title}
                    </span>
                    {(cardItem.comments !== undefined || cardItem.attachments !== undefined) && (
                      <div className="flex items-center gap-1.5 text-[9px] leading-none text-muted-foreground tabular-nums">
                        {cardItem.comments !== undefined && (
                          <span className="inline-flex items-center gap-0.5">
                            <MessageSquare className="size-2.5 shrink-0" strokeWidth={2.25} />
                            <span className="leading-none">{cardItem.comments}</span>
                          </span>
                        )}
                        {cardItem.attachments !== undefined && (
                          <span className="inline-flex items-center gap-0.5">
                            <Paperclip className="size-2.5 shrink-0" strokeWidth={2.25} />
                            <span className="leading-none">{cardItem.attachments}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
