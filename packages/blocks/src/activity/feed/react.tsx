import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { GitCommitHorizontal, Rocket, GitMerge, FileText, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type FeedAction = "commit" | "deploy" | "merge" | "publish" | "review";

export interface FeedItem {
  user: string;
  initials: string;
  action: FeedAction;
  title: string;
  detail: string;
  time: string;
}

const actionStyles: Record<FeedAction, { icon: LucideIcon; accent: string }> = {
  commit: {
    icon: GitCommitHorizontal,
    accent: "bg-sky-50 border-sky-500/20 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  },
  deploy: {
    icon: Rocket,
    accent: "bg-violet-50 border-violet-500/20 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  },
  merge: {
    icon: GitMerge,
    accent: "bg-emerald-50 border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  publish: {
    icon: FileText,
    accent: "bg-amber-50 border-amber-500/20 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  review: {
    icon: CircleCheck,
    accent: "bg-rose-50 border-rose-500/20 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  },
};

export const feedDefaultItems: FeedItem[] = [
  { user: "Sarah Chen", initials: "SC", action: "commit", title: "pushed to main", detail: "3 commits · src/api/auth.ts", time: "2m" },
  { user: "Alex Park", initials: "AP", action: "deploy", title: "deployed v2.4.1", detail: "production · 1m 42s", time: "18m" },
  { user: "Mia Lee", initials: "ML", action: "merge", title: "merged PR #142", detail: "feat: notification center", time: "1h" },
  { user: "Ben Novak", initials: "BN", action: "publish", title: "published release notes", detail: "v2.4 · what's new", time: "3h" },
  { user: "Jordan Liu", initials: "JL", action: "review", title: "approved design specs", detail: "Onboarding redesign · v3", time: "6h" },
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

const listAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 14 },
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

export interface FeedProps extends VisualProps {
  title?: string;
  meta?: string;
  items?: readonly FeedItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Feed({
  title = "Activity",
  meta = "Today",
  items = feedDefaultItems,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: FeedProps) {
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
        className={cn(
          "relative w-full", !fill && "max-w-80", "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {meta && (
              <span className="text-[10px] font-medium text-muted-foreground">{meta}</span>
            )}
          </div>
          <motion.div
            className="flex flex-col"
            variants={animated ? listAnim : undefined}
            {...state}
          >
            {items.map((item, i) => {
              const { icon: Icon, accent } = actionStyles[item.action];
              return (
                <motion.div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 px-3 py-2.5",
                    i === items.length - 1 ? "" : "border-b",
                  )}
                  variants={animated ? itemAnim : undefined}
                >
                  <div className="relative shrink-0">
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                      {item.initials}
                    </div>
                    <motion.div
                      className={cn(
                        "absolute -right-1 -bottom-1 flex size-3 items-center justify-center rounded-full border ring-2 ring-card",
                        accent,
                      )}
                      variants={animated ? badgeAnim : undefined}
                    >
                      <Icon className="size-2" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-foreground">
                        <span className="font-semibold">{item.user}</span>{" "}
                        <span className="text-muted-foreground">{item.title}</span>
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">{item.detail}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
