import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Paperclip, Search, Star } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface InboxItem {
  initials: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  starred?: boolean;
  hasAttachment?: boolean;
}

export const inboxDefaultCopy: { title: string; items: InboxItem[] } = {
  title: "Inbox",
  items: [
    { initials: "SC", sender: "Sarah Chen", subject: "Re: Q4 roadmap review", preview: "Looks great, ready to ship Friday.", time: "9:42", unread: true },
    { initials: "AP", sender: "Alex Park", subject: "Design system v3 specs", preview: "Tokens, motion, and typography ready.", time: "9:18", unread: true, starred: true, hasAttachment: true },
    { initials: "ML", sender: "Mia Lee", subject: "Notification center merged", preview: "Tests passed, deploying to staging.", time: "8:34" },
    { initials: "BN", sender: "Ben Novak", subject: "Release notes draft", preview: "v2.4: what's new in this release.", time: "Yesterday", hasAttachment: true },
    { initials: "JL", sender: "Jordan Liu", subject: "Onboarding walkthrough", preview: "First cut of the v3 walkthrough video.", time: "Mon", starred: true },
  ],
};

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

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
} as const;

const row = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const unreadDot = {
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

const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

/** Auto-links email addresses inside a string (POC build renders them as mailto anchors). */
function EmailText({ text }: { text: string }) {
  const match = EMAIL_RE.exec(text);
  if (!match) return <>{text}</>;
  const email = match[1]!;
  const parts = text.split(email);
  return (
    <>
      {parts[0]}
      <a href={`mailto:${email}`}>{email}</a>
      {parts[1]}
    </>
  );
}

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface InboxProps extends VisualProps {
  title?: string;
  meta?: string;
  items?: InboxItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Inbox({
  title = inboxDefaultCopy.title,
  meta,
  items = inboxDefaultCopy.items,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: InboxProps) {
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

  const unreadCount = items.filter((item) => item.unread).length;

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
        className={`relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? containerIso : container) : undefined}
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
              <span className="text-xs font-semibold text-foreground">{title}</span>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                  {unreadCount}
                </span>
              )}
            </div>
            {meta ? (
              <span className="text-[10px] font-medium text-muted-foreground">
                <EmailText text={meta} />
              </span>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-1.75 py-0.5">
                <Search className="size-2.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Search</span>
              </div>
            )}
          </div>
          <motion.div
            className="flex flex-col divide-y"
            variants={animated ? list : undefined}
            {...state}
          >
            {items.map((item, i) => (
              <motion.div
                key={i}
                className={`flex items-start gap-2.5 px-3 py-2.5 ${item.unread ? `bg-muted/50` : ``}`}
                variants={animated ? row : undefined}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {item.initials}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-xs text-foreground ${item.unread ? `font-semibold` : `font-medium`}`}
                    >
                      <EmailText text={item.sender} />
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={`text-[10px] ${item.unread ? `font-semibold text-primary` : `text-muted-foreground`}`}
                      >
                        {item.time}
                      </span>
                      {item.unread && (
                        <motion.div
                          className="size-1.5 rounded-full bg-primary"
                          variants={animated ? unreadDot : undefined}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.hasAttachment && (
                      <Paperclip className="size-2.5 shrink-0 text-muted-foreground" />
                    )}
                    {item.starred && (
                      <Star className="size-2.5 shrink-0 fill-primary text-primary dark:text-primary-foreground" />
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate text-[10px] ${item.unread ? `font-medium text-foreground` : `text-muted-foreground`}`}
                    >
                      {item.subject}
                    </span>
                  </div>
                  <span className="truncate text-[10px] text-muted-foreground">{item.preview}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
