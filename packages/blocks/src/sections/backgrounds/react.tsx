import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const backgroundsDefaultCopy = {
  title: "Designed to stand out",
} as const;

type BackgroundKind = "mesh" | "grid" | "dots" | "rays";

const defaultBackgrounds: BackgroundKind[] = ["mesh", "grid", "dots", "rays"];

const defaultInterval = 2600;
const minInterval = 900;
const timing = { crossfade: 0.7, loopStart: 1400, hoverStart: 200 };

function Backdrop({ variant, compact = false }: { variant: BackgroundKind; compact?: boolean }) {
  if (variant === "grid") {
    return (
      <div
        className={
          compact
            ? "absolute inset-0 bg-[linear-gradient(to_right,var(--color-muted-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted-foreground)_1px,transparent_1px)] bg-size-[4px_4px] opacity-40"
            : "absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_70%_70%_at_50%_40%,#000_30%,transparent_100%)] bg-size-[14px_14px] opacity-55"
        }
      />
    );
  }
  if (variant === "dots") {
    return (
      <div
        className={
          compact
            ? "absolute inset-0 bg-[radial-gradient(var(--color-muted-foreground)_1px,transparent_1px)] bg-size-[4px_4px] opacity-40"
            : "absolute inset-0 bg-[radial-gradient(var(--color-border)_1.25px,transparent_1.25px)] mask-[radial-gradient(ellipse_70%_70%_at_50%_40%,#000_30%,transparent_100%)] bg-size-[12px_12px] opacity-55"
        }
      />
    );
  }
  if (variant === "rays") {
    if (compact) {
      return (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,var(--color-primary),transparent_70%)] opacity-70" />
      );
    }
    return (
      <>
        <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-primary/8 to-transparent" />
        <div className="absolute -inset-4 bg-[conic-gradient(from_180deg_at_50%_-10%,transparent_0deg,transparent_14deg,var(--color-primary)_22deg,transparent_30deg,transparent_46deg,var(--color-primary)_54deg,transparent_62deg,transparent_298deg,var(--color-primary)_306deg,transparent_314deg,transparent_330deg,var(--color-primary)_338deg,transparent_346deg,transparent_360deg)] mask-b-from-10% opacity-10 blur-[5px]" />
      </>
    );
  }
  if (compact) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,var(--color-chart-1),transparent_60%),radial-gradient(circle_at_80%_30%,var(--color-chart-2),transparent_60%),radial-gradient(circle_at_50%_90%,var(--color-chart-3),transparent_60%)] opacity-80" />
    );
  }
  return (
    <>
      <div className="absolute -top-8 -left-8 size-28 rounded-full bg-chart-1/22 blur-3xl" />
      <div className="absolute -top-6 -right-6 size-24 rounded-full bg-chart-2/22 blur-3xl" />
      <div className="absolute -bottom-10 left-1/4 size-28 rounded-full bg-chart-3/18 blur-3xl" />
    </>
  );
}

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

const gridAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, delay: 0.2, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const picker = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 22, delay: 0.55 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface BackgroundsProps extends VisualProps {
  title?: string;
  backgrounds?: BackgroundKind[];
  interval?: number;
  showPicker?: boolean;
  hover?: boolean;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

export function Backgrounds({
  title = backgroundsDefaultCopy.title,
  backgrounds = defaultBackgrounds,
  interval = defaultInterval,
  showPicker = true,
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  fadeOut = false,
  isometric = false,
  className,
}: BackgroundsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const hasCycledRef = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [index, setIndex] = useState(0);
  const active =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setIndex(0);
  }
  const state = animated ? { initial: "hidden", animate: active ? "visible" : "hidden" } : {};
  const playing = animated && active && (!hover || hovering);
  const period = Math.max(interval, minInterval);
  const count = backgrounds.length;
  const current = Math.min(index, Math.max(count - 1, 0));
  const withPicker = showPicker && count > 1;

  useEffect(() => {
    if (!playing) hasCycledRef.current = false;
  }, [playing]);

  useEffect(() => {
    if (!playing || count < 2) return;
    const delay = hasCycledRef.current
      ? period
      : hover
        ? timing.hoverStart
        : timing.loopStart;
    const t = setTimeout(() => {
      hasCycledRef.current = true;
      setIndex((i) => (i + 1) % count);
    }, delay);
    return () => clearTimeout(t);
  }, [playing, hover, period, count, index]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className={cn("w-full max-w-72 p-8.5", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative p-1.5">
          <motion.div variants={animated ? gridAnim : undefined} {...state}>
            <div className="absolute -inset-8.5 bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] bg-size-[24px_24px] dark:opacity-50" />
            <div className="absolute inset-0 border border-border/75" />
            <div className="absolute -top-6 left-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute -top-6 right-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute top-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute top-0 -right-6 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
            <div className="absolute -bottom-6 left-0 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute right-0 -bottom-6 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute bottom-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute -right-6 bottom-0 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
          </motion.div>
          {gradient && !fadeOut && (
            <>
              <motion.div
                className="absolute inset-x-2.5 bottom-1.5 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? glowAnim : undefined}
                {...state}
              />
              <motion.div
                className="absolute inset-x-1 bottom-1 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
                variants={animated ? veilAnim : undefined}
                {...state}
              />
            </>
          )}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border bg-card px-6 pt-10 shadow-xs",
              withPicker ? "pb-13" : "pb-10",
            )}
          >
            <motion.div
              className="absolute inset-1.5 overflow-hidden rounded-md"
              variants={animated ? backdrop : undefined}
              {...state}
            >
              {backgrounds.map((bg, i) => (
                <motion.div
                  key={`${bg}-${i}`}
                  className="absolute inset-0"
                  initial={animated ? { opacity: +(i === 0) } : undefined}
                  animate={animated ? { opacity: +(i === current) } : undefined}
                  style={animated ? undefined : { opacity: +(i === current) }}
                  transition={{ duration: timing.crossfade, ease: "easeOut" }}
                >
                  <Backdrop variant={bg} />
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="relative flex flex-col items-center"
              variants={animated ? content : undefined}
              {...state}
            >
              <motion.p
                className="text-center text-[10px] leading-[1.2] font-semibold text-foreground"
                variants={animated ? item : undefined}
              >
                {title}
              </motion.p>
              <motion.div
                className="mt-1.5 flex w-full flex-col items-center gap-1"
                variants={animated ? item : undefined}
              >
                <div className="h-0.75 w-3/4 rounded-full bg-muted-foreground/20" />
                <div className="h-0.75 w-1/2 rounded-full bg-muted-foreground/20" />
              </motion.div>
              <motion.div className="mt-2.5 flex gap-1" variants={animated ? item : undefined}>
                <div className="flex h-3 min-w-8 items-center rounded-md bg-primary px-1.5">
                  <div className="h-0.5 w-full rounded-full bg-primary-foreground/75" />
                </div>
                <div className="flex h-3 min-w-7 items-center rounded-md border bg-card/70 px-1.5">
                  <div className="h-0.5 w-full rounded-full bg-border" />
                </div>
              </motion.div>
            </motion.div>
            {withPicker && (
              <motion.div
                className="absolute inset-x-0 bottom-2 flex justify-center"
                variants={animated ? picker : undefined}
                {...state}
              >
                <div className="flex items-center gap-1 rounded-full border bg-card/85 p-1 shadow-xs backdrop-blur-sm">
                  {backgrounds.map((bg, i) => (
                    <button
                      key={`${bg}-${i}`}
                      type="button"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        hasCycledRef.current = true;
                        setIndex(i);
                      }}
                      className={cn(
                        "relative size-4 overflow-hidden rounded-[5px] border bg-card",
                        i === current && "ring-1 ring-primary/45 ring-offset-1 ring-offset-card",
                      )}
                    >
                      <Backdrop variant={bg} compact />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
