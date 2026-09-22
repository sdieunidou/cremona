import { useRef, useSyncExternalStore } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

const noopSubscribe = () => () => {};

const weekdaysMon = ["M", "T", "W", "T", "F", "S", "S"];
const weekdaysSun = ["S", "M", "T", "W", "T", "F", "S"];
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

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const card = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const header = {
  hidden: { opacity: 0, y: -3 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.15, ease: "easeOut" } },
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
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const PILL_BASE = 0.4;
const PILL_STEP = 0.012;
const PILL_OFFSET = 0.2;

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

export interface DatePickerProps extends VisualProps {
  month?: number;
  year?: number;
  highlighted?: number | null;
  selected?: number | null;
  rangeStart?: number | null;
  rangeEnd?: number | null;
  weekStartsOn?: 0 | 1;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function DatePicker({
  month,
  year,
  highlighted,
  selected,
  rangeStart = null,
  rangeEnd = null,
  weekStartsOn = 1,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: DatePickerProps) {
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
  const active = selected === undefined ? today : selected;

  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < totalCells) cells.push(null);

  const range =
    rangeStart !== null && rangeEnd !== null && rangeStart <= rangeEnd && rangeStart >= 1 && rangeEnd <= daysInMonth
      ? { start: rangeStart, end: rangeEnd }
      : null;
  const pillVariants = animated ? pill(daysInMonth) : undefined;
  const pillTextVariants = animated ? pillText(daysInMonth) : undefined;

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
        className={`relative flex w-full${fill ? "" : " max-w-72"} flex-col ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated && isometric ? containerIso : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <motion.div
          className="relative w-full rounded-xl border bg-card p-3 shadow-xs"
          variants={animated ? card : undefined}
          {...state}
        >
          <motion.div
            className="mb-3 flex items-center justify-between rounded-full bg-muted/60 p-1"
            variants={animated ? header : undefined}
            {...state}
          >
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronLeft className="size-3.5" strokeWidth={2} />
            </button>
            {/* dynamic array child → React emits <!-- --> text separators like the POC SSR */}
            <span className="text-xs font-semibold text-foreground">
              {[monthName, " ", currentYear]}
            </span>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </button>
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
                return <div key={i} className="relative flex h-7 items-center justify-center" />;
              }
              const isSelected = day === active;
              const isToday = day === today;
              const inRange =
                range !== null && day >= range.start && day <= range.end;
              const isStart = range !== null && day === range.start;
              const isEnd = range !== null && day === range.end;
              const isMiddle = inRange && !isStart && !isEnd;
              const col = i % 7;
              const roundLeft = inRange && (isStart || col === 0);
              const roundRight = inRange && (isEnd || col === 6);
              const marked = isSelected || isStart || isEnd;
              return (
                <motion.div
                  key={i}
                  className="relative flex h-7 items-center justify-center"
                  variants={animated ? dayCell : undefined}
                >
                  {inRange && (
                    <span
                      className={`absolute inset-y-0 bg-primary/10 dark:bg-primary/25 ${roundLeft ? `left-1 rounded-l-full` : `left-0`} ${roundRight ? `right-1 rounded-r-full` : `right-0`}`}
                    />
                  )}
                  <div
                    className={`relative flex size-7 items-center justify-center rounded-full text-[11px] ${marked ? `font-semibold text-primary-foreground` : isMiddle ? `font-medium` : isToday ? `font-semibold text-foreground ring-1 ring-primary/75` : `font-medium text-foreground hover:bg-muted`}`}
                  >
                    {marked && animated ? (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary shadow-xs"
                        variants={pillVariants}
                      />
                    ) : marked ? (
                      <span className="absolute inset-0 rounded-full bg-primary shadow-xs" />
                    ) : null}
                    {marked && animated ? (
                      <motion.span className="relative" variants={pillTextVariants}>
                        {day}
                      </motion.span>
                    ) : (
                      <span className="relative">{day}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
