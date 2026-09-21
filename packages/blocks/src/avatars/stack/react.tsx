import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const stackDefaultCopy: { avatars: StackAvatar[]; status: StackStatus } = {
  avatars: [
    { initials: "JC", tint: "bg-sky-200/80 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300" },
    { initials: "AM", tint: "bg-rose-200/80 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300" },
    { initials: "KL", tint: "bg-emerald-200/80 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300" },
    { initials: "DP", tint: "bg-violet-200/80 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300" },
    { initials: "SR", tint: "bg-amber-200/80 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" },
  ],
  status: { count: 1284, label: "members online" },
};

const MAX_VISIBLE = 8;

const dotStyles = {
  online: { dot: "bg-emerald-500", ring: "ring-emerald-500/20" },
  away: { dot: "bg-amber-500", ring: "ring-amber-500/20" },
  busy: { dot: "bg-rose-500", ring: "ring-rose-500/20" },
} as const;

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

const stack = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;

const avatar = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 16 },
  },
} as const;

const badge = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.7, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 1.1, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 1.1, ease: "easeOut" } },
} as const;

export interface StackAvatar {
  initials: string;
  image?: string;
  tint?: string;
}

export interface StackStatus {
  count: number;
  label: string;
  dot?: "online" | "away" | "busy" | false;
}export interface StackProps extends VisualProps {
  avatars?: StackAvatar[];
  status?: StackStatus | false;
  isometric?: boolean;
  gradient?: boolean;
}

export function Stack({
  avatars = stackDefaultCopy.avatars,
  status = stackDefaultCopy.status,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  className,
}: StackProps) {
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
  const visible = avatars.slice(0, MAX_VISIBLE);
  const dot =
    status && status.dot !== false ? (status.dot ?? "online") : null;
  const dotStyle = dot ? dotStyles[dot] : null;

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
        className="relative flex flex-col items-center gap-3"
        style={
          !animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined
        }
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        <motion.div
          className="relative flex items-center will-change-transform"
          variants={animated ? stack : undefined}
          {...state}
        >
          {visible.map((entry, i) => (
            <motion.div
              key={i}
              className={i > 0 ? "-ml-3" : ""}
              style={{ zIndex: visible.length - i }}
              variants={animated ? avatar : undefined}
            >
              {entry.image ? (
                <img
                  src={entry.image}
                  alt={entry.initials}
                  className="size-10 rounded-full object-cover ring-2 ring-background"
                />
              ) : (
                <div
                  className={`flex size-10 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-background ${entry.tint ?? ""}`}
                >
                  {entry.initials}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        {status && (
          <div className="relative mt-1">
            {gradient && (
              <>
                <motion.div
                  className="absolute inset-x-1 bottom-0 h-3 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                  variants={animated ? glow : undefined}
                  {...state}
                />
                <motion.div
                  className="absolute -inset-x-0.5 -bottom-0.5 h-6 rounded-b-xl bg-background/95 mask-t-from-50%"
                  variants={animated ? veil : undefined}
                  {...state}
                />
              </>
            )}
            <motion.div
              className="relative flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-xs"
              variants={animated ? badge : undefined}
              {...state}
            >
              {dotStyle && (
                <span
                  className={`inline-flex size-1.5 rounded-full ring-2 ${dotStyle.dot} ${dotStyle.ring}`}
                />
              )}
              {!!status.count && (
                <span className="text-foreground tabular-nums">
                  {status.count.toLocaleString("en-US")}
                </span>
              )}
              <span>{status.label}</span>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
