import { useRef, useState } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { MousePointerClick, TriangleAlert } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const errorDefaultCopy = {
  services: 4,
  pulse: "dot",
} as const;

const MIN_SERVICES = 2;
const MAX_SERVICES = 5;
const STAGE = { w: 344, h: 176 };
const GLOW_DELAY = 0.2;
const GLOW_DURATION = 1.2;
const NODE_DELAY = 0.2;
const LINE_DELAY = 0.35;
const CARD_DELAY = 0.55;
const TILE_AT = 0.7;
const TILE_STAGGER = 0.06;
const HOVER_DELAY = 0.55;
const LOOP = 3.2;
const BREAK_AT = 0.4;
const TILE_STEP = 0.035;
const FADE_A = 0.72;
const FADE_B = 0.86;
const LINE_W = 144;
const SVG_H = 12;
const HALF = SVG_H / 2;
const ROUTE = `M 0,${HALF} L ${LINE_W},${HALF}`;
const DASH_GAP = 24;
const DOT_TIME = (BREAK_AT * 152) / LINE_W;
const LINE_TIME = (BREAK_AT * 124) / 100;
const OPACITY_ON = [0, 1, 1, 0];
const PULSE_HEAD = BREAK_AT * 0.12;
const PULSE_TAIL = 0.01;

const still: Transition = { duration: 0.3, ease: "easeOut" };

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

const glow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" },
  },
} as const;

const node: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay },
  }),
};

const route = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, delay: LINE_DELAY, ease: "easeOut" },
  },
} as const;

const tile: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: TILE_AT + i * TILE_STAGGER },
  }),
};

function Pulse({ pulse, active, delay }: { pulse: string; active: boolean; delay: number }) {
  const at = pulse === "line" ? LINE_TIME : DOT_TIME;
  const move: Transition = {
    duration: LOOP,
    times: [0, at],
    ease: "linear",
    repeat: Infinity,
    delay,
  };
  const blink: Transition = {
    duration: LOOP,
    times: [0, PULSE_HEAD, at, at + PULSE_TAIL],
    ease: "linear",
    repeat: Infinity,
    delay,
  };
  if (pulse === "line") {
    return (
      <motion.path
        d={ROUTE}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray={`${DASH_GAP} 200`}
        initial={{ strokeDashoffset: DASH_GAP, opacity: 0 }}
        animate={active ? { strokeDashoffset: [DASH_GAP, -100], opacity: OPACITY_ON } : { opacity: 0 }}
        transition={active ? { strokeDashoffset: move, opacity: blink } : still}
      />
    );
  }
  return (
    <>
      <motion.circle
        r={5}
        cy={HALF}
        fill="currentColor"
        className="text-primary/15"
        initial={{ cx: 0, opacity: 0 }}
        animate={active ? { cx: [0, 152], opacity: OPACITY_ON } : { opacity: 0 }}
        transition={active ? { cx: move, opacity: blink } : still}
      />
      <motion.circle
        r={2.4}
        cy={HALF}
        fill="currentColor"
        className="text-primary"
        initial={{ cx: 0, opacity: 0 }}
        animate={active ? { cx: [0, 152], opacity: OPACITY_ON } : { opacity: 0 }}
        transition={active ? { cx: move, opacity: blink } : still}
      />
    </>
  );
}

export interface ErrorProps extends VisualProps {
  services?: number;
  pulse?: "dot" | "line";
  hover?: boolean;
  glow?: boolean;
  isometric?: boolean;
}

export function Error({
  services = errorDefaultCopy.services,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  glow: glowOn = true,
  isometric = false,
  className,
}: ErrorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = hover ? hovered : inView;
  const loopDelay = hover ? 0 : HOVER_DELAY;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : {};
  const count = Math.min(Math.max(services, MIN_SERVICES), MAX_SERVICES);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      {glowOn && (
        <motion.div className="absolute inset-0 -z-10" variants={animated ? glow : undefined} {...state}>
          <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
          <motion.div
            className="absolute top-1/2 left-[68%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-destructive),transparent_65%)] opacity-15 blur-3xl dark:opacity-20"
            animate={animated && active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={
              animated && active
                ? { duration: 4, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.6, ease: "easeOut" }
            }
          />
        </motion.div>
      )}
      <motion.div
        className="relative flex shrink-0 items-center px-3"
        style={
          !animated && isometric
            ? { width: STAGE.w, height: STAGE.h, transform: "rotateX(45deg) rotateZ(-45deg)" }
            : { width: STAGE.w, height: STAGE.h }
        }
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <motion.div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-2 ring-background"
          variants={animated ? node : undefined}
          custom={NODE_DELAY}
          {...state}
        >
          <MousePointerClick className="size-5" strokeWidth={2} />
        </motion.div>
        <svg
          className="block h-3 flex-1"
          style={{ minWidth: LINE_W }}
          viewBox={`0 0 ${LINE_W} ${SVG_H}`}
          fill="none"
        >
          <motion.path
            d={ROUTE}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeLinecap="round"
            className="text-muted-foreground/50"
            variants={animated ? route : undefined}
            {...state}
          />
          {animated && <Pulse pulse={pulse} active={active} delay={loopDelay} />}
        </svg>
        <motion.div
          className="relative shrink-0"
          variants={animated ? node : undefined}
          custom={CARD_DELAY}
          {...state}
        >
          <div className="relative w-32 rounded-xl border bg-card p-2 shadow-xs ring-2 ring-background">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: count }).map((_, t) => (
                <motion.div
                  key={t}
                  className="relative"
                  variants={animated ? tile : undefined}
                  custom={t}
                  {...state}
                >
                  <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-1.5 py-1">
                    <div className="size-4 shrink-0 rounded-sm bg-muted-foreground/15" />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="h-1 rounded-full bg-muted-foreground/30" />
                      <div className="h-1 w-2/3 rounded-full bg-muted-foreground/15" />
                    </div>
                    <div className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  </div>
                  {!animated && (
                    <div className="absolute inset-0 flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-1.5">
                      <div className="size-4 shrink-0 rounded-sm bg-destructive/25" />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="h-1 rounded-full bg-destructive/70" />
                        <div className="h-1 w-2/3 rounded-full bg-destructive/45" />
                      </div>
                      <div className="size-1.5 shrink-0 rounded-full bg-destructive" />
                    </div>
                  )}
                  {animated && (
                    <motion.div
                      className="absolute inset-0 flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-1.5"
                      initial={{ opacity: 0 }}
                      animate={active ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
                      transition={
                        active
                          ? {
                              duration: LOOP,
                              times: [0, BREAK_AT + t * TILE_STEP, BREAK_AT + t * TILE_STEP + 0.03, FADE_A, FADE_B],
                              ease: ["linear", "easeOut", "linear", "easeIn"],
                              repeat: Infinity,
                              delay: loopDelay,
                            }
                          : still
                      }
                    >
                      <div className="size-4 shrink-0 rounded-sm bg-destructive/25" />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="h-1 rounded-full bg-destructive/70" />
                        <div className="h-1 w-2/3 rounded-full bg-destructive/45" />
                      </div>
                      <div className="size-1.5 shrink-0 rounded-full bg-destructive" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            {!animated && <div className="absolute -inset-px rounded-xl border border-destructive/70" />}
            {animated && (
              <motion.div
                className="absolute -inset-px rounded-xl border border-destructive/70"
                initial={{ opacity: 0 }}
                animate={active ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
                transition={
                  active
                    ? {
                        duration: LOOP,
                        times: [0, BREAK_AT, 0.43000000000000005, FADE_A, FADE_B],
                        ease: ["linear", "easeOut", "linear", "easeIn"],
                        repeat: Infinity,
                        delay: loopDelay,
                      }
                    : still
                }
              />
            )}
          </div>
          {!animated && (
            <div className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-xs ring-2 ring-background">
              <TriangleAlert className="size-3.5" strokeWidth={2.5} />
            </div>
          )}
          {animated && (
            <motion.div
              className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-xs ring-2 ring-background"
              initial={{ scale: 0, opacity: 0 }}
              animate={
                active
                  ? { scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }
                  : { scale: 0, opacity: 0 }
              }
              transition={
                active
                  ? {
                      duration: LOOP,
                      times: [0, BREAK_AT, 0.45, FADE_A, FADE_B],
                      ease: ["linear", "easeOut", "linear", "easeIn"],
                      repeat: Infinity,
                      delay: loopDelay,
                    }
                  : still
              }
            >
              <TriangleAlert className="size-3.5" strokeWidth={2.5} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
