import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, LoaderCircle } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const agentFlowDefaultCopy = {
  steps: ["Planning", "Retrieving", "Respond"],
} as const;

const CUBE_TOP = "30,0 60,12 30,24 0,12";
const CUBE_LEFT = "0,12 30,24 30,34 0,22";
const CUBE_RIGHT = "60,12 30,24 30,34 60,22";

const STEP_INITIAL_DELAY = 1.1;
const STEP_DELAY = 0.15;
const STEP_DELAY_UNIT = 0.18;
const STEP_INTERVAL = 2200;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

const PARTICLES: Particle[] = [
  { x: 14.2, y: 24.6, size: 3, color: "bg-primary", duration: 4.82, delay: -5.22, driftX: 4.87, driftY: 14.97, opacity: 0.6 },
  { x: 86.7, y: 32.1, size: 3, color: "bg-chart-1", duration: 6.16, delay: -2.68, driftX: -3.11, driftY: 12.52, opacity: 0.6 },
  { x: 24.1, y: 72.3, size: 2, color: "bg-chart-2", duration: 6.41, delay: -1.19, driftX: -2.04, driftY: 16.24, opacity: 0.48 },
  { x: 78.6, y: 66.2, size: 3, color: "bg-chart-3", duration: 4.09, delay: -3.47, driftX: 5.93, driftY: 13.39, opacity: 0.62 },
  { x: 8.8, y: 54.5, size: 2, color: "bg-chart-4", duration: 4.41, delay: -5.43, driftX: 6.64, driftY: 15.95, opacity: 0.52 },
  { x: 91.2, y: 54.4, size: 3, color: "bg-primary", duration: 4.22, delay: -1.23, driftX: -3.05, driftY: 14.75, opacity: 0.45 },
  { x: 18.3, y: 16.2, size: 2, color: "bg-chart-1", duration: 4.72, delay: -5.81, driftX: 4.22, driftY: 9.62, opacity: 0.5 },
  { x: 72.5, y: 20.7, size: 3, color: "bg-chart-4", duration: 7.66, delay: -5.45, driftX: 6.82, driftY: 13.1, opacity: 0.55 },
  { x: 32.6, y: 82.6, size: 3, color: "bg-primary", duration: 5.43, delay: -2.72, driftX: -2.28, driftY: 10, opacity: 0.6 },
  { x: 65.4, y: 80.3, size: 2, color: "bg-chart-3", duration: 4.75, delay: -1.01, driftX: 5.27, driftY: 8.7, opacity: 0.5 },
  { x: 6.9, y: 40.4, size: 3, color: "bg-primary", duration: 4.94, delay: -5.65, driftX: 4.64, driftY: 13.44, opacity: 0.46 },
  { x: 93.3, y: 42.8, size: 2, color: "bg-chart-2", duration: 4.69, delay: -2.39, driftX: -3.07, driftY: 15.9, opacity: 0.5 },
  { x: 46.5, y: 10.6, size: 3, color: "bg-chart-4", duration: 6.13, delay: -5.07, driftX: -2.6, driftY: 9.3, opacity: 0.5 },
  { x: 53.2, y: 90.1, size: 2, color: "bg-primary", duration: 6.39, delay: -5.57, driftX: 1.33, driftY: 9.13, opacity: 0.52 },
  { x: 38.8, y: 86.9, size: 3, color: "bg-chart-1", duration: 7.31, delay: -5.08, driftX: -4.42, driftY: 14.91, opacity: 0.5 },
  { x: 84.1, y: 86.4, size: 2, color: "bg-chart-4", duration: 5.23, delay: -2.49, driftX: 3.29, driftY: 7.84, opacity: 0.48 },
];

const column = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const cube: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: STEP_DELAY + i * STEP_DELAY_UNIT },
  }),
};

const connector: Variants = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.3, delay: STEP_DELAY + i * STEP_DELAY_UNIT + 0.1, ease: "easeOut" },
  }),
};

const glowVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" } },
} as const;

const particleField = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: PARTICLES_DELAY, ease: "easeOut" } },
} as const;

const reveal = {
  hidden: { opacity: 0, x: 6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut", staggerChildren: 0.04, delayChildren: 0.04 },
  },
  exit: { opacity: 0, x: -14, transition: { duration: 0.3, ease: "easeIn" } },
} as const;

const dash = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const iconSwap = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 16 } },
} as const;

const letters = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.06 } },
} as const;

const letter = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.25, ease: "easeOut" } },
} as const;

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-1/3 left-[38%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-2/3 left-[58%] size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

function Cube({ animated, lit }: { animated: boolean; lit: boolean }) {
  return (
    <svg viewBox="0 0 60 34" className="block w-full overflow-visible" style={{ aspectRatio: "60 / 34" }} fill="none">
      <polygon points={CUBE_LEFT} fill="var(--color-primary)" fillOpacity={0.7} />
      <polygon points={CUBE_RIGHT} fill="var(--color-primary)" fillOpacity={0.8} />
      <polygon points={CUBE_TOP} fill="var(--color-primary)" fillOpacity={0.95} />
      {animated ? (
        <motion.polygon
          points={CUBE_TOP}
          fill="var(--color-primary-foreground)"
          initial={{ opacity: 0 }}
          animate={{ opacity: lit ? 0.55 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ) : lit ? (
        <polygon points={CUBE_TOP} fill="var(--color-primary-foreground)" opacity={0.55} />
      ) : null}
    </svg>
  );
}

export interface AgentFlowProps extends VisualProps {
  steps?: readonly string[];
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
}

export function AgentFlow({
  steps,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  className,
}: AgentFlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [settled, setSettled] = useState(false);
  const stepRef = useRef(0);
  const stepsList = steps && steps.length > 0 ? steps : agentFlowDefaultCopy.steps;
  const count = stepsList.length;
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = (hover ? hovered : inView) && ticked;
  const drifting = inView && ticked;
  const state = { initial: "hidden", animate: inView ? "visible" : "hidden" } as const;

  useEffect(() => {
    if (!animated || !active) return;
    if (stepRef.current >= count) stepRef.current = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let settleId: ReturnType<typeof setTimeout> | undefined;
    const initialDelay = hover ? 0 : STEP_INITIAL_DELAY * 1000;
    const settle = () => {
      clearTimeout(settleId);
      setCurrent(stepRef.current);
      setSettled(false);
      settleId = setTimeout(() => setSettled(true), 1600);
    };
    const startId = setTimeout(() => {
      settle();
      intervalId = setInterval(() => {
        stepRef.current = (stepRef.current + 1) % count;
        settle();
      }, STEP_INTERVAL);
    }, initialDelay);
    return () => {
      clearTimeout(startId);
      clearTimeout(settleId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [animated, active, hover, count]);

  if (!animated) {
    return (
      <div
        aria-hidden="true"
        className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      >
        {glow && (
          <div className="absolute inset-0 -z-10">
            <GlowScene />
          </div>
        )}
        {particles && (
          <div className="absolute inset-0 -z-10">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className={`rotate-45 rounded-[1px] ${p.color}`}
                  style={{ width: p.size, height: p.size, opacity: p.opacity * 0.7 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="relative flex flex-col items-start">
          {stepsList.map((step, i) => (
            <Fragment key={i}>
              <div className="flex items-center">
                <div className="w-16 shrink-0">
                  <Cube animated={false} lit={i === 0} />
                </div>
                <div className="ml-2 h-6 w-36 shrink-0 overflow-hidden">
                  <div className="flex h-full items-center gap-2">
                    <span className="w-6 shrink-0 border-t border-dashed border-muted-foreground/40" />
                    {i === 0 && (
                      <span className="flex shrink-0">
                        <Check className="size-3.5 text-primary" strokeWidth={3} />
                      </span>
                    )}
                    <span className="text-sm font-medium whitespace-nowrap text-foreground">{step}</span>
                  </div>
                </div>
              </div>
              {i < count - 1 && (
                <div className="flex w-16 shrink-0 justify-center">
                  <div className="my-1 h-4 w-0.5 rounded-full bg-muted-foreground/40" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
    >
      {glow && (
        <motion.div className="absolute inset-0 -z-10" variants={glowVariant} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={active ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.85 }}
            transition={
              active ? { duration: 4.5, ease: "easeInOut", repeat: Infinity } : { duration: 0.6, ease: "easeOut" }
            }
          >
            <GlowScene />
          </motion.div>
        </motion.div>
      )}
      {particles && (
        <motion.div className="absolute inset-0 -z-10" variants={particleField} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: +!!active }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <motion.div
                  animate={
                    drifting
                      ? { x: [0, p.driftX, 0], y: [0, -p.driftY, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }
                      : { x: 0, y: 0, opacity: 0 }
                  }
                  transition={
                    drifting
                      ? { duration: p.duration, delay: p.delay, ease: "easeInOut", repeat: Infinity }
                      : { duration: 0.3 }
                  }
                >
                  <div className={`rotate-45 rounded-[1px] ${p.color}`} style={{ width: p.size, height: p.size }} />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
      <motion.div className="relative flex flex-col items-start" variants={column} {...state}>
        {stepsList.map((step, i) => {
          const isCurrent = active && current === i;
          const isSettled = isCurrent && settled;
          return (
            <Fragment key={i}>
              <div className="flex items-center">
                <motion.div className="w-16 shrink-0" variants={cube} custom={i} {...state}>
                  <Cube animated lit={isCurrent} />
                </motion.div>
                <div className="ml-2 h-6 w-36 shrink-0 overflow-hidden">
                  <AnimatePresence>
                    {isCurrent && (
                      <motion.div
                        key={i}
                        className="flex h-full items-center gap-2"
                        variants={reveal}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <motion.span
                          className="w-6 shrink-0 origin-left border-t border-dashed border-muted-foreground/40"
                          variants={dash}
                        />
                        <motion.span className="shrink-0" variants={iconSwap}>
                          <AnimatePresence mode="wait" initial={false}>
                            {isSettled ? (
                              <motion.span
                                key="check"
                                className="flex"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                              >
                                <Check className="size-3.5 text-primary" strokeWidth={3} />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="spin"
                                className="flex"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <LoaderCircle className="size-3.5 animate-spin text-primary" strokeWidth={2.5} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.span>
                        <motion.span
                          className="text-sm font-medium whitespace-nowrap text-foreground"
                          variants={letters}
                        >
                          {step.split("").map((ch, k) =>
                            ch === " " ? (
                              <span key={k}>&nbsp;</span>
                            ) : (
                              <motion.span key={k} className="inline-block" variants={letter}>
                                {ch}
                              </motion.span>
                            ),
                          )}
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {i < count - 1 && (
                <div className="flex w-16 shrink-0 justify-center">
                  <motion.div
                    className="my-1 h-4 w-0.5 origin-top rounded-full bg-muted-foreground/40"
                    variants={connector}
                    custom={i}
                    {...state}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </motion.div>
    </div>
  );
}
