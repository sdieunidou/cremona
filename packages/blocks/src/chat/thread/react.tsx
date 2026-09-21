import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUp, Heart, MessageCircle, Share2 } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface ThreadReply {
  user: string;
  initials: string;
  text: string;
  time: string;
}

export const threadDefaultCopy: ThreadReply[] = [
  { user: "Sarah Chen", initials: "SC", text: "Massive. The progress indicator was the move.", time: "10:31" },
  { user: "Mia Lee", initials: "ML", text: "Can we A/B test the welcome step next?", time: "10:42" },
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

const parentAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.2, ease: "easeOut" } },
} as const;

const repliesAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.55 } },
} as const;

const replyAnim = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const lineAnim = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface ThreadProps extends VisualProps {
  parentUser?: string;
  parentInitials?: string;
  parentTime?: string;
  parentText?: string;
  replies?: readonly ThreadReply[];
  likes?: number;
  actions?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Thread({
  parentUser = "Alex Park",
  parentInitials = "AP",
  parentTime = "10:24 AM",
  parentText = "Just shipped the new onboarding flow. Conversion is already up 18%.",
  replies = threadDefaultCopy,
  likes = 24,
  actions = true,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: ThreadProps) {
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
        className={`relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
          <motion.div
            className="flex flex-col gap-2 border-b px-3 py-3"
            variants={animated ? parentAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {parentInitials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-semibold text-foreground">{parentUser}</span>
                <span className="text-[10px] text-muted-foreground">{parentTime}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground">{parentText}</p>
            {actions && (
              <div className="flex items-center gap-3 pt-0.5 text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] hover:text-foreground"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <MessageCircle className="size-3" strokeWidth={2.25} />
                  {replies.length}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] hover:text-foreground"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Heart className="size-3" strokeWidth={2.25} />
                  {likes}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] hover:text-foreground"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Share2 className="size-3" strokeWidth={2.25} />
                </button>
              </div>
            )}
          </motion.div>
          <motion.div
            className="relative flex flex-col px-3 py-2.5"
            variants={animated ? repliesAnim : undefined}
            {...state}
          >
            <motion.div
              className="absolute top-2.5 bottom-2.5 left-6 w-px origin-top bg-border"
              variants={animated ? lineAnim : undefined}
              {...state}
            />
            {replies.map((reply, i) => (
              <motion.div
                key={i}
                className={`relative flex items-start gap-2.5 ${i === replies.length - 1 ? "" : "pb-2.5"}`}
                variants={animated ? replyAnim : undefined}
              >
                <div className="relative z-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-2 ring-card">
                  {reply.initials}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-xl border bg-muted/40 px-2.5 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-semibold text-foreground">
                      {reply.user}
                    </span>
                    <span className="shrink-0 text-[9px] text-muted-foreground">{reply.time}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-foreground">{reply.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <div className="flex-1 truncate rounded-full bg-muted px-3 py-1.25 text-[10px] text-muted-foreground">
              Write a reply…
            </div>
            <button
              type="button"
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ArrowUp className="size-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
