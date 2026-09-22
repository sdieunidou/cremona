import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Headphones, Mic, Music, Pause, Play } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface AudioWaveformProps extends VisualProps {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  current?: string;
  duration?: string;
  progress?: number;
  state?: "play" | "pause";
  hint?: string;
  meta?: string;
  bars?: number;
  isometric?: boolean;
  gradient?: boolean;
}

const defaultTitle = "Midnight in Lisbon";
const defaultSubtitle = "Léo Marques · Single";
const defaultCurrent = "1:42";
const defaultDuration = "3:28";
const defaultProgress = 48;
const defaultMeta = "Hi-Fi · 320kbps";
const WAVEFORM = [
  0.42, 0.78, 0.55, 0.9, 0.36, 0.62, 0.84, 0.48, 0.7, 0.32, 0.86, 0.58, 0.74,
  0.45, 0.88, 0.6, 0.34, 0.72, 0.5, 0.92, 0.4, 0.66, 0.82, 0.46, 0.78, 0.3,
  0.64, 0.88, 0.52, 0.74, 0.38, 0.7, 0.56, 0.92, 0.44, 0.62, 0.8, 0.48, 0.72,
  0.34,
];

function waveformBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i++) bars.push(WAVEFORM[i % WAVEFORM.length]!);
  return bars;
}

const card = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const headerAnim = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, delay: 0.15, ease: "easeOut" },
  },
} as const;

const buttonAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.45 },
  },
} as const;

const barsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.012, delayChildren: 0.3 } },
} as const;

const barAnim = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const playheadAnim = (progress: number): Variants => ({
  hidden: { left: "0%", opacity: 0 },
  visible: {
    left: `${progress}%`,
    opacity: 1,
    transition: { duration: 0.7, delay: 0.6, ease: "easeOut" },
  },
});

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

export function AudioWaveform({
  icon = <Music className="size-4" />,
  title = defaultTitle,
  subtitle = defaultSubtitle,
  current = defaultCurrent,
  duration = defaultDuration,
  progress = defaultProgress,
  state = "play",
  hint,
  meta = defaultMeta,
  bars: barCount = 36,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: AudioWaveformProps) {
  const paused = state === "pause";
  const PlayPauseIcon = paused ? Pause : Play;
  const hintText = hint ?? (paused ? "Tap to pause" : "Tap to play");
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const motionState = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};
  const bars = waveformBars(barCount);
  const playedBars = Math.round((progress / 100) * barCount);

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
        className={cn("relative flex w-full", !fill && "max-w-80", "flex-col")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...motionState}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...motionState}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...motionState}
            />
          </>
        )}
        <div className="relative flex flex-col gap-3.25 rounded-xl border bg-card p-3 shadow-xs">
          <motion.div
            className="flex items-center gap-2.5"
            variants={animated ? headerAnim : undefined}
            {...motionState}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-foreground">{title}</span>
              <span className="truncate text-[10px] text-muted-foreground">{subtitle}</span>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground tabular-nums">
              {duration}
            </span>
          </motion.div>
          <div className="flex items-center gap-2.5">
            <motion.button
              type="button"
              aria-label={paused ? "Pause" : "Play"}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
              variants={animated ? buttonAnim : undefined}
              {...motionState}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <PlayPauseIcon
                className={cn("size-3.5", !paused && "translate-x-px")}
                strokeWidth={2.5}
                fill="currentColor"
              />
            </motion.button>
            <div className="relative flex h-9 flex-1 items-center">
              <motion.div
                className="flex h-full w-full items-center justify-between gap-px"
                variants={animated ? barsAnim : undefined}
                {...motionState}
              >
                {bars.map((value, i) => (
                  <motion.span
                    key={i}
                    className={cn(
                      "w-0.75 origin-center rounded-full",
                      i < playedBars ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                    style={{ height: `${Math.max(value * 100, 18)}%` }}
                    variants={animated ? barAnim : undefined}
                  />
                ))}
              </motion.div>
              <motion.div
                className="absolute top-0 bottom-0 w-px bg-primary"
                style={animated ? undefined : { left: `${progress}%`, opacity: 1 }}
                variants={animated ? playheadAnim(progress) : undefined}
                {...motionState}
              >
                <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary shadow-sm ring-2 ring-card" />
              </motion.div>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-foreground tabular-nums">
              {current}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{hintText}</span>
            <span className="font-medium">{meta}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

