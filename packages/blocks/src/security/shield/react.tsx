import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Eye,
  FingerprintPattern,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ShieldProps extends VisualProps {
  state?: "secure" | "warning" | "breached";
  label?: string;
  isometric?: boolean;
}

const stateLabels = { secure: "Protected", warning: "Vulnerable", breached: "Compromised" } as const;

const stateIcons = {
  secure: ShieldCheck,
  warning: ShieldAlert,
  breached: ShieldOff,
} as const;

const stateStyles = {
  secure: {
    glow: "bg-primary/40",
    icon: "text-primary",
    outerConnector: "border-primary/25 dark:border-primary/50",
    innerConnector: "border-primary/20 dark:border-primary/40",
    pill: "border-primary/20 bg-primary/15 text-primary",
  },
  warning: {
    glow: "bg-amber-500/40",
    icon: "text-amber-500",
    outerConnector: "border-amber-500/30",
    innerConnector: "border-amber-500/25",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  breached: {
    glow: "bg-destructive/40",
    icon: "text-destructive",
    outerConnector: "border-destructive/30",
    innerConnector: "border-destructive/25",
    pill: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const;

const connectors = [
  {
    icon: Lock,
    className: "top-2 left-1/2 -translate-x-1/2",
    fromX: 0,
    fromY: 72,
    delay: 0.55,
  },
  {
    icon: KeyRound,
    className: "top-1/2 right-2 -translate-y-1/2",
    fromX: -72,
    fromY: 0,
    delay: 0.7,
  },
  {
    icon: Eye,
    className: "bottom-2 left-1/2 -translate-x-1/2",
    fromX: 0,
    fromY: -72,
    delay: 0.85,
  },
  {
    icon: FingerprintPattern,
    className: "top-1/2 left-2 -translate-y-1/2",
    fromX: 72,
    fromY: 0,
    delay: 1,
  },
] as const;

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

const connectorAnim = (delay: number, fromX: number, fromY: number) => ({
  hidden: { scale: 0.4, opacity: 0, x: fromX, y: fromY },
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay },
  },
}) as const;

const outerRingAnim = {
  hidden: { opacity: 0, scale: 1.08, rotate: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 360,
    transition: {
      opacity: { duration: 0.5, delay: 1.25, ease: "easeOut" },
      scale: { duration: 0.5, delay: 1.25, ease: "easeOut" },
      rotate: { duration: 30, delay: 1.25, ease: "linear", repeat: 1 / 0 },
    },
  },
} as const;

const innerRingAnim = {
  hidden: { opacity: 0, scale: 0.92, rotate: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: -360,
    transition: {
      opacity: { duration: 0.5, delay: 1.35, ease: "easeOut" },
      scale: { duration: 0.5, delay: 1.35, ease: "easeOut" },
      rotate: { duration: 30, delay: 1.35, ease: "linear", repeat: 1 / 0 },
    },
  },
} as const;

const pillAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 1.5, ease: "easeOut" },
  },
} as const;

export function Shield({
  state = "secure",
  label,
  animated = false,
  trigger = "inView",
  isometric = false,
  fill = false,
  className,
}: ShieldProps) {
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
  const styles = stateStyles[state];
  const labelText = label ?? stateLabels[state];
  const ShieldIcon = stateIcons[state];

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
        className="relative flex size-64 flex-col items-center justify-center gap-4"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? stageIso : stageAnim) : undefined}
        {...motionState}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] mask-[radial-gradient(ellipse_35%_35%_at_50%_50%,#000_60%,transparent_100%)] bg-size-[36px_36px] will-change-transform" />
        <div className="relative flex size-48 items-center justify-center">
          <motion.div
            className={cn(
              "pointer-events-none absolute size-39 rounded-full border border-dashed",
              styles.outerConnector,
            )}
            variants={animated ? outerRingAnim : undefined}
            style={animated ? undefined : { opacity: 1 }}
            {...motionState}
          />
          <motion.div
            className={cn(
              "pointer-events-none absolute size-37 rounded-full border border-dashed",
              styles.innerConnector,
            )}
            variants={animated ? innerRingAnim : undefined}
            style={animated ? undefined : { opacity: 1 }}
            {...motionState}
          />
          {connectors.map((connector, i) => {
            const Icon = connector.icon;
            return (
              <div key={i} className={cn("absolute", connector.className)}>
                <motion.div
                  className="flex size-8 items-center justify-center rounded-full border bg-card text-foreground shadow-xs ring-2 ring-background"
                  variants={
                    animated ? connectorAnim(connector.delay, connector.fromX, connector.fromY) : undefined
                  }
                  {...motionState}
                >
                  <Icon className="size-4" strokeWidth={2.25} />
                </motion.div>
              </div>
            );
          })}
          <motion.div
            className="relative flex size-28 items-center justify-center"
            variants={animated ? scannerAnim : undefined}
            {...motionState}
          >
            <div className={cn("pointer-events-none absolute size-20 rounded-full blur-2xl", styles.glow)} />
            <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border bg-card/75">
              <motion.div variants={animated ? iconAnim : undefined} {...motionState}>
                <ShieldIcon className={cn("size-9", styles.icon)} strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>
        {labelText && (
          <motion.div
            className={cn(
              "relative rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-xs",
              styles.pill,
            )}
            variants={animated ? pillAnim : undefined}
            {...motionState}
          >
            {labelText}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
