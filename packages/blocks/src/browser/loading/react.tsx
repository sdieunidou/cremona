import { useEffect, useRef, useState } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const chrome = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2, ease: "easeOut" } },
} as const;

const viewport = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, delay: 0.2, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

function Skeleton({ pulse }: { pulse: boolean }) {
  const pulseProps: HTMLMotionProps<"div"> = pulse
    ? {
        animate: { opacity: [0.4, 1, 0.4] },
        transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
      }
    : {};
  return (
    <div className="mx-auto flex h-full w-full max-w-56 flex-col gap-2">
      <div className="flex items-center justify-between">
        <motion.div className="size-2.5 rounded-full bg-muted" {...pulseProps} />
        <div className="flex items-center gap-2">
          <motion.div className="h-1 w-4 rounded-full bg-muted" {...pulseProps} />
          <motion.div className="h-1 w-4 rounded-full bg-muted" {...pulseProps} />
          <motion.div className="h-1 w-4 rounded-full bg-muted" {...pulseProps} />
        </div>
        <motion.div className="h-2.5 w-6 rounded-md bg-muted" {...pulseProps} />
      </div>
      <div className="flex flex-col items-center gap-1 pt-3">
        <motion.div className="h-1.5 w-3/5 rounded-full bg-muted" {...pulseProps} />
        <motion.div className="h-1 w-2/5 rounded-full bg-muted" {...pulseProps} />
        <motion.div className="h-1 w-1/3 rounded-full bg-muted" {...pulseProps} />
        <div className="mt-1 flex gap-1">
          <motion.div className="h-3 w-8 rounded-md bg-muted" {...pulseProps} />
          <motion.div className="h-3 w-8 rounded-md bg-muted" {...pulseProps} />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex flex-col gap-1 rounded-lg bg-muted p-1.5"
            animate={pulse ? { opacity: [0.4, 1, 0.4] } : undefined}
            transition={
              pulse
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
                : undefined
            }
          >
            <div className="size-2 rounded-full bg-muted-foreground/25" />
            <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
            <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/15" />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i} className="h-1 w-6 rounded-full bg-muted" {...pulseProps} />
        ))}
      </div>
    </div>
  );
}

export interface LoadingProps extends VisualProps {
  url?: string;
  hover?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Loading({
  // NOTE: the extracted POC chunk says `example.com`, but every golden shows
  // `app.example.com` — the goldens are the render reference, so they win.
  url = "app.example.com",
  animated = false,
  trigger = "inView",
  hover = false,
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: LoadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const loaded = hover ? isHovering : inView;
  const state = animated
    ? {
        initial: "hidden",
        animate: inView ? "visible" : "hidden",
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
      onMouseEnter={animated && hover ? () => setIsHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setIsHovering(false) : undefined}
    >
      <motion.div
        className={`relative w-full${fill ? "" : " max-w-90"} rounded-2xl border border-border/50 bg-muted/75 px-1.5 pb-1.5 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative flex flex-col">
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <div className="flex gap-1.5">
              <div className="size-2 rounded-full bg-rose-400" />
              <div className="size-2 rounded-full bg-amber-400" />
              <div className="size-2 rounded-full bg-emerald-400" />
            </div>
            <motion.div
              className="flex h-5 min-w-40 flex-1 items-center rounded-xl bg-background/75 px-2"
              variants={animated ? chrome : undefined}
            >
              <span className="truncate text-[10px] text-muted-foreground">{url}</span>
            </motion.div>
            <motion.button
              type="button"
              className="relative z-1 flex size-5 items-center justify-center rounded-full bg-background/75 shadow-sm hover:bg-background"
              variants={animated ? chrome : undefined}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ArrowRight className="size-2.5" />
            </motion.button>
          </div>
          <motion.div
            className="relative h-56 overflow-hidden rounded-xl border bg-background p-3"
            variants={animated ? viewport : undefined}
            {...state}
          >
            {animated ? (
              <>
                <motion.div
                  className="absolute top-0 left-0 h-0.5 bg-primary"
                  style={{ width: "70%" }}
                  animate={{ opacity: Number(!loaded) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute top-0 left-0 h-0.5 w-full"
                  animate={{ opacity: Number(!!loaded) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "70%", "70%", "100%"] }}
                    transition={{ duration: 3, times: [0, 0.5, 0.7, 1], repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </>
            ) : (
              <div className="absolute top-0 left-0 h-0.5 bg-primary" style={{ width: "70%" }} />
            )}
            {animated ? (
              <>
                <motion.div
                  className="absolute inset-3"
                  animate={{ opacity: Number(!loaded) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Skeleton pulse={false} />
                </motion.div>
                <motion.div
                  className="absolute inset-3"
                  animate={{ opacity: Number(!!loaded) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Skeleton pulse={true} />
                </motion.div>
              </>
            ) : (
              <Skeleton pulse={false} />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
