import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, type Variants } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { Plus } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const emptyDefaultCopy = {
  slots: 4,
} as const;

const MIN_SLOTS = 2;
const MAX_SLOTS = 6;
const BASE_DELAY = 0.25;
const STAGGER = 0.08;
const LOOP = 3.4;
const RIPPLE_AT = 0.12;
const PRESS_IN = 0.88;
const PRESS_OUT = 1.04;
const SWEEP_A = 0.28;
const SWEEP_B = 0.6;
const SWEEP_C = 0.74;

const still = { duration: 0.3, ease: "easeOut" } as const;

const ripples = [
  { offset: 0, opacity: 0.5 },
  { offset: 0.07, opacity: 0.32 },
] as const;

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

const slot: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: BASE_DELAY + i * STAGGER },
  }),
};

const plus: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 15, delay },
  }),
};

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

/** Scale the fixed-size stage down to the frame's content box (client only). */
function useFitScale(
  frame: RefObject<HTMLElement | null>,
  stage: RefObject<HTMLElement | null>,
  layout?: unknown,
) {
  useEffect(() => {
    const box = frame.current;
    const el = stage.current;
    if (!box || !el || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const style = getComputedStyle(box);
      const width =
        box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height =
        box.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const ratio = Math.min(1, width / el.offsetWidth, height / el.offsetHeight);
      el.style.scale = ratio > 0 && ratio < 1 ? String(ratio) : "";
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.style.scale = "";
    };
  }, [frame, stage, layout]);
}

export interface EmptyAction {
  label: string;
  /** Renders a link; without it the action is a button. */
  href?: string;
  onClick?: () => void;
}

export interface EmptyProps extends VisualProps {
  slots?: number;
  hover?: boolean;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  /** Heading under the illustration. */
  title?: string;
  description?: string;
  /** Links or buttons under the text; the first one is the primary action. */
  actions?: EmptyAction[];
  /** Element of the heading (default `h2`). */
  titleAs?: "h1" | "h2" | "h3" | "p";
}

const actionClass =
  "inline-flex h-9 max-w-full items-center justify-center rounded-md px-4 text-sm font-medium shadow-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const actionVariants = [
  "bg-primary text-primary-foreground hover:bg-primary/90",
  "border border-border bg-background text-foreground hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
];

function StateCopy({
  title,
  description,
  actions,
  titleAs: Title = "h2",
}: Pick<EmptyProps, "title" | "description" | "actions" | "titleAs">) {
  return (
    <div className="relative flex max-w-md flex-col items-center gap-2 px-2 text-center">
      {title && (
        <Title className="text-lg font-semibold tracking-tight text-balance text-foreground">
          {title}
        </Title>
      )}
      {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      {actions && actions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {actions.map((action, i) => {
            const className = cn(actionClass, actionVariants[i === 0 ? 0 : 1]);
            const label = <span className="truncate">{action.label}</span>;
            return action.href ? (
              <a key={i} href={action.href} onClick={action.onClick} className={className}>
                {label}
              </a>
            ) : (
              <button key={i} type="button" onClick={action.onClick} className={className}>
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Empty({
  slots = emptyDefaultCopy.slots,
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  fadeOut = false,
  isometric = false,
  fill = false,
  className,
  title,
  description,
  actions,
  titleAs,
}: EmptyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const loop = useLoopActive(ref, animated);
  const [hovered, setHovered] = useState(false);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const count = Math.min(Math.max(slots, MIN_SLOTS), MAX_SLOTS);
  const plusDelay = BASE_DELAY + count * STAGGER;
  const active = (hover ? hovered : inView) && loop;
  const hasCopy = Boolean(title || description || actions?.length);
  useFitScale(ref, stageRef, hasCopy);
  const loopDelay = hover ? 0 : plusDelay;
  const state = animated ? { initial: "hidden", animate: inView ? "visible" : "hidden" } : {};

  const illustration = (
    <div
      ref={ref}
      aria-hidden="true"
      className={
        hasCopy
          ? "relative flex w-full shrink-0 items-center justify-center px-2"
          : cn(frameClasses(fill), className)
      }
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        ref={stageRef}
        className={cn(
          "w-80 shrink-0",
          fadeOut && "mask-b-from-60%",
          fill && !hasCopy && "self-center",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative rounded-3xl border border-border/50 bg-muted/75 p-1.5">
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
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: count }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "relative h-16",
                    i === count - 1 && count % 2 === 1 && "col-span-2",
                  )}
                  variants={animated ? slot : undefined}
                  custom={i}
                  {...state}
                >
                  <div className="absolute inset-0 flex flex-col justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/25 p-2">
                    <div className="flex items-center gap-2">
                      <div className="size-5 shrink-0 rounded-full border border-dashed border-muted-foreground/30" />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="h-1.5 rounded-full bg-muted-foreground/15" />
                        <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/15" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-8 rounded-full bg-muted-foreground/10" />
                      <div className="h-2.5 w-5 rounded-full bg-muted-foreground/10" />
                    </div>
                  </div>
                  {animated && i === 0 && (
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-center gap-2 rounded-xl border bg-card p-2 shadow-xs"
                      initial={{ opacity: 0 }}
                      animate={active ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
                      transition={
                        active
                          ? {
                              duration: LOOP,
                              times: [0, 0.24000000000000002, SWEEP_A, SWEEP_B, SWEEP_C],
                              ease: ["linear", "easeOut", "linear", "easeIn"],
                              repeat: Infinity,
                              delay: loopDelay,
                            }
                          : still
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-5 shrink-0 rounded-full bg-primary/10 ring-1 ring-primary/20 ring-inset" />
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="h-1.5 rounded-full bg-muted-foreground/35" />
                          <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/25" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-8 rounded-full bg-primary/15" />
                        <div className="h-2.5 w-5 rounded-full bg-muted-foreground/20" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="relative mt-3 flex items-center justify-center">
              {animated &&
                ripples.map((r, ri) => (
                  <motion.div
                    key={ri}
                    className="absolute size-8 rounded-full border border-primary"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={
                      active ? { scale: [1, 1, 1.9], opacity: [0, r.opacity, 0] } : { opacity: 0 }
                    }
                    transition={
                      active
                        ? {
                            duration: LOOP,
                            times: [0, RIPPLE_AT + r.offset, RIPPLE_AT + r.offset + 0.22],
                            ease: ["linear", "easeOut"],
                            repeat: Infinity,
                            delay: loopDelay,
                          }
                        : still
                    }
                  />
                ))}
              <motion.div
                className="relative"
                variants={animated ? plus : undefined}
                custom={plusDelay}
                {...state}
              >
                <motion.div
                  className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs"
                  animate={
                    animated && active ? { scale: [1, 1, PRESS_IN, PRESS_OUT, 1] } : { scale: 1 }
                  }
                  transition={
                    animated && active
                      ? {
                          duration: LOOP,
                          times: [0, 0.09, RIPPLE_AT, 0.18, 0.24],
                          ease: ["linear", "easeOut", "easeOut", "easeInOut"],
                          repeat: Infinity,
                          delay: loopDelay,
                        }
                      : still
                  }
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!hasCopy) return illustration;
  return (
    <div
      className={cn(
        "relative isolate flex size-full flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10",
        className,
      )}
    >
      {illustration}
      <StateCopy title={title} description={description} actions={actions} titleAs={titleAs} />
    </div>
  );
}
