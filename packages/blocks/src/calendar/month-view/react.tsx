import { useRef, useSyncExternalStore } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

const noopSubscribe = () => () => {};

const weekdaysMon = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const weekdaysSun = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type MonthTone = "sky" | "rose" | "emerald" | "violet" | "amber";

const toneStyles: Record<MonthTone, string> = {
  sky: "bg-sky-500 dark:bg-sky-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  violet: "bg-violet-500 dark:bg-violet-400",
  amber: "bg-amber-500 dark:bg-amber-400",
};

export interface MonthEvent {
  day: number;
  tone: MonthTone;
}

export const monthViewDefaultCopy: { events: MonthEvent[] } = {
  events: [
    { day: 4, tone: "sky" },
    { day: 9, tone: "violet" },
    { day: 12, tone: "emerald" },
    { day: 15, tone: "rose" },
    { day: 15, tone: "sky" },
    { day: 21, tone: "amber" },
    { day: 22, tone: "emerald" },
    { day: 27, tone: "violet" },
  ],
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

const header = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const weekdaysWrap = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025, delayChildren: 0.25 } },
} as const;

const weekday = {
  hidden: { opacity: 0, y: -3 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
} as const;

const grid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.012, delayChildren: 0.4 } },
} as const;

const dayCell = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const PILL_BASE = 0.4;
const PILL_STEP = 0.012;
const PILL_OFFSET = 0.25;

const pill = (daysInMonth: number): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 16,
      delay: PILL_BASE + Math.max(daysInMonth - 1, 0) * PILL_STEP + PILL_OFFSET,
    },
  },
});

const pillText = (daysInMonth: number): Variants => ({
  hidden: { color: "var(--color-foreground)" },
  visible: {
    color: "var(--color-primary-foreground)",
    transition: {
      duration: 0.15,
      delay: PILL_BASE + Math.max(daysInMonth - 1, 0) * PILL_STEP + PILL_OFFSET,
    },
  },
});

const dot = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface MonthViewProps extends VisualProps {
  month?: number;
  year?: number;
  highlighted?: number | null;
  weekStartsOn?: 0 | 1;
  events?: MonthEvent[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function MonthView({
  month,
  year,
  highlighted,
  weekStartsOn = 1,
  events = monthViewDefaultCopy.events,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: MonthViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
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

  const now = new Date();
  const currentMonth = month ?? now.getMonth();
  const currentYear = year ?? now.getFullYear();
  const leadingBlanks = (new Date(currentYear, currentMonth, 1).getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = MONTHS[currentMonth];
  const weekdayLabels = weekStartsOn === 1 ? weekdaysMon : weekdaysSun;
  const isThisMonth =
    isHydrated && currentMonth === now.getMonth() && currentYear === now.getFullYear();
  const today = highlighted === null ? null : highlighted ?? (isThisMonth ? now.getDate() : null);

  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < totalCells) cells.push(null);

  const eventsByDay = events.reduce<Record<number, MonthTone[]>>((acc, ev) => {
    (acc[ev.day] ||= []).push(ev.tone);
    return acc;
  }, {});
  const pillVariants = animated ? pill(daysInMonth) : undefined;
  const pillTextVariants = animated ? pillText(daysInMonth) : undefined;

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
        <div className="relative rounded-2xl border bg-card p-3 shadow-xs">
          <motion.div
            className="flex items-center justify-between pb-2.5"
            variants={animated ? header : undefined}
            {...state}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground">{currentYear}</span>
              <span className="text-sm font-semibold text-foreground">{monthName}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronLeft className="size-3.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronRight className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
          <motion.div
            className="grid grid-cols-7 pb-1"
            variants={animated ? weekdaysWrap : undefined}
            {...state}
          >
            {weekdayLabels.map((label, i) => (
              <motion.span
                key={i}
                className="text-center text-[9px] font-semibold tracking-wide text-muted-foreground uppercase"
                variants={animated ? weekday : undefined}
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            className="grid grid-cols-7 gap-y-1"
            variants={animated ? grid : undefined}
            {...state}
          >
            {cells.map((day, i) => {
              if (day === null) {
                return (
                  <div key={i} className="relative flex h-7 flex-col items-center justify-center" />
                );
              }
              const isSelected = day === today;
              const dayEvents = eventsByDay[day];
              return (
                <motion.div
                  key={i}
                  className="relative flex h-9 flex-col items-center justify-center"
                  variants={animated ? dayCell : undefined}
                >
                  <div
                    className={`relative flex size-7 items-center justify-center rounded-full text-[11px] ${isSelected ? `font-semibold text-primary-foreground` : `font-medium text-foreground`}`}
                  >
                    {isSelected && animated ? (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary shadow-xs"
                        variants={pillVariants}
                      />
                    ) : isSelected ? (
                      <span className="absolute inset-0 rounded-full bg-primary shadow-xs" />
                    ) : null}
                    {isSelected && animated ? (
                      <motion.span className="relative" variants={pillTextVariants}>
                        {day}
                      </motion.span>
                    ) : (
                      <span className="relative">{day}</span>
                    )}
                  </div>
                  {dayEvents && dayEvents.length > 0 && (
                    <div className="absolute -bottom-0.5 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((tone, j) => (
                        <motion.span
                          key={j}
                          className={`size-1 rounded-full ${toneStyles[tone]}`}
                          variants={animated ? dot : undefined}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
