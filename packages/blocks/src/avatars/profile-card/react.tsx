import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const profileCardDefaultCopy = {
  initials: "SR",
  name: "Sara Ruiz",
  role: "Design Lead",
  tint: "bg-primary text-primary-foreground",
} as const;

const statusStyles = {
  online: {
    dot: "bg-emerald-500",
    pulse: "bg-emerald-500/40",
    label: "Online",
    pill: "text-emerald-600 dark:text-emerald-400",
  },
  away: {
    dot: "bg-amber-500",
    pulse: "bg-amber-500/40",
    label: "Away",
    pill: "text-amber-600 dark:text-amber-400",
  },
  busy: {
    dot: "bg-rose-500",
    pulse: "bg-rose-500/40",
    label: "Busy",
    pill: "text-rose-600 dark:text-rose-400",
  },
  offline: {
    dot: "bg-muted-foreground/60",
    pulse: "bg-muted-foreground/20",
    label: "Offline",
    pill: "text-muted-foreground",
  },
} as const;

const card = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const avatar = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 14, delay: 0.2 },
  },
} as const;

const statusDot = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 14, delay: 0.5 },
  },
} as const;

const pulse: Variants = {
  hidden: { scale: 1, opacity: 0 },
  visible: {
    scale: [1, 1.9, 1],
    opacity: [0.7, 0, 0.7],
    transition: { duration: 2, delay: 0.7, ease: "easeOut", repeat: Infinity },
  },
};

const identity = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.4, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export type ProfileStatus = keyof typeof statusStyles;

export interface ProfileCardProps extends VisualProps {
  initials?: string;
  image?: string;
  name?: string;
  role?: string;
  tint?: string;
  status?: ProfileStatus;
  isometric?: boolean;
  gradient?: boolean;
}

export function ProfileCard({
  initials = profileCardDefaultCopy.initials,
  image,
  name = profileCardDefaultCopy.name,
  role = profileCardDefaultCopy.role,
  tint = profileCardDefaultCopy.tint,
  status = "online",
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  className,
}: ProfileCardProps) {
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
  const style = statusStyles[status];

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
        className="relative flex w-full max-w-56 flex-col items-center gap-3"
        style={
          !animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined
        }
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-2xl bg-background/95 mask-t-from-50%"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative flex w-full flex-col items-center gap-2.5 rounded-2xl border bg-card px-4 pt-5 pb-4 shadow-xs">
          <div className="relative">
            <motion.div
              className="flex size-14 items-center justify-center rounded-full shadow-xs ring-2 ring-muted"
              variants={animated ? avatar : undefined}
              {...state}
            >
              {image ? (
                <img src={image} alt={initials} className="size-12 rounded-full object-cover" />
              ) : (
                <div
                  className={`flex size-12 items-center justify-center rounded-full text-sm font-semibold ${tint}`}
                >
                  {initials}
                </div>
              )}
            </motion.div>
            <motion.div
              className="absolute right-1 bottom-1"
              variants={animated ? statusDot : undefined}
              {...state}
            >
              <span className="relative flex">
                {status === "online" && (
                  <motion.span
                    className={`absolute inset-0 inline-flex size-2.5 rounded-full ${style.pulse}`}
                    variants={animated ? pulse : undefined}
                    {...state}
                  />
                )}
                <span
                  className={`relative inline-flex size-2.5 rounded-full ring-2 ring-card ${style.dot}`}
                />
              </span>
            </motion.div>
          </div>
          <motion.div
            className="flex flex-col items-center gap-0.5"
            variants={animated ? identity : undefined}
            {...state}
          >
            <span className="text-xs font-semibold text-foreground">{name}</span>
            <span className="text-[10px] text-muted-foreground">{role}</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5 ring-1 ring-border/60 ring-inset"
            variants={animated ? identity : undefined}
            {...state}
          >
            <span className={`inline-flex size-1.5 rounded-full ${style.dot}`} />
            <span className={`text-[10px] font-medium ${style.pill}`}>{style.label}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
