import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface GalleryItem {
  kind?: keyof typeof scenes;
  src?: string;
  title: string;
}

export interface GalleryProps extends VisualProps {
  items?: GalleryItem[];
  title?: string;
  description?: string;
  columns?: number;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
  badge?: boolean;
}

function MountainThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-sky-300 to-indigo-200 dark:from-sky-700 dark:to-indigo-900">
      <div className="absolute top-1 right-1.5 size-2 rounded-full bg-yellow-200/90 shadow-[0_0_6px_rgba(254,240,138,0.8)]" />
      <div className="absolute inset-x-0 bottom-0 h-3/5">
        <div className="absolute -bottom-3.5 left-[10%] size-7 rotate-45 bg-indigo-500/80 dark:bg-indigo-400/80" />
        <div className="absolute bottom-[-18px] left-[40%] size-9 rotate-45 bg-indigo-700/90 dark:bg-indigo-300/80" />
        <div className="absolute right-[5%] -bottom-3 size-6 rotate-45 bg-violet-600/80 dark:bg-violet-400/80" />
      </div>
    </div>
  );
}

function SunsetThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-orange-300 via-rose-400 to-purple-500">
      <div className="absolute bottom-1/3 left-1/2 size-5 -translate-x-1/2 rounded-full bg-yellow-200 shadow-[0_0_10px_rgba(254,240,138,0.9)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-purple-700/60" />
      <div className="absolute inset-x-0 bottom-1/3 h-px bg-yellow-100/70" />
    </div>
  );
}

function OceanThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-sky-200 to-cyan-500 dark:from-sky-700 dark:to-cyan-900">
      <div className="absolute inset-x-0 top-[40%] h-0.5 rounded-full bg-white/40" />
      <div className="absolute inset-x-0 top-[55%] h-0.5 rounded-full bg-white/30" />
      <div className="absolute inset-x-0 top-[70%] h-0.5 rounded-full bg-white/30" />
      <div className="absolute inset-x-0 top-[85%] h-0.5 rounded-full bg-white/20" />
      <div className="absolute top-1.5 right-2 size-1.5 rounded-full bg-yellow-100/90" />
    </div>
  );
}

function ForestThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-emerald-200 to-emerald-500 dark:from-emerald-800 dark:to-emerald-950">
      <div className="absolute -bottom-2 left-[5%] h-0 w-0 border-r-10 border-b-16 border-l-10 border-r-transparent border-b-emerald-700 border-l-transparent dark:border-b-emerald-600" />
      <div className="absolute -bottom-2 left-[28%] h-0 w-0 border-r-12 border-b-20 border-l-12 border-r-transparent border-b-emerald-800 border-l-transparent dark:border-b-emerald-500" />
      <div className="absolute -bottom-2 left-[50%] h-0 w-0 border-r-10 border-b-16 border-l-10 border-r-transparent border-b-emerald-700 border-l-transparent dark:border-b-emerald-600" />
      <div className="absolute right-[5%] -bottom-2 h-0 w-0 border-r-12 border-b-20 border-l-12 border-r-transparent border-b-emerald-800 border-l-transparent dark:border-b-emerald-500" />
    </div>
  );
}

function DesertThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-amber-200 to-orange-400">
      <div className="absolute top-1.5 right-2 size-2.5 rounded-full bg-yellow-300/90 shadow-[0_0_6px_rgba(253,224,71,0.8)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[100%] bg-amber-500/80" />
      <div className="absolute inset-x-0 -bottom-2 h-1/3 rounded-t-[100%] bg-orange-600/80" />
    </div>
  );
}

function CityThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-slate-300 to-slate-500 dark:from-slate-700 dark:to-slate-900">
      <div className="absolute top-1 left-2 size-1 rounded-full bg-yellow-100/70" />
      <div className="absolute inset-x-0 bottom-0 flex h-3/5 items-end justify-center gap-0.5">
        <div className="h-1/2 w-1.5 bg-slate-600 dark:bg-slate-500" />
        <div className="h-3/4 w-2 bg-slate-700 dark:bg-slate-400" />
        <div className="h-2/3 w-1.5 bg-slate-600 dark:bg-slate-500" />
        <div className="h-full w-2 bg-slate-800 dark:bg-slate-300" />
        <div className="h-1/2 w-1.5 bg-slate-600 dark:bg-slate-500" />
        <div className="h-3/5 w-2 bg-slate-700 dark:bg-slate-400" />
        <div className="h-2/5 w-1.5 bg-slate-600 dark:bg-slate-500" />
      </div>
    </div>
  );
}

function AuroraThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950">
      <div className="absolute top-1 right-1.5 size-2 rounded-full bg-slate-100/90 shadow-[0_0_6px_rgba(241,245,249,0.6)]" />
      <div className="absolute top-1 left-2 size-0.5 rounded-full bg-white/80" />
      <div className="absolute top-2.5 left-5 size-0.5 rounded-full bg-white/70" />
      <div className="absolute top-0.5 right-5 size-0.5 rounded-full bg-white/60" />
      <div className="absolute top-3.5 left-1 size-0.5 rounded-full bg-white/60" />
      <div className="absolute top-3 right-3 size-0.5 rounded-full bg-white/70" />
      <div className="absolute top-5 left-6 size-0.5 rounded-full bg-white/60" />
      <div className="absolute inset-x-0 top-1/4 h-3 rotate-[-8deg] rounded-full bg-emerald-400/60 blur-[2px]" />
      <div className="absolute inset-x-0 top-[38%] h-2 rotate-[-4deg] rounded-full bg-teal-300/60 blur-[2px]" />
      <div className="absolute inset-x-0 top-[52%] h-2 rotate-6 rounded-full bg-cyan-300/50 blur-[2px]" />
      <div className="absolute inset-x-0 top-[65%] h-2 rotate-3 rounded-full bg-violet-400/50 blur-[2px]" />
      <div className="absolute top-1/4 left-[20%] h-8 w-0.5 -rotate-6 rounded-full bg-emerald-300/40 blur-[3px]" />
      <div className="absolute -bottom-1.5 left-[10%] size-4 rotate-45 bg-slate-950" />
      <div className="absolute -bottom-2 left-[40%] size-5 rotate-45 bg-slate-950" />
      <div className="absolute right-[10%] -bottom-1.5 size-4 rotate-45 bg-slate-950" />
    </div>
  );
}

function BlossomThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-b from-pink-200 via-pink-300 to-rose-400">
      <div className="absolute top-1 left-1 size-5 rounded-full bg-pink-100/30 blur-md" />
      <div className="absolute right-1 bottom-1 size-6 rounded-full bg-rose-200/30 blur-md" />
      <div className="absolute right-0 bottom-2 h-0.5 w-2/3 origin-right -rotate-12 rounded-full bg-amber-900/40" />
      <div className="absolute top-1.5 left-1 size-4">
        <div className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-pink-50" />
        <div className="absolute top-1 left-0 size-1.5 rounded-full bg-pink-50" />
        <div className="absolute top-1 right-0 size-1.5 rounded-full bg-pink-100" />
        <div className="absolute bottom-0 left-0.5 size-1.5 rounded-full bg-pink-100" />
        <div className="absolute right-0.5 bottom-0 size-1.5 rounded-full bg-pink-50" />
        <div className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300" />
      </div>
      <div className="absolute right-1 bottom-2.5 size-3.5">
        <div className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-rose-100" />
        <div className="absolute top-1 left-0 size-1.5 rounded-full bg-rose-100" />
        <div className="absolute top-1 right-0 size-1.5 rounded-full bg-pink-50" />
        <div className="absolute bottom-0 left-0.5 size-1.5 rounded-full bg-rose-100" />
        <div className="absolute right-0.5 bottom-0 size-1.5 rounded-full bg-pink-50" />
        <div className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200" />
      </div>
      <div className="absolute top-1 right-2 size-1 rounded-full bg-pink-50/80" />
      <div className="absolute bottom-4 left-3 size-1 rounded-full bg-rose-100/70" />
      <div className="absolute top-5 right-3 size-0.5 rounded-full bg-pink-50/80" />
    </div>
  );
}

function GeometricThumb() {
  return (
    <div className="relative size-full overflow-hidden bg-linear-to-br from-orange-50 to-rose-100 dark:from-slate-800 dark:to-slate-900">
      <div className="absolute -top-3 -right-3 size-10 rounded-full bg-rose-500" />
      <div className="absolute top-1.5 left-2 size-2 rounded-full bg-indigo-600" />
      <div className="absolute bottom-1 left-2 h-0 w-0 border-r-6 border-b-10 border-l-6 border-r-transparent border-b-emerald-500 border-l-transparent" />
      <div className="absolute right-2 bottom-2.5 size-3.5 rounded-full border-2 border-amber-500" />
      <div className="absolute top-1/2 left-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-violet-700" />
      <div className="absolute right-7 bottom-1 size-1.5 rotate-12 bg-sky-500" />
    </div>
  );
}

const scenes = {
  mountain: MountainThumb,
  sunset: SunsetThumb,
  ocean: OceanThumb,
  forest: ForestThumb,
  desert: DesertThumb,
  city: CityThumb,
  aurora: AuroraThumb,
  blossom: BlossomThumb,
  geometric: GeometricThumb,
};

const defaultItems: GalleryItem[] = [
  { kind: "mountain", title: "Alpine" },
  { kind: "sunset", title: "Dusk" },
  { kind: "ocean", title: "Pacific" },
  { kind: "forest", title: "Pines" },
  { kind: "desert", title: "Dunes" },
  { kind: "city", title: "Skyline" },
  { kind: "aurora", title: "Aurora" },
  { kind: "blossom", title: "Blossom" },
  { kind: "geometric", title: "Studio" },
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

const gridAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 360, damping: 22 },
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

export function Gallery({
  items = defaultItems,
  title = "Gallery",
  description,
  columns = 3,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  badge = true,
  fill = false,
  className,
}: GalleryProps) {
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
        className={`relative w-full${fill ? "" : " max-w-72"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...motionState}
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
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <div className="flex items-center gap-2">
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-foreground">{title}</span>
                {description && (
                  <span className="text-[10px] text-muted-foreground">{description}</span>
                )}
              </div>
            </div>
            {badge && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {items.length}
              </span>
            )}
          </div>
          <motion.div
            className="grid gap-1.75 p-2.5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            variants={animated ? gridAnim : undefined}
            {...motionState}
          >
            {items.map((item, i) => {
              const Thumb = item.kind ? scenes[item.kind] : null;
              return (
                <motion.div
                  key={i}
                  role="img"
                  aria-label={item.title}
                  className="aspect-square overflow-hidden rounded-lg bg-background will-change-transform"
                  variants={animated ? itemAnim : undefined}
                >
                  {item.src ? (
                    <img src={item.src} alt={item.title} className="size-full object-cover" />
                  ) : (
                    Thumb && <Thumb />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
