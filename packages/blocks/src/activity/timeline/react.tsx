import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type StepStatus = "done" | "active" | "pending";

export interface TimelineStep {
  title: string;
  detail: string;
  time: string;
  status: StepStatus;
}

const statusStyles: Record<StepStatus, { dot: string; ring: string; time: string }> = {
  done: {
    dot: "bg-muted text-muted-foreground border-border",
    ring: "ring-muted/40",
    time: "text-muted-foreground",
  },
  active: {
    dot: "bg-primary text-primary-foreground border-primary",
    ring: "ring-primary/15",
    time: "text-primary",
  },
  pending: {
    dot: "bg-card text-muted-foreground border-border",
    ring: "ring-transparent",
    time: "text-muted-foreground",
  },
};

export const timelineDefaultSteps: TimelineStep[] = [
  { title: "Design spec approved", detail: "Tokens, typography, motion", time: "2w", status: "done" },
  { title: "Frontend implementation", detail: "React + Motion components", time: "4d", status: "done" },
  { title: "QA & accessibility", detail: "ARIA audit, keyboard nav", time: "In progress", status: "active" },
  { title: "Staging deployment", detail: "Preview environment rollout", time: "Up next", status: "pending" },
  { title: "Production launch", detail: "Public release v3.0", time: "Fri", status: "pending" },
];

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

const listAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

const stepAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const dotAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 14 },
  },
} as const;

const lineAnim = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.35, ease: "easeOut" },
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

const pulseAnim = {
  hidden: { scale: 1, opacity: 0 },
  visible: {
    scale: [1, 1.8, 1] as [number, number, number],
    opacity: [0.6, 0, 0.6] as [number, number, number],
    transition: { duration: 1.8, ease: "easeOut", repeat: Infinity, repeatDelay: 0.2 },
  },
} as const;

export interface TimelineProps extends VisualProps {
  title?: string;
  meta?: string;
  steps?: readonly TimelineStep[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Timeline({
  title = "Release timeline",
  meta = "v3.0",
  steps = timelineDefaultSteps,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: TimelineProps) {
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
        className={cn(
          "relative w-full", !fill && "max-w-80", "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
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
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {meta && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {meta}
              </span>
            )}
          </div>
          <motion.div
            className="flex flex-col px-3 py-3"
            variants={animated ? listAnim : undefined}
            {...state}
          >
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              const s = statusStyles[step.status];
              return (
                <motion.div
                  key={i}
                  className="flex items-stretch gap-3"
                  variants={animated ? stepAnim : undefined}
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={cn(
                        "relative flex size-5 shrink-0 items-center justify-center rounded-full border ring-4",
                        s.dot,
                        s.ring,
                      )}
                      variants={animated ? dotAnim : undefined}
                    >
                      {step.status === "done" && <Check className="size-3" strokeWidth={3} />}
                      {step.status === "active" && (
                        <>
                          <div className="size-1.5 rounded-full bg-primary-foreground" />
                          {animated && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary"
                              variants={pulseAnim}
                            />
                          )}
                        </>
                      )}
                    </motion.div>
                    {!isLast && (
                      <motion.div
                        className="w-px flex-1 origin-top bg-border"
                        variants={animated ? lineAnim : undefined}
                      />
                    )}
                  </div>
                  <div className={cn("flex-1", !isLast && "pb-3.5")}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-xs font-medium text-foreground">
                        {step.title}
                      </span>
                      <span className={cn("shrink-0 text-[10px] font-medium", s.time)}>
                        {step.time}
                      </span>
                    </div>
                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                      {step.detail}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
