import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CarouselSlide {
  kind?: keyof typeof scenes;
  src?: string;
  title: string;
  caption: string;
}

export interface CarouselProps extends VisualProps {
  slides?: CarouselSlide[];
  count?: number;
  activeIndex?: number;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
  arrows?: boolean;
  badge?: boolean;
}

function MountainScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-sky-300 to-indigo-200 dark:from-sky-700 dark:to-indigo-900">
      <div className="absolute top-2 right-3 size-4 rounded-full bg-yellow-200/90 shadow-[0_0_10px_rgba(254,240,138,0.8)]" />
      <div className="absolute inset-x-0 bottom-0 h-3/5">
        <div className="absolute -bottom-6 left-[8%] size-12 rotate-45 bg-indigo-500/80 dark:bg-indigo-400/80" />
        <div className="absolute -bottom-8 left-[35%] size-16 rotate-45 bg-indigo-700/90 dark:bg-indigo-300/80" />
        <div className="absolute right-[5%] -bottom-5 size-10 rotate-45 bg-violet-600/80 dark:bg-violet-400/80" />
      </div>
    </div>
  );
}

function SunsetScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-orange-300 via-rose-400 to-purple-500">
      <div className="absolute bottom-1/3 left-1/2 size-10 -translate-x-1/2 rounded-full bg-yellow-200 shadow-[0_0_20px_rgba(254,240,138,0.9)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-purple-700/60" />
      <div className="absolute inset-x-0 bottom-1/3 h-px bg-yellow-100/70" />
    </div>
  );
}

function OceanScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-sky-200 to-cyan-500 dark:from-sky-700 dark:to-cyan-900">
      <div className="absolute inset-x-0 top-[40%] h-0.5 rounded-full bg-white/40" />
      <div className="absolute inset-x-0 top-[55%] h-0.5 rounded-full bg-white/30" />
      <div className="absolute inset-x-0 top-[70%] h-0.5 rounded-full bg-white/30" />
      <div className="absolute inset-x-0 top-[85%] h-0.5 rounded-full bg-white/20" />
      <div className="absolute top-3 right-4 size-3 rounded-full bg-yellow-100/90" />
    </div>
  );
}

function ForestScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-emerald-200 to-emerald-500 dark:from-emerald-800 dark:to-emerald-950">
      <div className="absolute -bottom-3 left-[5%] h-0 w-0 border-r-18 border-b-28 border-l-18 border-r-transparent border-b-emerald-700 border-l-transparent dark:border-b-emerald-600" />
      <div className="absolute -bottom-3 left-[28%] h-0 w-0 border-r-22 border-b-36 border-l-22 border-r-transparent border-b-emerald-800 border-l-transparent dark:border-b-emerald-500" />
      <div className="absolute -bottom-3 left-[50%] h-0 w-0 border-r-18 border-b-28 border-l-18 border-r-transparent border-b-emerald-700 border-l-transparent dark:border-b-emerald-600" />
      <div className="absolute right-[5%] -bottom-3 h-0 w-0 border-r-22 border-b-36 border-l-22 border-r-transparent border-b-emerald-800 border-l-transparent dark:border-b-emerald-500" />
    </div>
  );
}

function DesertScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-amber-200 to-orange-400">
      <div className="absolute top-2 right-3 size-5 rounded-full bg-yellow-300/90 shadow-[0_0_12px_rgba(253,224,71,0.8)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[100%] bg-amber-500/80" />
      <div className="absolute inset-x-0 -bottom-4 h-1/3 rounded-t-[100%] bg-orange-600/80" />
    </div>
  );
}

function CityScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-slate-300 to-slate-500 dark:from-slate-700 dark:to-slate-900">
      <div className="absolute top-2 left-3 size-2 rounded-full bg-yellow-100/70" />
      <div className="absolute inset-x-0 bottom-0 flex h-3/5 items-end justify-center gap-1">
        <div className="h-1/2 w-3 bg-slate-600 dark:bg-slate-500" />
        <div className="h-3/4 w-4 bg-slate-700 dark:bg-slate-400" />
        <div className="h-2/3 w-3 bg-slate-600 dark:bg-slate-500" />
        <div className="h-full w-4 bg-slate-800 dark:bg-slate-300" />
        <div className="h-1/2 w-3 bg-slate-600 dark:bg-slate-500" />
        <div className="h-3/5 w-4 bg-slate-700 dark:bg-slate-400" />
        <div className="h-2/5 w-3 bg-slate-600 dark:bg-slate-500" />
      </div>
    </div>
  );
}

function AuroraScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950">
      <div className="absolute top-2 right-3 size-3 rounded-full bg-slate-100/90 shadow-[0_0_10px_rgba(241,245,249,0.7)]" />
      <div className="absolute top-3 left-4 size-1 rounded-full bg-white/80" />
      <div className="absolute top-1 left-10 size-0.5 rounded-full bg-white/70" />
      <div className="absolute top-5 left-2 size-0.5 rounded-full bg-white/60" />
      <div className="absolute top-2 left-16 size-1 rounded-full bg-white/70" />
      <div className="absolute top-6 right-10 size-0.5 rounded-full bg-white/60" />
      <div className="absolute top-1 right-14 size-0.5 rounded-full bg-white/80" />
      <div className="absolute top-4 right-2 size-0.5 rounded-full bg-white/70" />
      <div className="absolute inset-x-0 top-1/4 h-5 rotate-[-8deg] rounded-full bg-emerald-400/60 blur-[3px]" />
      <div className="absolute inset-x-0 top-[38%] h-4 rotate-[-4deg] rounded-full bg-teal-300/60 blur-[3px]" />
      <div className="absolute inset-x-0 top-[52%] h-4 rotate-6 rounded-full bg-cyan-300/50 blur-[3px]" />
      <div className="absolute inset-x-0 top-[65%] h-3 rotate-3 rounded-full bg-violet-400/50 blur-[3px]" />
      <div className="absolute top-1/4 left-[20%] h-12 w-1 -rotate-6 rounded-full bg-emerald-300/40 blur-xs" />
      <div className="absolute top-[30%] right-[25%] h-10 w-1 rotate-6 rounded-full bg-violet-300/40 blur-xs" />
      <div className="absolute -bottom-2 left-[10%] size-7 rotate-45 bg-slate-950" />
      <div className="absolute -bottom-3 left-[40%] size-9 rotate-45 bg-slate-950" />
      <div className="absolute right-[10%] -bottom-2 size-7 rotate-45 bg-slate-950" />
    </div>
  );
}

function BlossomScene() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-pink-200 via-pink-300 to-rose-400">
      <div className="absolute top-1 left-2 size-8 rounded-full bg-pink-100/30 blur-md" />
      <div className="absolute right-3 bottom-2 size-10 rounded-full bg-rose-200/30 blur-md" />
      <div className="absolute top-1/2 left-1/3 size-6 rounded-full bg-pink-50/30 blur-md" />
      <div className="absolute right-0 bottom-3 h-0.5 w-2/3 origin-right -rotate-12 rounded-full bg-amber-900/40" />
      <div className="absolute bottom-2 left-1 h-0.5 w-1/3 origin-left rotate-[8deg] rounded-full bg-amber-900/30" />
      <div className="absolute top-3 left-3 size-6">
        <div className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-pink-50" />
        <div className="absolute top-1.5 left-0 size-2.5 rounded-full bg-pink-50" />
        <div className="absolute top-1.5 right-0 size-2.5 rounded-full bg-pink-100" />
        <div className="absolute bottom-0 left-1 size-2.5 rounded-full bg-pink-100" />
        <div className="absolute right-1 bottom-0 size-2.5 rounded-full bg-pink-50" />
        <div className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300" />
      </div>
      <div className="absolute right-2 bottom-4 size-5">
        <div className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-rose-100" />
        <div className="absolute top-1 left-0 size-2 rounded-full bg-rose-100" />
        <div className="absolute top-1 right-0 size-2 rounded-full bg-pink-50" />
        <div className="absolute bottom-0 left-0.5 size-2 rounded-full bg-rose-100" />
        <div className="absolute right-0.5 bottom-0 size-2 rounded-full bg-pink-50" />
        <div className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200" />
      </div>
      <div className="absolute top-2 right-4 size-1.5 rounded-full bg-pink-50/80" />
      <div className="absolute top-8 right-9 size-1 rounded-full bg-pink-100/70" />
      <div className="absolute bottom-7 left-8 size-1.5 rounded-full bg-rose-100/70" />
      <div className="absolute top-1/2 right-7 size-1 rounded-full bg-pink-50/80" />
    </div>
  );
}

const scenes = {
  mountain: MountainScene,
  sunset: SunsetScene,
  ocean: OceanScene,
  forest: ForestScene,
  desert: DesertScene,
  city: CityScene,
  aurora: AuroraScene,
  blossom: BlossomScene,
};

function Slide({ slide }: { slide: CarouselSlide }) {
  if (slide.src) {
    return <img src={slide.src} alt={slide.title} className="size-full object-cover" />;
  }
  if (slide.kind) {
    const Scene = scenes[slide.kind];
    return <Scene />;
  }
  return null;
}

const defaultSlides: CarouselSlide[] = [
  { kind: "sunset", title: "Costa Brava", caption: "Sunset over the cliffs" },
  { kind: "mountain", title: "Dolomites", caption: "Above the cloud line" },
  { kind: "ocean", title: "Big Sur", caption: "Pacific morning swell" },
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

const stageAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const slideAnim = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
} as const;

const captionAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: 0.45, ease: "easeOut" },
  },
} as const;

const dotsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.6 } },
} as const;

const dotAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
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

const arrowsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 1 } },
} as const;

const arrowAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

export function Carousel({
  slides = defaultSlides,
  count = 5,
  activeIndex = 1,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  arrows = true,
  badge = true,
  fill = false,
  className,
}: CarouselProps) {
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
  const active = Math.min(Math.max(activeIndex, 0), count - 1);
  const leftSlide = slides[0]!;
  const centerSlide = slides[Math.min(1, slides.length - 1)]!;
  const rightSlide = slides[Math.min(2, slides.length - 1)]!;

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
        className={cn("relative w-full", !fill && "max-w-80")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...motionState}
      >
        <div
          className={`relative rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        >
          {gradient && !fadeOut && (
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
            <motion.div
              className="relative flex h-36 items-center justify-center"
              variants={animated ? stageAnim : undefined}
              {...motionState}
            >
              <motion.div
                aria-hidden="true"
                className="absolute top-1/2 left-1 h-24 w-16 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-card bg-background opacity-50"
                variants={animated ? slideAnim : undefined}
              >
                <Slide slide={leftSlide} />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="absolute top-1/2 right-1 h-24 w-16 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-card bg-background opacity-50"
                variants={animated ? slideAnim : undefined}
              >
                <Slide slide={rightSlide} />
              </motion.div>
              <motion.div
                role="img"
                aria-label={centerSlide.title}
                className="relative h-28 w-44 overflow-hidden rounded-xl border-2 border-card bg-background"
                variants={animated ? slideAnim : undefined}
              >
                <Slide slide={centerSlide} />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-foreground/60 to-transparent" />
              </motion.div>
            </motion.div>
            <motion.div
              className="flex items-center justify-between gap-2 border-t px-3 py-2.5"
              variants={animated ? captionAnim : undefined}
              {...motionState}
            >
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-xs font-semibold text-foreground">
                  {centerSlide.title}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {centerSlide.caption}
                </span>
              </div>
              {badge && (
                <span
                  className="shrink-0 rounded-full border bg-background px-1.5 py-px text-[9px] font-medium text-muted-foreground tabular-nums"
                  dangerouslySetInnerHTML={{ __html: `${active + 1}<!-- --> / <!-- -->${count}` }}
                />
              )}
            </motion.div>
            <motion.div
              className="flex items-center justify-center gap-1 pb-2.5"
              variants={animated ? dotsAnim : undefined}
              {...motionState}
            >
              {Array.from({ length: count }).map((_, i) => (
                <motion.span
                  key={i}
                  className={cn(
                    "h-1 rounded-full",
                    i === active ? "w-4 bg-primary" : "w-1 bg-muted-foreground/30",
                  )}
                  variants={animated ? dotAnim : undefined}
                />
              ))}
            </motion.div>
          </div>
        </div>
        {arrows && (
          <motion.div variants={animated ? arrowsAnim : undefined} {...motionState}>
            <motion.button
              type="button"
              className="absolute top-20 -left-2.5 z-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/75 text-foreground shadow-lg backdrop-blur-sm hover:border-primary hover:bg-primary hover:text-primary-foreground"
              aria-label="Previous"
              variants={animated ? arrowAnim : undefined}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronLeft className="size-4 opacity-75" />
            </motion.button>
            <motion.button
              type="button"
              className="absolute top-20 -right-2.5 z-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/75 text-foreground shadow-lg backdrop-blur-sm hover:border-primary hover:bg-primary hover:text-primary-foreground"
              aria-label="Next"
              variants={animated ? arrowAnim : undefined}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronRight className="size-4 opacity-75" />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
