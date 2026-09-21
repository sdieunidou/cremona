import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUp, Check, CheckCheck } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface ChatBubble {
  from: "me" | "them";
  text: string;
  time?: string;
  receipt?: "sent" | "delivered" | "read";
}

export const bubblesDefaultCopy: ChatBubble[] = [
  { from: "them", text: "Hey! Just pushed the new design changes.", time: "10:24" },
  { from: "me", text: "Looks great, loving the gradient.", time: "10:25", receipt: "read" },
  { from: "them", text: "Thanks! When can we ship?", time: "10:26" },
  { from: "me", text: "Tomorrow morning works for me.", time: "10:27", receipt: "read" },
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

const threadAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
} as const;

const fromThemAnim = {
  hidden: { opacity: 0, x: -10, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
} as const;

const fromMeAnim = {
  hidden: { opacity: 0, x: 10, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
} as const;

const presenceAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.3 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const typingDotsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
} as const;

const typingDotAnim: Variants = {
  hidden: { opacity: 0.4 },
  visible: {
    opacity: [0.25, 1, 0.25],
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
};

export interface BubblesProps extends VisualProps {
  name?: string;
  status?: string;
  initials?: string;
  messages?: readonly ChatBubble[];
  typing?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Bubbles({
  name = "Sarah Chen",
  status = "Online",
  initials = "SC",
  messages = bubblesDefaultCopy,
  typing = false,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: BubblesProps) {
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
          <div className="flex items-center gap-2.5 border-b px-3 py-2.5">
            <div className="relative">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {initials}
              </div>
              <motion.div
                className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card"
                variants={animated ? presenceAnim : undefined}
                {...state}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-semibold text-foreground">{name}</span>
              <span className="text-[10px] text-muted-foreground">{status}</span>
            </div>
          </div>
          <motion.div
            className="flex flex-col gap-2 px-3 py-3"
            variants={animated ? threadAnim : undefined}
            {...state}
          >
            {messages.map((message, i) => {
              const mine = message.from === "me";
              return (
                <motion.div
                  key={i}
                  className={`flex flex-col gap-0.5 will-change-transform ${mine ? "items-end" : "items-start"}`}
                  variants={animated ? (mine ? fromMeAnim : fromThemAnim) : undefined}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border bg-muted text-foreground"}`}
                  >
                    {message.text}
                  </div>
                  {(message.time || (mine && message.receipt)) && (
                    <span className="flex items-center gap-0.5 px-1 text-[9px] text-muted-foreground">
                      {message.time}
                      {mine && message.receipt === "sent" && (
                        <Check className="size-2.5" strokeWidth={3} />
                      )}
                      {mine && message.receipt === "delivered" && (
                        <CheckCheck className="size-2.5" strokeWidth={3} />
                      )}
                      {mine && message.receipt === "read" && (
                        <CheckCheck className="size-2.5 text-primary" strokeWidth={3} />
                      )}
                    </span>
                  )}
                </motion.div>
              );
            })}
            {typing && (
              <motion.div
                className="flex items-start will-change-transform"
                variants={animated ? fromThemAnim : undefined}
              >
                <motion.div
                  className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-muted px-2.5 py-2"
                  variants={animated ? typingDotsAnim : undefined}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground/60"
                      variants={animated ? typingDotAnim : undefined}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <div className="flex-1 truncate rounded-full bg-muted px-3 py-1.25 text-[10px] text-muted-foreground">
              Type a message…
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
