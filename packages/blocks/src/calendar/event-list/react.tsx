import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Coffee, Plane, Sparkles, Users, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export type EventCategory = "meeting" | "team" | "personal" | "focus" | "travel";

export interface EventItem {
  category: EventCategory;
  title: string;
  detail: string;
  time: string;
  duration: string;
  group: string;
}

export const eventListDefaultCopy: { title: string; items: EventItem[] } = {
  title: "Up next",
  items: [
    { category: "meeting", title: "Design review", detail: "with Sarah, Alex", time: "9:30", duration: "45m", group: "Today" },
    { category: "focus", title: "Deep work · spec draft", detail: "Notification center", time: "11:00", duration: "2h", group: "Today" },
    { category: "team", title: "All-hands", detail: "Q2 roadmap update", time: "10:00", duration: "30m", group: "Tomorrow" },
    { category: "travel", title: "Flight to Berlin", detail: "BER · LH 401", time: "16:20", duration: "2h 5m", group: "Tomorrow" },
  ],
};

const categoryStyles: Record<EventCategory, { icon: LucideIcon; accent: string; bar: string }> = {
  meeting: {
    icon: Video,
    accent: "bg-sky-50 border-sky-500/20 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    bar: "bg-sky-500",
  },
  team: {
    icon: Users,
    accent: "bg-violet-50 border-violet-500/20 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    bar: "bg-violet-500",
  },
  personal: {
    icon: Coffee,
    accent: "bg-amber-50 border-amber-500/20 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  focus: {
    icon: Sparkles,
    accent: "bg-emerald-50 border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  travel: {
    icon: Plane,
    accent: "bg-rose-50 border-rose-500/20 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    bar: "bg-rose-500",
  },
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const row = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const groupHeader = {
  hidden: { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface EventListProps extends VisualProps {
  title?: string;
  items?: EventItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function EventList({
  title = eventListDefaultCopy.title,
  items = eventListDefaultCopy.items,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: EventListProps) {
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

  const rows = items.map((item, i) => ({
    item,
    showHeader: i === 0 || items[i - 1]!.group !== item.group,
  }));

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
        className={`relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {items.length}
            </span>
          </div>
          <motion.div
            className="flex flex-col"
            variants={animated ? list : undefined}
            {...state}
          >
            {rows.flatMap(({ item, showHeader }, i) => {
              const { icon: Icon, accent, bar } = categoryStyles[item.category];
              const isLast = i === rows.length - 1;
              const out = [];
              if (showHeader) {
                out.push(
                  <motion.div
                    key={`h-${i}`}
                    className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5"
                    variants={animated ? groupHeader : undefined}
                  >
                    <span className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {item.group}
                    </span>
                  </motion.div>,
                );
              }
              out.push(
                <motion.div
                  key={`r-${i}`}
                  className={`flex items-stretch gap-2.5 px-3 py-2.5 ${isLast ? `` : `border-b`}`}
                  variants={animated ? row : undefined}
                >
                  <div className="flex w-10 shrink-0 flex-col items-end pt-0.5">
                    <span className="text-xs font-semibold text-foreground tabular-nums">{item.time}</span>
                    <span className="text-[9px] text-muted-foreground">{item.duration}</span>
                  </div>
                  <div className={`w-0.5 shrink-0 rounded-full ${bar}`} />
                  <div className="flex min-w-0 flex-1 items-start gap-2 pt-0.5">
                    <div className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${accent}`}>
                      <Icon className="size-3" strokeWidth={2} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-xs font-medium text-foreground">{item.title}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{item.detail}</span>
                    </div>
                  </div>
                </motion.div>,
              );
              return out;
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
