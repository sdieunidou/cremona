import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, Check, GitPullRequest, X } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface PullRequestCheck {
  name: string;
  duration: string;
}

export interface PullRequestProps extends VisualProps {
  variant?: "passing" | "failing";
  title?: string;
  number?: string;
  source?: string;
  target?: string;
  files?: number;
  additions?: number;
  deletions?: number;
  checks?: PullRequestCheck[];
  reviewer?: string;
  reviewerImage?: string;
  status?: string;
  mergeLabel?: string;
  hover?: boolean;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

const defaultTitle = "Add Stripe checkout flow";
const defaultNumber = "#482";
const defaultSource = "feat/checkout";
const defaultTarget = "main";
const defaultFiles = 8;
const defaultAdditions = 214;
const defaultDeletions = 36;
const defaultReviewer = "Emma Wallace";
const defaultStatus = "Open";
const checksQueued = "Checks queued";
const checksRunning = "Checks running";
const defaultChecks = [
  { name: "build", duration: "1m 12s" },
  { name: "tests", duration: "2m 04s" },
  { name: "lint", duration: "18s" },
];
const mergeLabels = { passing: "Merge pull request", failing: "Merge blocked" };
const MAX_CHECKS = 4;
const BAR_UNITS = 5;
const HEADER_DELAY = 0.12;
const BRANCH_DELAY = 0.22;
const FILES_DELAY = 0.32;
const CHECK_BASE_DELAY = 0.42;
const CHECK_STAGGER = 0.09;
const FOOTER_DELAY = 0.72;
const CYCLE_TOTAL = 2.4;
const CYCLE_FIRST_DELAY = 1;
const OPACITY_DURATION = 0.3;
const SPIN_DURATION = 0.8;
const CHECK_INTERVAL_MS = 1150;

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
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: HEADER_DELAY, ease: "easeOut" },
  },
} as const;

const riseAnim: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 24, delay },
  }),
};

const checkAnim: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 26,
      delay: CHECK_BASE_DELAY + index * CHECK_STAGGER,
    },
  }),
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

type CheckStatus = "pending" | "running" | "passed" | "failed";

function CheckRow({
  check,
  status,
  index,
  animated,
  spinActive,
  motionProps,
}: {
  check: PullRequestCheck;
  status: CheckStatus;
  index: number;
  animated: boolean;
  spinActive: boolean;
  motionProps: Record<string, unknown>;
}) {
  const isPending = status === "pending";
  const isRunning = status === "running";
  const isPassed = status === "passed";
  const isFailed = status === "failed";
  const isDone = isPassed || isFailed;
  const fade = { duration: OPACITY_DURATION, ease: "easeOut" } as const;
  return (
    <motion.div
      className="relative flex items-center gap-2.5 rounded-xl px-2 py-1.5"
      variants={animated ? checkAnim : undefined}
      custom={index}
      {...motionProps}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl bg-primary/5 ring-1 ring-primary/20 ring-inset"
        initial={false}
        animate={{ opacity: +!!isRunning }}
        transition={fade}
      />
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        <motion.span
          className="absolute block size-1.5 rounded-full bg-muted-foreground/25"
          initial={false}
          animate={{ opacity: +!!isPending }}
          transition={fade}
        />
        <motion.span
          className="absolute flex items-center justify-center"
          initial={false}
          animate={{ opacity: +!!isRunning }}
          transition={fade}
        >
          <motion.span
            className="block size-3.5 rounded-full border-[1.5px] border-primary/20 border-t-primary"
            animate={spinActive ? { rotate: 360 } : { rotate: 0 }}
            transition={
              spinActive
                ? { duration: SPIN_DURATION, ease: "linear", repeat: 1 / 0 }
                : { duration: 0 }
            }
          />
        </motion.span>
        <motion.span
          className={cn(
            "absolute flex size-4 items-center justify-center rounded-full ring-1 ring-inset",
            isFailed
              ? "bg-destructive/10 text-destructive ring-destructive/20"
              : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
          )}
          initial={false}
          animate={{ opacity: +!!isDone, scale: isDone ? 1 : 0.7 }}
          transition={
            isDone
              ? { type: "spring", stiffness: 420, damping: 18 }
              : { duration: OPACITY_DURATION, ease: "easeOut" }
          }
        >
          {isFailed ? (
            <X className="size-2.5" strokeWidth={3} />
          ) : (
            <Check className="size-2.5" strokeWidth={3} />
          )}
        </motion.span>
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium text-foreground">
        {check.name}
      </span>
      <motion.span
        className="shrink-0 text-[10px] text-muted-foreground tabular-nums"
        initial={false}
        animate={{ opacity: +!!isDone, x: isDone ? 0 : -4 }}
        transition={fade}
      >
        {check.duration}
      </motion.span>
    </motion.div>
  );
}

export function PullRequest({
  variant = "passing",
  title = defaultTitle,
  number = defaultNumber,
  source = defaultSource,
  target = defaultTarget,
  files = defaultFiles,
  additions = defaultAdditions,
  deletions = defaultDeletions,
  checks,
  reviewer = defaultReviewer,
  reviewerImage,
  status = defaultStatus,
  mergeLabel,
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  fadeOut = false,
  isometric = false,
  fill = false,
  className,
}: PullRequestProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const cycling = animated && (hover ? hovering : triggered) && ready;
  const spinning = animated && triggered && ready;
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const rows = (checks?.length ? checks : defaultChecks).slice(0, MAX_CHECKS);
  const checkCount = rows.length;
  const failing = variant === "failing";
  const buttonLabel = mergeLabel ?? mergeLabels[variant];
  const reviewerInitials = initials(reviewer);
  const progress = cycling ? cursor : animated ? (hover ? -1 : 0) : checkCount;
  const allDone = progress >= checkCount;
  const anyRunning = progress >= 0 && progress < checkCount;
  const changedTotal = additions + deletions;
  const barUnits =
    changedTotal === 0
      ? BAR_UNITS
      : Math.min(
          deletions > 0 ? 4 : BAR_UNITS,
          Math.max(+(additions > 0), Math.round((additions / changedTotal) * BAR_UNITS)),
        );
  useEffect(() => {
    if (!cycling) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const startCycle = () => {
      timers.length = 0;
      setCursor(0);
      for (let i = 1; i <= checkCount; i++) schedule(() => setCursor(i), i * CHECK_INTERVAL_MS);
      schedule(startCycle, checkCount * CHECK_INTERVAL_MS + CYCLE_TOTAL * 1000);
    };
    schedule(() => setCursor(0), 0);
    schedule(startCycle, hover ? 0 : CYCLE_FIRST_DELAY * 1000);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [cycling, hover, checkCount]);
  const statusFor = (index: number): CheckStatus =>
    index < progress
      ? failing && index === checkCount - 1
        ? "failed"
        : "passed"
      : index === progress
        ? "running"
        : "pending";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={
        animated && hover
          ? () => {
              setCursor(0);
              setHovering(true);
            }
          : undefined
      }
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className={cn(
          "relative w-full", !fill && "max-w-96", "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
        )}
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
            className="flex flex-col gap-1.5 border-b px-3 py-2.5"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2">
              <GitPullRequest className="size-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">
                {title}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                {number}
              </span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {status}
              </span>
            </div>
            <motion.div
              className="flex items-center gap-1.5"
              variants={animated ? riseAnim : undefined}
              custom={BRANCH_DELAY}
              {...state}
            >
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-foreground">
                {source}
              </span>
              <ArrowRight className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-foreground">
                {target}
              </span>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 border-b px-3 py-2"
            variants={animated ? riseAnim : undefined}
            custom={FILES_DELAY}
            {...state}
          >
            <span
              className="text-[10px] text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: `${files}<!-- --> <!-- -->${files === 1 ? "file" : "files"}`,
              }}
            />
            <span
              className="text-[10px] font-medium text-emerald-600 tabular-nums dark:text-emerald-400"
              dangerouslySetInnerHTML={{ __html: `+<!-- -->${additions}` }}
            />
            <span
              className="text-[10px] font-medium text-rose-600 tabular-nums dark:text-rose-400"
              dangerouslySetInnerHTML={{ __html: `-<!-- -->${deletions}` }}
            />
            <span className="ml-auto flex items-center gap-0.5">
              {Array.from({ length: BAR_UNITS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block size-1.5 rounded-xs",
                    i < barUnits ? "bg-emerald-500/70" : "bg-rose-500/70",
                  )}
                />
              ))}
            </span>
          </motion.div>
          <div className="flex flex-col gap-0.5 p-1.5">
            {rows.map((check, i) => (
              <CheckRow
                key={i}
                check={check}
                status={statusFor(i)}
                index={i}
                animated={animated}
                spinActive={spinning}
                motionProps={state}
              />
            ))}
          </div>
          <motion.div
            className="flex items-center gap-2 border-t px-3 py-2"
            variants={animated ? riseAnim : undefined}
            custom={FOOTER_DELAY}
            {...state}
          >
            <span className="relative flex size-6 shrink-0 items-center justify-center">
              {reviewerImage ? (
                <img
                  src={reviewerImage}
                  alt={reviewer}
                  className="size-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                  {reviewerInitials}
                </span>
              )}
              <motion.span
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 flex size-3 items-center justify-center rounded-full ring-2 ring-card",
                  failing ? "bg-destructive text-white" : "bg-emerald-500 text-white",
                )}
                initial={false}
                animate={{ opacity: +!!allDone, scale: allDone ? 1 : 0.5 }}
                transition={
                  allDone
                    ? { type: "spring", stiffness: 420, damping: 18 }
                    : { duration: OPACITY_DURATION, ease: "easeOut" }
                }
              >
                {failing ? (
                  <X className="size-2" strokeWidth={3.5} />
                ) : (
                  <Check className="size-2" strokeWidth={3.5} />
                )}
              </motion.span>
            </span>
            <span className="relative flex h-4 min-w-0 flex-1 items-center">
              <motion.span
                className="absolute inset-0 truncate text-[10px] leading-4 text-muted-foreground"
                initial={false}
                animate={{ opacity: +!allDone }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              >
                {anyRunning ? checksRunning : checksQueued}
              </motion.span>
              <motion.span
                className={cn(
                  "absolute inset-0 truncate text-[10px] leading-4 font-medium",
                  failing ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
                )}
                initial={false}
                animate={{ opacity: +!!allDone }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              >
                {failing ? "1 check failed" : `${reviewer} approved`}
              </motion.span>
            </span>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="relative flex h-6 shrink-0 items-center justify-center overflow-hidden rounded-lg px-2"
            >
              <motion.span
                className="absolute inset-0 rounded-lg bg-muted ring-1 ring-border ring-inset"
                initial={false}
                animate={{ opacity: allDone && !failing ? 0 : 1 }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-lg bg-primary"
                initial={false}
                animate={{ opacity: allDone && !failing ? 1 : 0 }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              />
              <motion.span
                className={cn(
                  "relative text-[10px] font-semibold",
                  failing ? "text-destructive" : "text-muted-foreground",
                )}
                initial={false}
                animate={{ opacity: allDone && !failing ? 0 : 1 }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              >
                {buttonLabel}
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center px-2 text-[10px] font-semibold text-primary-foreground"
                initial={false}
                animate={{ opacity: allDone && !failing ? 1 : 0 }}
                transition={{ duration: OPACITY_DURATION, ease: "easeOut" }}
              >
                {buttonLabel}
              </motion.span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
