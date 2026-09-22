import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type LaptopVariant = "landing" | "dashboard" | "windows" | "mac" | "lockscreen" | "screenshot";

const DASHBOARD_BARS = [50, 75, 40, 90, 60, 80, 55, 95, 70, 45, 85, 65, 35, 78];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
} as const;

const base = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: { opacity: 1, scaleY: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const screenLid = {
  hidden: { rotateX: -86 },
  visible: { rotateX: 0, transition: { duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] } },
} as const;

const screenContent = {
  hidden: { clipPath: "circle(0% at 50% 100%)" },
  visible: {
    clipPath: "circle(150% at 50% 100%)",
    transition: { duration: 1, delay: 0.4, ease: "easeOut" },
  },
} as const;

const chartBar = (i: number): Variants => ({
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.35, delay: 0.8 + i * 0.025, ease: "easeOut" },
  },
});

const lockClock = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.7, ease: "easeOut" } },
} as const;

const lockUser = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.85 },
  },
} as const;

const chartBarVariants = DASHBOARD_BARS.map((_, i) => chartBar(i));

function LandingContent() {
  return (
    <div className="mx-auto flex h-full w-full max-w-72 flex-col gap-2 py-1">
      <div className="flex items-center justify-between">
        <div className="size-2.5 rounded-full bg-primary" />
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="h-2.5 w-6 rounded-md bg-primary" />
      </div>
      <div className="flex flex-col items-center gap-1 pt-2">
        <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/25" />
        <div className="h-1 w-2/5 rounded-full bg-muted-foreground/15" />
        <div className="h-1 w-1/3 rounded-full bg-muted-foreground/15" />
        <div className="mt-1 flex gap-1">
          <div className="h-3 w-8 rounded-md bg-primary" />
          <div className="h-3 w-8 rounded-md border border-muted-foreground/15" />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-lg bg-muted/60 p-1.5">
            <div className="size-2 rounded-full bg-muted-foreground/25" />
            <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
            <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/15" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WindowsContent() {
  return (
    <div className="flex h-full flex-col bg-linear-to-br from-primary/20 via-primary/10 to-primary/20">
      <div className="flex flex-1 items-center justify-center p-2">
        <div className="h-4/5 w-3/5 rounded-md border bg-background/95">
          <div className="flex items-center justify-between border-b border-border/50 px-1.5 py-1">
            <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-0.5">
              <div className="size-1.25 rounded-xs bg-muted-foreground/30" />
              <div className="size-1.25 rounded-xs bg-muted-foreground/30" />
              <div className="size-1.25 rounded-xs bg-destructive/60" />
            </div>
          </div>
          <div className="flex flex-col gap-1 p-1.5">
            <div className="h-1 w-3/4 rounded-full bg-muted-foreground/25" />
            <div className="h-1 w-1/2 rounded-full bg-muted-foreground/15" />
            <div className="h-1 w-3/5 rounded-full bg-muted-foreground/15" />
            <div className="h-1 w-2/5 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 bg-background px-2 py-1">
        <div className="size-2.5 rounded-xs bg-primary" />
        <div className="size-2.5 rounded-xs bg-muted-foreground/30" />
        <div className="size-2.5 rounded-xs bg-muted-foreground/30" />
        <div className="size-2.5 rounded-xs bg-muted-foreground/30" />
        <div className="size-2.5 rounded-xs bg-muted-foreground/30" />
      </div>
    </div>
  );
}

function MacContent() {
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 bg-background/80 px-1.5 py-1">
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 rounded-full bg-foreground/70" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
          <div className="h-1 w-3 rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-3 rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-3 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/35" />
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center bg-linear-to-br from-primary/20 via-primary/10 to-primary/20 pb-5">
        <div className="h-4/5 w-3/5 rounded-lg border bg-background/95">
          <div className="flex gap-0.75 border-b border-border/50 px-1.5 py-1">
            <div className="size-1.25 rounded-full bg-rose-400" />
            <div className="size-1.25 rounded-full bg-amber-400" />
            <div className="size-1.25 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-col gap-1 p-1.5">
            <div className="h-1 w-3/4 rounded-full bg-muted-foreground/25" />
            <div className="h-1 w-1/2 rounded-full bg-muted-foreground/15" />
            <div className="h-1 w-2/3 rounded-full bg-muted-foreground/15" />
            <div className="h-1 w-2/5 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border border-border/50 bg-background/80 px-1.25 py-0.5">
          <div className="size-2 rounded-xs bg-primary" />
          <div className="size-2 rounded-xs bg-muted-foreground/30" />
          <div className="size-2 rounded-xs bg-muted-foreground/30" />
          <div className="size-2 rounded-xs bg-muted-foreground/30" />
          <div className="size-2 rounded-xs bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}

export interface LaptopProps extends VisualProps {
  variant?: LaptopVariant;
  image?: string;
  time?: string;
  date?: string;
  name?: string;
}

export function Laptop({
  animated = false,
  trigger = "inView",
  variant = "landing",
  image,
  time = "9:41",
  date = "Monday, May 25",
  name = "Alex Morgan",
  fill = false,
  className,
}: LaptopProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const isScreenshot = variant === "screenshot" && !!image;
  const isFullScreen =
    variant === "windows" || variant === "mac" || variant === "lockscreen" || isScreenshot;

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
        className={cn("w-full", !fill && "max-w-80", "perspective-distant")}
        variants={animated ? container : undefined}
        {...state}
      >
        <motion.div
          className="origin-bottom rounded-t-xl border border-b-0 border-border/50 bg-muted p-1.5"
          variants={animated ? screenLid : undefined}
        >
          <div className="aspect-video w-full overflow-hidden rounded-md bg-background">
            <motion.div
              className={`h-full will-change-transform ${isFullScreen ? `` : `flex gap-1.5 p-2`}`}
              variants={animated ? screenContent : undefined}
            >
              {isScreenshot ? (
                <img src={image} alt="" className="size-full object-cover object-top" />
              ) : variant === "lockscreen" ? (
                <div className="relative size-full">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt=""
                        className="absolute inset-0 size-full object-cover object-top"
                      />
                      <div className="absolute inset-0 size-full bg-linear-to-b from-black/40 via-transparent to-black/40" />
                    </>
                  ) : (
                    <div className="absolute inset-0 size-full bg-linear-to-br from-indigo-950 via-purple-900 to-slate-950" />
                  )}
                  <motion.div
                    className="absolute inset-x-0 top-5 flex flex-col items-center"
                    variants={animated ? lockClock : undefined}
                  >
                    <span className="text-xl font-light tracking-tight text-white drop-shadow-sm">
                      {time}
                    </span>
                    <span className="text-[9px] font-medium text-white/80 drop-shadow-sm">{date}</span>
                  </motion.div>
                  <motion.div
                    className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-1.5"
                    variants={animated ? lockUser : undefined}
                  >
                    <div className="size-6 rounded-full bg-white/20 ring-2 ring-white/30 backdrop-blur-sm" />
                    <span className="text-[10px] font-semibold text-white drop-shadow-sm">{name}</span>
                    <div className="mt-0.5 flex h-4 w-28 items-center justify-between rounded-full bg-white/15 pr-1 pl-2 backdrop-blur-sm">
                      <div className="flex gap-0.75">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="size-0.75 rounded-full bg-white/60" />
                        ))}
                      </div>
                      <ChevronRight className="size-2.5 text-white/70" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                </div>
              ) : variant === "landing" ? (
                <LandingContent />
              ) : variant === "windows" ? (
                <WindowsContent />
              ) : variant === "mac" ? (
                <MacContent />
              ) : variant === "dashboard" ? (
                <>
                  <div className="flex w-10 flex-col gap-1 border-r border-muted pr-1.5">
                    <div className="h-1.5 w-full rounded-full bg-primary" />
                    <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/15" />
                    <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/15" />
                    <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/15" />
                    <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/15" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-0.5 rounded-md bg-muted/60 p-1">
                          <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/20" />
                          <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/35" />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-1 items-end justify-between gap-0.5 rounded-md bg-muted/60 p-1.5">
                      {DASHBOARD_BARS.map((height, i) => (
                        <motion.div
                          key={i}
                          custom={i}
                          variants={animated ? chartBarVariants[i] : undefined}
                          className="w-1 origin-bottom rounded-sm bg-chart-3"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <div className="size-1.25 rounded-full bg-primary" />
                          <div className="h-1.25 flex-1 rounded-full bg-muted-foreground/15" />
                          <div className="h-1.25 w-6 rounded-full bg-muted-foreground/15" />
                          <div className="h-1.25 w-6 rounded-full bg-muted-foreground/15" />
                          <div className="h-1.25 w-6 rounded-full bg-muted-foreground/15" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </motion.div>
          </div>
        </motion.div>
        <motion.div className="relative origin-top" variants={animated ? base : undefined}>
          <div className="-mx-4 h-2.5 rounded-b-lg bg-muted-foreground/20" />
          <div className="absolute top-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-b-lg bg-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </div>
  );
}
