import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, FingerprintPattern, X } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface FingerprintProps extends VisualProps {
  state?: "success" | "scanning" | "error";
  status?: string;
  isometric?: boolean;
}

const statusLabels = { success: "Verified", scanning: "Scanning…", error: "Denied" } as const;

const stateStyles = {
  success: {
    glow: "bg-primary/40",
    ring: "stroke-primary",
    icon: "text-primary",
    beam: "bg-linear-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_var(--color-primary)]",
    badge: "bg-primary text-primary-foreground",
    pill: "bg-primary/10 dark:bg-primary/15 border-primary/20 text-primary",
    dot: "bg-primary shadow-[0_0_6px_var(--color-primary)]",
  },
  scanning: {
    glow: "bg-primary/40",
    ring: "stroke-primary",
    icon: "text-primary",
    beam: "bg-linear-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_var(--color-primary)]",
    badge: "bg-primary text-primary-foreground",
    pill: "bg-primary/10 dark:bg-primary/15 border-primary/20 text-primary",
    dot: "bg-primary shadow-[0_0_6px_var(--color-primary)]",
  },
  error: {
    glow: "bg-destructive/30",
    ring: "stroke-destructive",
    icon: "text-destructive",
    beam: "bg-linear-to-r from-transparent via-destructive to-transparent shadow-[0_0_8px_var(--color-destructive)]",
    badge: "bg-destructive text-background",
    pill: "bg-destructive/10 border-destructive/20 text-destructive",
    dot: "bg-destructive shadow-[0_0_6px_var(--color-destructive)]",
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

const iconAnim = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.3, ease: "easeOut" },
  },
} as const;

const ringDrawAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.4, delay: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.2, delay: 0.5 },
    },
  },
} as const;

const ringScanAnim = {
  hidden: { pathLength: 0, opacity: 0, rotate: 0 },
  visible: {
    pathLength: 0.25,
    opacity: 1,
    rotate: 360,
    transition: {
      pathLength: { duration: 0.4, delay: 0.5, ease: "easeOut" },
      opacity: { duration: 0.2, delay: 0.5 },
      rotate: { duration: 1.6, delay: 0.5, ease: "linear", repeat: 1 / 0 },
    },
  },
} as const;

const beamOnceAnim: Variants = {
  hidden: { y: -22, opacity: 0 },
  visible: {
    y: [-22, 22, -22],
    opacity: [0, 0.9, 0],
    transition: {
      duration: 1.4,
      delay: 0.5,
      ease: "easeInOut",
      times: [0, 0.5, 1],
    },
  },
};

const beamLoopAnim: Variants = {
  hidden: { y: -22, opacity: 0 },
  visible: {
    y: [-22, 22, -22],
    opacity: [0, 0.9, 0],
    transition: {
      duration: 1.6,
      delay: 0.5,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: 1 / 0,
    },
  },
};

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 1.95 },
  },
} as const;

const statusDoneAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 2.05, ease: "easeOut" },
  },
} as const;

const statusScanningAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.6, ease: "easeOut" },
  },
} as const;

export function Fingerprint({
  state = "success",
  status,
  animated = false,
  trigger = "inView",
  isometric = false,
  className,
}: FingerprintProps) {
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
  const failed = state === "error";
  const scanning = state === "scanning";
  const statusText = status ?? statusLabels[state];
  const styles = stateStyles[state];

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
        className="relative flex size-64 flex-col items-center justify-center gap-4"
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
          <svg className="absolute size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className="stroke-card/50 dark:stroke-card/80"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={styles.ring}
              strokeWidth="2"
              strokeLinecap="round"
              variants={animated ? (scanning ? ringScanAnim : ringDrawAnim) : undefined}
              style={animated ? undefined : { pathLength: scanning ? 0.25 : 1 }}
            />
          </svg>
          <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border bg-card/75">
            <motion.div variants={animated ? iconAnim : undefined} {...motionState}>
              <FingerprintPattern className={cn("size-12", styles.icon)} strokeWidth={1.5} />
            </motion.div>
            {animated && (
              <motion.div
                className={cn("absolute inset-x-2 h-px", styles.beam)}
                variants={scanning ? beamLoopAnim : beamOnceAnim}
              />
            )}
          </div>
          {!scanning && (
            <motion.div
              className={cn(
                "absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full shadow-md ring-2 ring-background",
                styles.badge,
              )}
              variants={animated ? badgeAnim : undefined}
              {...motionState}
            >
              {failed ? (
                <X className="size-4" strokeWidth={2.5} />
              ) : (
                <Check className="size-4" />
              )}
            </motion.div>
          )}
        </motion.div>
        {statusText && (
          <motion.div
            className={cn(
              "relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-xs",
              styles.pill,
            )}
            variants={animated ? (scanning ? statusScanningAnim : statusDoneAnim) : undefined}
            {...motionState}
          >
            <motion.span
              className={cn("size-1.5 rounded-full", styles.dot)}
              animate={animated && scanning ? { opacity: [1, 0.3, 1] } : undefined}
              transition={
                animated && scanning
                  ? { duration: 1.2, repeat: 1 / 0, ease: "easeInOut" }
                  : undefined
              }
            />
            {statusText}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
