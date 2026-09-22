import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { GitPullRequest, Heart, MessageCircle, Star, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const listDefaultCopy = {
  items: [
    { icon: "message", title: "Sarah commented", detail: "Looks great, ready to ship.", time: "2m", unread: true },
    { icon: "pr", title: "Alex opened a PR", detail: "feat: add notification center", time: "18m", unread: true },
    { icon: "heart", title: "Mia liked your post", detail: "Building in public update #12", time: "1h" },
    { icon: "follow", title: "Ben started following you", detail: "Design engineer, Berlin", time: "3h" },
    { icon: "star", title: "New star on your repo", detail: "cremona · 1.2k stars", time: "1d" },
  ],
} as const;

type IconKind = "message" | "heart" | "follow" | "pr" | "star";

export interface ListItem {
  icon: IconKind;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
}

const iconStyles: Record<IconKind, { icon: LucideIcon; accent: string }> = {
  message: {
    icon: MessageCircle,
    accent: "bg-sky-50 border border-sky-500/15 text-sky-600 dark:text-sky-400 dark:bg-sky-950/30",
  },
  heart: {
    icon: Heart,
    accent: "bg-rose-50 border border-rose-500/15 text-rose-600 dark:text-rose-400 dark:bg-rose-950/30",
  },
  follow: {
    icon: UserPlus,
    accent:
      "bg-emerald-50 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/30",
  },
  pr: {
    icon: GitPullRequest,
    accent:
      "bg-violet-50 border border-violet-500/15 text-violet-600 dark:text-violet-400 dark:bg-violet-950/30",
  },
  star: {
    icon: Star,
    accent:
      "bg-amber-50 border border-amber-500/15 text-amber-600 dark:text-amber-400 dark:bg-amber-950/30",
  },
};

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

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const dot = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface ListProps extends VisualProps {
  items?: ListItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function NotificationList({
  items = listDefaultCopy.items as unknown as ListItem[],
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ListProps) {
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
  const unread = items.filter((i) => i.unread).length;

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
        className={`relative w-full${fill ? "" : " max-w-80"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
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
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {unread > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                  {unread}
                </span>
              )}
            </div>
            <button
              type="button"
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              Mark all read
            </button>
          </div>
          <motion.div className="flex flex-col" variants={animated ? list : undefined} {...state}>
            {items.map((n, i) => {
              const { icon: Icon, accent } = iconStyles[n.icon];
              return (
                <motion.div
                  key={i}
                  className={`flex items-start gap-2.5 px-3 py-2.5 ${i === items.length - 1 ? `` : `border-b`} ${n.unread ? `bg-muted/30` : ``}`}
                  variants={animated ? item : undefined}
                >
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${accent}`}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-foreground">{n.title}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">{n.detail}</span>
                  </div>
                  {n.unread && (
                    <motion.div
                      className="mt-1 size-1.5 shrink-0 rounded-full bg-primary"
                      variants={animated ? dot : undefined}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
