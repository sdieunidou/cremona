import { useRef, useState } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { FileQuestionMark, MousePointerClick } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const notFoundDefaultCopy = {
  code: "404",
  pulse: "dot",
} as const;

const CODE_DIGITS = 3;
const STAGE = { w: 416, h: 200 };
const GLOW_DELAY = 0.2;
const GLOW_DURATION = 1.2;
const NODE_DELAY = 0.2;
const LEFT_LINE_DELAY = 0.35;
const BARRIER_DELAY = 0.5;
const CODE_DELAY = 0.7;
const RIGHT_LINE_DELAY = 0.85;
const HOVER_DELAY = 1;
const LOOP = 3;
const FLASH_AT = 0.52;
const BARRIER_OPACITY = 0.25;
const BARRIER_KEY = 0.78;
const BARRIER_END = 0.95;
const BARRIER_FLASH_END = 0.8600000000000001;
const CODE_W = 128;
const LINE_W = 84;
const SVG_H = 12;
const HALF = SVG_H / 2;
const ROUTE = `M 0,${HALF} L ${LINE_W},${HALF}`;
const DASHES = "3 3";
const DASH_LEN = 24;
const PULSE_HEAD = FLASH_AT * 0.12;
const PULSE_TAIL = 0.03;
const DOT_TIME = FLASH_AT;
const LINE_TIME = (FLASH_AT * 124) / 100;
const RING_MAX = 128;
const OPACITY_ON = [0, 1, 1, 0];

const still: Transition = { duration: 0.3, ease: "easeOut" };

const staticRings = [
  { radius: 56, scale: 0.5, opacity: 1 },
  { radius: 62, scale: 0.82, opacity: 0.55 },
] as const;

const pulseRings = [
  { offset: 0, radius: 56, opacity: 0.9 },
  { offset: 0.06, radius: 64, opacity: 0.7 },
  { offset: 0.12, radius: 48, opacity: 0.55 },
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

const rightLine: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

const leftLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, delay, ease: "easeOut" },
  }),
};

const barrier = {
  hidden: { opacity: 0, scaleY: 0.3 },
  visible: { opacity: 1, scaleY: 1, transition: { duration: 0.45, delay: 0.5, ease: "easeOut" } },
} as const;

const codeAnim = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 17, delay: 0.7 },
  },
} as const;

function normalizeCode(code: string): string {
  return code.replace(/\D/g, "").slice(0, CODE_DIGITS) || notFoundDefaultCopy.code;
}

function Pulse({ pulse, active, delay }: { pulse: string; active: boolean; delay: number }) {
  const at = pulse === "line" ? LINE_TIME : DOT_TIME;
  const move: Transition = {
    duration: 3,
    times: [0, at],
    ease: "linear",
    repeat: Infinity,
    delay,
  };
  const blink: Transition = {
    duration: 3,
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
        strokeDasharray={`${DASH_LEN} 200`}
        initial={{ strokeDashoffset: DASH_LEN, opacity: 0 }}
        animate={active ? { strokeDashoffset: [DASH_LEN, -100], opacity: OPACITY_ON } : { opacity: 0 }}
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
        animate={active ? { cx: [0, LINE_W], opacity: OPACITY_ON } : { opacity: 0 }}
        transition={active ? { cx: move, opacity: blink } : still}
      />
      <motion.circle
        r={2.4}
        cy={HALF}
        fill="currentColor"
        className="text-primary"
        initial={{ cx: 0, opacity: 0 }}
        animate={active ? { cx: [0, LINE_W], opacity: OPACITY_ON } : { opacity: 0 }}
        transition={active ? { cx: move, opacity: blink } : still}
      />
    </>
  );
}

export interface NotFoundProps extends VisualProps {
  code?: string;
  pulse?: "dot" | "line";
  hover?: boolean;
  glow?: boolean;
  isometric?: boolean;
}

export function NotFound({
  code = notFoundDefaultCopy.code,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  glow: glowOn = true,
  isometric = false,
  className,
}: NotFoundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = hover ? hovered : inView;
  const loopDelay = hover ? 0 : 1;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : {};
  const codeText = normalizeCode(code);

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
            className="absolute top-1/2 left-[42%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-destructive),transparent_65%)] opacity-15 blur-3xl dark:opacity-20"
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
        <div className="relative flex-1" style={{ minWidth: LINE_W }}>
          <svg className="block h-3 w-full overflow-visible" viewBox={`0 0 ${LINE_W} ${SVG_H}`} fill="none">
            <motion.path
              d={ROUTE}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? leftLine : undefined}
              custom={LEFT_LINE_DELAY}
              {...state}
            />
            {animated && <Pulse pulse={pulse} active={active} delay={loopDelay} />}
          </svg>
          <div
            className="absolute top-1/2 right-0 w-px -translate-y-1/2"
            style={{ height: RING_MAX }}
          >
            <motion.div className="size-full" variants={animated ? barrier : undefined} {...state}>
              <motion.div
                className="size-full bg-linear-to-b from-transparent via-destructive/70 to-transparent"
                style={{ opacity: animated ? BARRIER_OPACITY : 1 }}
                initial={animated ? { opacity: BARRIER_OPACITY } : undefined}
                animate={
                  animated
                    ? active
                      ? { opacity: [BARRIER_OPACITY, BARRIER_OPACITY, 1, 1, BARRIER_OPACITY] }
                      : { opacity: BARRIER_OPACITY }
                    : undefined
                }
                transition={
                  animated
                    ? active
                      ? {
                          duration: 3,
                          times: [0, 0.505, 0.54, BARRIER_KEY, BARRIER_END],
                          ease: ["linear", "easeOut", "linear", "easeInOut"],
                          repeat: Infinity,
                          delay: loopDelay,
                        }
                      : still
                    : undefined
                }
              />
            </motion.div>
          </div>
          {!animated &&
            staticRings.map((r, ri) => (
              <div
                key={ri}
                className="absolute top-1/2 right-0 z-10 -translate-y-1/2"
                style={{ width: r.radius, height: r.radius * 2 }}
              >
                <div
                  className="size-full origin-right rounded-l-full border border-r-0 border-destructive"
                  style={{ transform: `scale(${r.scale})`, opacity: r.opacity }}
                />
              </div>
            ))}
          {animated &&
            pulseRings.map((r, ri) => (
              <div
                key={ri}
                className="absolute top-1/2 right-0 -translate-y-1/2"
                style={{ width: r.radius, height: r.radius * 2 }}
              >
                <motion.div
                  className="size-full origin-right rounded-l-full border border-r-0 border-destructive"
                  initial={{ scale: 0.12, opacity: 0 }}
                  animate={
                    active
                      ? { scale: [0.12, 0.12, 0.25, 1], opacity: [0, 0, r.opacity, 0] }
                      : { opacity: 0 }
                  }
                  transition={
                    active
                      ? {
                          duration: 3,
                          times: [0, 0.52 + r.offset, 0.52 + r.offset + 0.03, 0.52 + r.offset + 0.3],
                          ease: ["linear", "easeOut", "easeOut"],
                          repeat: Infinity,
                          delay: loopDelay,
                        }
                      : still
                  }
                />
              </div>
            ))}
        </div>
        <motion.span
          className="shrink-0 text-center text-6xl leading-none font-bold tracking-tight text-foreground tabular-nums"
          style={{ width: CODE_W }}
          variants={animated ? codeAnim : undefined}
          {...state}
        >
          {codeText}
        </motion.span>
        <motion.svg
          className="block h-3 flex-1 origin-left mask-l-from-40%"
          style={{ minWidth: LINE_W }}
          viewBox={`0 0 ${LINE_W} ${SVG_H}`}
          fill="none"
          variants={animated ? rightLine : undefined}
          custom={0.85}
          {...state}
        >
          <path
            d={ROUTE}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray={DASHES}
            className="text-muted-foreground/60"
          />
        </motion.svg>
        <motion.div
          className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-muted/40 text-muted-foreground/70"
          variants={animated ? node : undefined}
          custom={1}
          {...state}
        >
          <FileQuestionMark className="size-5" strokeWidth={2} />
          {animated && (
            <motion.div
              className="absolute -inset-px rounded-xl border border-dashed border-destructive/60"
              initial={{ opacity: 0 }}
              animate={active ? { opacity: [0, 0, 0.9, 0] } : { opacity: 0 }}
              transition={
                active
                  ? {
                      duration: 3,
                      times: [0, 0.55, 0.62, BARRIER_FLASH_END],
                      ease: "easeOut",
                      repeat: Infinity,
                      delay: loopDelay,
                    }
                  : still
              }
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
