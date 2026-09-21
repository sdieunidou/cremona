import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Maximize2, Pause, Play, Settings, Volume2 } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface VideoPlayerProps extends VisualProps {
  variant?: "landscape" | "tutorial" | "podcast" | "livestream";
  image?: string;
  title?: string;
  duration?: string;
  current?: string;
  progress?: number;
  state?: "play" | "pause";
  showInfo?: boolean;
  showPlayButton?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const defaultTitle = "Mountain skyline · 4K";
const defaultCurrent = "1:24";
const defaultDuration = "3:42";
const defaultProgress = 38;

function LandscapeScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_bottom,var(--color-indigo-500),var(--color-violet-500),var(--color-rose-400))]">
      <div className="absolute top-6 left-1/2 size-10 -translate-x-1/2 rounded-full bg-amber-200/90 blur-sm" />
      <div className="absolute top-6 left-1/2 size-7 -translate-x-1/2 rounded-full bg-amber-100" />
      <svg
        className="absolute right-0 bottom-0 left-0 h-2/3 w-full text-indigo-900/60"
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 L0,55 L30,30 L55,45 L85,15 L120,40 L150,25 L180,45 L200,30 L200,80 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className="absolute right-0 bottom-0 left-0 h-1/2 w-full text-indigo-950"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 L0,40 L25,18 L50,32 L75,8 L100,25 L130,12 L160,28 L185,18 L200,30 L200,60 Z"
          fill="currentColor"
        />
      </svg>
      <div className="absolute right-0 bottom-0 left-0 h-6 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.4))]" />
    </div>
  );
}

function TutorialScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,var(--color-slate-700),var(--color-slate-900))]">
      <div className="flex w-3/5 flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="h-1 w-3 rounded-full bg-violet-400/80" />
          <div className="h-1 w-10 rounded-full bg-slate-400/60" />
          <div className="h-1 w-6 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex items-center gap-1 pl-3">
          <div className="h-1 w-4 rounded-full bg-sky-400/80" />
          <div className="h-1 w-8 rounded-full bg-slate-400/60" />
          <div className="h-1 w-5 rounded-full bg-amber-400/70" />
          <div className="h-1 w-3 rounded-full bg-slate-400/40" />
        </div>
        <div className="flex items-center gap-1 pl-3">
          <div className="h-1 w-6 rounded-full bg-rose-400/80" />
          <div className="h-1 w-12 rounded-full bg-slate-400/60" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1 w-3 rounded-full bg-violet-400/80" />
          <div className="h-1 w-8 rounded-full bg-slate-400/40" />
        </div>
      </div>
    </div>
  );
}

function PodcastScene() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-emerald-500),var(--color-teal-700))]">
      <div className="absolute top-1/2 left-6 flex size-14 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
        <div className="flex h-full w-full items-end justify-center gap-0.5 p-2">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((height, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-white/85"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute top-1/2 right-6 flex size-14 -translate-y-1/2 flex-col justify-center gap-1.5 rounded-xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-sm">
        <div className="h-1 w-full rounded-full bg-white/70" />
        <div className="h-1 w-3/4 rounded-full bg-white/40" />
        <div className="h-1 w-5/6 rounded-full bg-white/40" />
        <div className="h-1 w-1/2 rounded-full bg-white/40" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.25))]" />
    </div>
  );
}

function LivestreamScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,var(--color-violet-700),var(--color-fuchsia-600),var(--color-rose-500))]">
      <div className="absolute -bottom-10 left-1/4 size-32 rounded-full bg-fuchsia-300/40 blur-2xl" />
      <div className="absolute -top-8 right-1/3 size-24 rounded-full bg-violet-300/30 blur-2xl" />
      <div className="absolute right-10 bottom-6 size-14 rounded-full bg-amber-300/25 blur-xl" />
      <div className="absolute bottom-12 left-6">
        <div className="absolute top-0 left-1/2 size-18 -translate-x-1/2 rounded-full bg-white/15 blur-md" />
        <div className="relative flex flex-col items-center">
          <div className="relative size-9">
            <div className="absolute inset-0 rounded-full bg-zinc-950/80" />
            <div className="absolute inset-x-0.5 -top-0.5 h-4 rounded-t-3xl bg-zinc-950" />
            <div className="absolute -top-0.5 left-1/2 h-3 w-9 -translate-x-1/2 rounded-t-full border-[1.5px] border-b-0 border-amber-300/90" />
            <div className="absolute top-2.5 -left-1 size-2.5 rounded-full bg-amber-300 ring-[1.5px] ring-amber-600/40" />
            <div className="absolute top-2.5 -right-1 size-2.5 rounded-full bg-amber-300 ring-[1.5px] ring-amber-600/40" />
          </div>
          <div className="relative -mt-1 h-7 w-14 rounded-t-[1.5rem] bg-zinc-950/80">
            <div className="absolute top-0 left-1/2 h-2 w-2.5 -translate-x-1/2 rounded-b-2xl bg-zinc-950" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-12 left-22 flex flex-col items-center gap-0.5">
        <div className="h-3 w-1.5 rounded-full bg-zinc-950/70" />
        <div className="h-px w-0.5 bg-zinc-950/70" />
        <div className="h-0.5 w-2.5 rounded-full bg-zinc-950/70" />
      </div>
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white uppercase shadow-sm">
        <span className="size-1 rounded-full bg-white" />
        Live
      </div>
      <div className="absolute top-8 right-2.5 rounded-full bg-black/45 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">
        6.4K watching
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4))]" />
    </div>
  );
}

const scenes = {
  landscape: LandscapeScene,
  tutorial: TutorialScene,
  podcast: PodcastScene,
  livestream: LivestreamScene,
} as const;

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

const mediaAnim = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.15, ease: "easeOut" },
  },
} as const;

const buttonAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 16, delay: 0.45 },
  },
} as const;

const chromeAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.35, ease: "easeOut" },
  },
} as const;

const progressAnim = (progress: number): Variants => ({
  hidden: { width: "0%" },
  visible: {
    width: `${progress}%`,
    transition: { duration: 0.8, delay: 0.55, ease: "easeOut" },
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

export function VideoPlayer({
  variant = "landscape",
  image,
  title = defaultTitle,
  duration = defaultDuration,
  current = defaultCurrent,
  progress = defaultProgress,
  state = "play",
  showInfo = true,
  showPlayButton = true,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  className,
}: VideoPlayerProps) {
  const paused = state === "pause";
  const PlayPauseIcon = paused ? Pause : Play;
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const visible =
    trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
      ? "visible"
      : "hidden";
  const motionState = animated ? { initial: "hidden", animate: visible } : {};
  const Scene = scenes[variant];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className="relative w-full max-w-90 rounded-3xl border border-border/50 bg-muted/75 p-1.5"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...motionState}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...motionState}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...motionState}
            />
          </>
        )}
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xs">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <motion.div
              className="absolute inset-0 will-change-transform"
              variants={animated ? mediaAnim : undefined}
              {...motionState}
            >
              {image ? (
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <Scene />
              )}
            </motion.div>
            {showInfo && (
              <motion.div
                className="absolute top-2.5 left-2.5 flex max-w-[60%] items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-[9px] font-medium text-white backdrop-blur-sm"
                variants={animated ? chromeAnim : undefined}
                {...motionState}
              >
                <span className="size-1.5 shrink-0 rounded-full bg-rose-500" />
                <span className="truncate">{title}</span>
              </motion.div>
            )}
            {showPlayButton && (
              <motion.button
                type="button"
                aria-label={paused ? "Pause" : "Play"}
                className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-primary shadow-lg ring-4 ring-white/20"
                variants={animated ? buttonAnim : undefined}
                {...motionState}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <PlayPauseIcon
                  className={cn("size-4", !paused && "translate-x-px")}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              </motion.button>
            )}
            <motion.div
              className="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-linear-to-b from-white/15 to-transparent px-2.5 pt-3.25 pb-2 dark:from-white/10"
              variants={animated ? chromeAnim : undefined}
              {...motionState}
            >
              <div className="relative h-1 w-full">
                <div className="absolute inset-0 overflow-hidden rounded-full bg-white/25">
                  <motion.div
                    className="h-full bg-primary"
                    style={animated ? undefined : { width: `${progress}%` }}
                    variants={animated ? progressAnim(progress) : undefined}
                    {...motionState}
                  />
                </div>
                <motion.div
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white shadow-sm ring-2 ring-primary"
                  style={animated ? undefined : { left: `calc(${progress}% - 5px)` }}
                  initial={animated ? { left: "-5px", opacity: 0 } : undefined}
                  animate={
                    animated
                      ? visible === "visible"
                        ? {
                            left: `calc(${progress}% - 5px)`,
                            opacity: 1,
                            transition: { duration: 0.8, delay: 0.55, ease: "easeOut" },
                          }
                        : { left: "-5px", opacity: 0 }
                      : undefined
                  }
                />
              </div>
              <div className="mt-1.25 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={paused ? "Pause" : "Play"}
                    className="flex size-5 items-center justify-center rounded-full hover:bg-white/15"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <PlayPauseIcon className="size-3" fill="currentColor" />
                  </button>
                  <Volume2 className="size-3" />
                  <span className="text-[9px] font-medium text-white/85 tabular-nums">
                    {current}{" "}
                    <span
                      className="text-white/55"
                      dangerouslySetInnerHTML={{ __html: `/ <!-- -->${duration}` }}
                    />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white/85">
                  <Settings className="size-3" />
                  <Maximize2 className="size-3" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
