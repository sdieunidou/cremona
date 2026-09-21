import { useRef, useState } from "react";
import { motion, type Easing, type Transition, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Settings } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const maintenanceDefaultCopy = {
  tiles: 3,
} as const;

const MIN_TILES = 2;
const MAX_TILES = 4;
const LIFTED = 1;
const STAGE = { w: 340, h: 220 };
const GLOW_DELAY = 0.2;
const GLOW_DURATION = 1.2;
const TILE_BASE = 0.2;
const TILE_STAGGER = 0.09;
const LIFT_DELAY = 0.62;
const PROGRESS_DELAY = 0.8;
const HOVER_DELAY = 1.2;
const LOOP = 2.6;
const SPIN = 7;
const FLOAT = 3.2;
const TRAVEL = 36;
const SWEEP_TIMES = [0, 0.25, 0.29, 1];
const SWEEP_EASE: Easing[] = ["linear", "easeOut", "easeIn"];
const BAR_TIMES = [0, 0.25, 0.5, 0.75, 1];
const SCALE_TIMES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
const SCALE_KEYS = [1, 1.25, 0.8, 1.25, 1, 1.25, 0.8, 1.25, 1];

const bars = [
  { title: "w-24", meta: "w-14" },
  { title: "w-20", meta: "w-16" },
  { title: "w-22", meta: "w-12" },
  { title: "w-16", meta: "w-14" },
] as const;

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

const tileAnim: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: TILE_BASE + i * TILE_STAGGER },
  }),
};

const lift = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 18, delay: LIFT_DELAY },
  },
} as const;

const progress = {
  hidden: { opacity: 0, scaleX: 0.4 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.45, delay: 0.8, ease: "easeOut" } },
} as const;

export interface MaintenanceProps extends VisualProps {
  tiles?: number;
  hover?: boolean;
  glow?: boolean;
  isometric?: boolean;
}

export function Maintenance({
  tiles = maintenanceDefaultCopy.tiles,
  animated = false,
  trigger = "inView",
  hover = false,
  glow: glowOn = true,
  isometric = false,
  className,
}: MaintenanceProps) {
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
  const count = Math.min(Math.max(tiles, MIN_TILES), MAX_TILES);
  const sweep: Transition = animated && active
    ? { duration: 2.6, times: SWEEP_TIMES, ease: SWEEP_EASE, repeat: Infinity, delay: loopDelay }
    : still;

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
            className="absolute top-[30%] left-[62%] size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_65%)] opacity-15 blur-3xl dark:opacity-20"
            animate={animated && active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={
              animated && active
                ? { duration: 5, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.6, ease: "easeOut" }
            }
          />
        </motion.div>
      )}
      <motion.div
        className="relative flex shrink-0 items-center justify-center"
        style={
          !animated && isometric
            ? { width: STAGE.w, height: STAGE.h, transform: "rotateX(45deg) rotateZ(-45deg)" }
            : { width: STAGE.w, height: STAGE.h }
        }
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative w-56">
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: count }).map((_, n) =>
              n === LIFTED ? (
                <motion.div
                  key={n}
                  className="relative flex h-11 items-center gap-2.5 rounded-xl border border-transparent bg-muted/25 px-3"
                  variants={animated ? tileAnim : undefined}
                  custom={n}
                  {...state}
                >
                  <motion.div
                    className="absolute -inset-px rounded-xl border border-dashed border-muted-foreground/35"
                    initial={{ opacity: 1 }}
                    animate={animated && active ? { opacity: [1, 1, 0, 1] } : { opacity: 1 }}
                    transition={sweep}
                  />
                  <div className="size-6 shrink-0 rounded-lg border border-dashed border-muted-foreground/30" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className={cn("h-1.5 rounded-full bg-muted-foreground/10", bars[n]!.title)} />
                    <div className={cn("h-1.5 rounded-full bg-muted-foreground/10", bars[n]!.meta)} />
                  </div>
                  <div className="h-2.5 w-6 shrink-0 rounded-full border border-dashed border-muted-foreground/25" />
                  {animated && (
                    <motion.div
                      className="absolute -inset-px rounded-xl border border-primary"
                      initial={{ opacity: 0 }}
                      animate={active ? { opacity: [0, 0, 0.9, 0] } : { opacity: 0 }}
                      transition={sweep}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={n}
                  className="flex h-11 items-center gap-2.5 rounded-xl border bg-card px-3 shadow-xs"
                  variants={animated ? tileAnim : undefined}
                  custom={n}
                  {...state}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60 ring-inset">
                    <div className="size-2.5 rounded-[3px] bg-muted-foreground/25" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className={cn("h-1.5 rounded-full bg-muted-foreground/20", bars[n]!.title)} />
                    <div className={cn("h-1.5 rounded-full bg-muted-foreground/15", bars[n]!.meta)} />
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary/45" />
                    <div className="h-2.5 w-6 rounded-full bg-muted-foreground/10" />
                  </div>
                </motion.div>
              ),
            )}
          </div>
          <div className="mt-4 flex transform-gpu justify-center">
            <motion.div className="relative h-1 w-28" variants={animated ? progress : undefined} {...state}>
              <motion.div
                className="absolute inset-y-0 left-1/2 -ml-5 w-10 rounded-full bg-primary will-change-transform backface-hidden"
                initial={{ x: 0, scaleX: 1 }}
                animate={
                  animated && active
                    ? { x: [0, TRAVEL, 0, -TRAVEL, 0], scaleX: SCALE_KEYS }
                    : { x: 0, scaleX: 1 }
                }
                transition={
                  animated && active
                    ? {
                        x: { duration: 2.6, times: BAR_TIMES, ease: "easeInOut", repeat: Infinity, delay: loopDelay },
                        scaleX: { duration: 2.6, times: SCALE_TIMES, ease: "easeInOut", repeat: Infinity, delay: loopDelay },
                      }
                    : still
                }
              />
            </motion.div>
          </div>
          <motion.div
            className="absolute -top-5 -right-10 w-44 origin-bottom-left"
            style={{ rotate: -6 }}
            variants={animated ? lift : undefined}
            {...state}
          >
            <motion.div
              className="flex h-11 items-center gap-2.5 rounded-xl border bg-card px-3 shadow-lg ring-2 ring-background"
              animate={animated && active ? { y: [0, -5, 0] } : { y: 0 }}
              transition={
                animated && active
                  ? { duration: 3.2, ease: "easeInOut", repeat: Infinity }
                  : { duration: 0.4, ease: "easeOut" }
              }
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 ring-inset">
                {animated ? (
                  <motion.span
                    className="flex"
                    animate={active ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      active
                        ? { duration: 7, ease: "linear", repeat: Infinity }
                        : { duration: 0.4, ease: "easeOut" }
                    }
                  >
                    <Settings className="size-3.5" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <Settings className="size-3.5" strokeWidth={2.5} />
                )}
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-1.5 w-14 rounded-full bg-muted-foreground/30" />
                <div className="h-1.5 w-10 rounded-full bg-muted-foreground/15" />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                <div className="h-2.5 w-4 rounded-full bg-primary/15" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
