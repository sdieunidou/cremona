import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const pricingDefaultCopy = {
  title: "Pricing plans",
} as const;

const plans = [
  { price: "$19/m", featured: false },
  { price: "$39/m", featured: true },
  { price: "$99/m", featured: false },
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

const frame = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const plansAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, delay: 0.3, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface PricingProps extends VisualProps {
  title?: string;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

export function Pricing({
  title = pricingDefaultCopy.title,
  animated = false,
  trigger = "inView",
  gradient = true,
  fadeOut = false,
  isometric = false,
  className,
}: PricingProps) {
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
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={cn("w-full max-w-72 p-8.5 will-change-transform", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative p-1.5">
          <motion.div variants={animated ? frame : undefined} {...state}>
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
          <div className="relative rounded-xl border bg-card px-4 py-5 shadow-xs">
            <motion.div
              className="flex flex-col items-center"
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
                className="mt-1 flex w-full flex-col items-center gap-1"
                variants={animated ? item : undefined}
              >
                <div className="h-0.75 w-1/2 rounded-full bg-muted-foreground/20" />
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-3 flex gap-1.5"
              variants={animated ? plansAnim : undefined}
              {...state}
            >
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-1.5 py-2",
                    plan.featured ? "border-primary bg-card shadow-sm" : "border-border/50 bg-muted/35",
                  )}
                >
                  <div className="h-0.75 w-3/5 rounded-full bg-muted-foreground/15" />
                  <p className="text-[9px] font-bold text-foreground">{plan.price}</p>
                  <div className="flex w-full flex-col gap-1">
                    {[0, 1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-1">
                        <div className="size-1 rounded-full bg-primary/30 dark:bg-primary/50" />
                        <div className="h-0.5 flex-1 rounded-full bg-muted-foreground/12" />
                      </div>
                    ))}
                  </div>
                  <div
                    className={cn(
                      "mt-1 flex h-3 w-full items-center justify-center rounded-md",
                      plan.featured ? "bg-primary" : "border",
                    )}
                  >
                    <div
                      className={cn(
                        "h-0.5 w-2/3 rounded-full",
                        plan.featured ? "bg-primary-foreground/75" : "bg-border",
                      )}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
