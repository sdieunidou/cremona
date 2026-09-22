import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

const cardAnim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardIso: Variants = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const gridAnim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.1, ease: "easeOut" } },
};

const glowAnim: Variants = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
};

const veilAnim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
};

const rowHead: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.25, ease: "easeOut" } },
};

const rowLogos: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.35, ease: "easeOut" } },
};

const SLOTS = [0, 1, 2, 3, 4];

export interface LogosProps extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Logos({
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: LogosProps) {
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
        className={cn("w-full", !fill && "max-w-72", "p-8.5", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : cardAnim) : undefined}
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
          <div className="relative rounded-xl border bg-card p-8 shadow-xs">
            <div className="flex flex-col items-center">
              <motion.div
                className="flex w-full flex-col items-center gap-1"
                variants={animated ? rowHead : undefined}
                {...state}
              >
                <div className="h-0.75 w-1/2 rounded-full bg-muted-foreground/20" />
              </motion.div>
              <motion.div
                className="mt-4 flex w-full items-center justify-between gap-2"
                variants={animated ? rowLogos : undefined}
                {...state}
              >
                {SLOTS.map((slot) => (
                  <div key={slot} className="h-2.5 flex-1 rounded-md bg-muted-foreground/10" />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
