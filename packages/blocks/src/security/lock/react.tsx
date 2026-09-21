import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Lock as LockIcon, LockOpen } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface LockProps extends VisualProps {
  state?: "locked" | "unlocked" | "error";
  label?: string;
  digits?: number;
  isometric?: boolean;
}

const stateLabels = { locked: "Encrypted", unlocked: "Unlocked", error: "Invalid PIN" } as const;

const stateStyles = {
  locked: {
    glow: "bg-primary/40",
    icon: "text-primary",
    dot: "bg-foreground",
    pill: "bg-primary/10 dark:bg-primary/15 border-primary/20 text-primary",
    pillDot: "bg-primary shadow-[0_0_6px_var(--color-primary)]",
  },
  unlocked: {
    glow: "bg-primary/50",
    icon: "text-primary",
    dot: "bg-primary",
    pill: "bg-primary/10 dark:bg-primary/15 border-primary/20 text-primary",
    pillDot: "bg-primary shadow-[0_0_6px_var(--color-primary)]",
  },
  error: {
    glow: "bg-destructive/40",
    icon: "text-destructive",
    dot: "bg-destructive",
    pill: "bg-destructive/10 border-destructive/20 text-destructive",
    pillDot: "bg-destructive shadow-[0_0_6px_var(--color-destructive)]",
  },
} as const;

const stageAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const stageIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const scannerAnim = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 18, delay: 0.1 },
  },
} as const;

const iconPopAnim = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.3, ease: "easeOut" },
  },
} as const;

const iconUnlockAnim = {
  hidden: { opacity: 0, scale: 0.85, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 280, damping: 16, delay: 0.3 },
  },
} as const;

const shakeLockedAnim: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: [0, -3, 3, -2, 2, 0],
    transition: { duration: 0.5, delay: 1.4, ease: "easeInOut" },
  },
};

const shakeErrorAnim: Variants = {
  hidden: { rotate: 0, x: 0 },
  visible: {
    rotate: [0, -6, 6, -5, 5, -3, 3, 0],
    x: [0, -3, 3, -2, 2, -1, 1, 0],
    transition: { duration: 0.55, delay: 1.4, ease: "easeInOut" },
  },
};

const dotsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.55 } },
} as const;

const dotAnim = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

const pillAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 1.65, ease: "easeOut" },
  },
} as const;

export function Lock({
  state = "locked",
  label,
  digits = 6,
  animated = false,
  trigger = "inView",
  isometric = false,
  className,
}: LockProps) {
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
  const unlocked = state === "unlocked";
  const failed = state === "error";
  const styles = stateStyles[state];
  const labelText = label ?? stateLabels[state];
  const dots = Array.from({ length: Math.max(3, Math.min(digits, 10)) });
  const shakeVariant = failed ? shakeErrorAnim : unlocked ? undefined : shakeLockedAnim;
  const iconVariant = unlocked ? iconUnlockAnim : iconPopAnim;
  const Icon = unlocked ? LockOpen : LockIcon;

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
        className="relative flex size-52 flex-col items-center justify-center gap-4"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? stageIso : stageAnim) : undefined}
        {...motionState}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] mask-[radial-gradient(ellipse_35%_35%_at_50%_50%,#000_60%,transparent_100%)] bg-size-[36px_36px] will-change-transform" />
        <motion.div
          className="relative flex size-28 items-center justify-center"
          variants={animated ? scannerAnim : undefined}
          {...motionState}
        >
          <div className={cn("pointer-events-none absolute size-20 rounded-full blur-2xl", styles.glow)} />
          <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border bg-card/75">
            <motion.div variants={animated ? iconVariant : undefined} {...motionState}>
              <motion.div className={styles.icon} variants={animated ? shakeVariant : undefined} {...motionState}>
                <Icon className="size-9" strokeWidth={1.75} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          className="z-1 -mt-5 flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 shadow-xs"
          variants={animated ? dotsAnim : undefined}
          {...motionState}
        >
          {dots.map((_, i) => (
            <motion.span
              key={i}
              className={cn("size-2 rounded-full", styles.dot)}
              variants={animated ? dotAnim : undefined}
            />
          ))}
        </motion.div>
        {labelText && (
          <motion.div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-xs",
              styles.pill,
            )}
            variants={animated ? pillAnim : undefined}
            {...motionState}
          >
            <span className={cn("size-1.5 rounded-full", styles.pillDot)} />
            {labelText}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
