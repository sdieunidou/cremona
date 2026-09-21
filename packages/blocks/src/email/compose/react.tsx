import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Image, Paperclip, Smile, X } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface ComposeRecipient {
  initials: string;
  email: string;
}

export const composeDefaultCopy: {
  title: string;
  subject: string;
  sendLabel: string;
  to: ComposeRecipient[];
} = {
  title: "New message",
  subject: "Q4 roadmap review",
  sendLabel: "Send",
  to: [{ initials: "SC", email: "sarah@example.dev" }],
};

const LINE_WIDTHS = ["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-3/5", "w-2/5"];
const LINE_BASE = 0.25;
const LINE_STEP = 0.08;
const LINE_DURATION = 0.3;

function Recipient({ recipient }: { recipient: ComposeRecipient }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted px-1 py-0.5">
      <div className="flex size-3.5 items-center justify-center rounded-full bg-background text-[7px] font-semibold text-muted-foreground">
        {recipient.initials}
      </div>
      <span className="text-[9px] font-medium text-foreground">
        <a href={`mailto:${recipient.email}`}>{recipient.email}</a>
      </span>
      <button
        type="button"
        aria-label={`Remove ${recipient.email}`}
        className="flex items-center text-muted-foreground"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
      >
        <X className="size-2.75" />
      </button>
    </div>
  );
}

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

const body = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
} as const;

const row = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const caret: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [1, 0, 1],
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
  },
};

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const line = (i: number, hasCc: boolean): Variants => {
  const delay = LINE_BASE + (3 + Number(!!hasCc) - 1) * LINE_STEP + 0.25 + i * 0.06;
  return {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: LINE_DURATION, delay, ease: "easeOut" },
    },
  };
};

const sendButton = (hasCc: boolean): Variants => {
  const delay =
    LINE_BASE +
    (3 + Number(!!hasCc) - 1) * LINE_STEP +
    0.25 +
    (LINE_WIDTHS.length - 1) * 0.06 +
    LINE_DURATION +
    0.05;
  return {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 420, damping: 16, delay },
    },
  };
};

export interface ComposeProps extends VisualProps {
  title?: string;
  meta?: string;
  to?: ComposeRecipient[];
  cc?: ComposeRecipient[];
  subject?: string;
  sendLabel?: string;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Compose({
  title = composeDefaultCopy.title,
  meta,
  to = composeDefaultCopy.to,
  cc,
  subject = composeDefaultCopy.subject,
  sendLabel = composeDefaultCopy.sendLabel,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: ComposeProps) {
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

  const hasCc = !!cc && cc.length > 0;
  const lineVariants = animated
    ? LINE_WIDTHS.map((_, i) => line(i, hasCc))
    : LINE_WIDTHS.map(() => undefined);
  const sendVariants = animated ? sendButton(hasCc) : undefined;

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
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2.75">
            <span className="truncate text-xs font-semibold text-foreground">{title}</span>
            <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
              {meta && (
                <span className="text-[10px] font-medium text-muted-foreground">{meta}</span>
              )}
              <X className="size-3.5" />
            </div>
          </div>
          <motion.div
            className="flex flex-col"
            variants={animated ? body : undefined}
            {...state}
          >
            <motion.div
              className="flex items-center gap-2 border-b px-3 py-2"
              variants={animated ? row : undefined}
            >
              <span className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">To</span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                {to.map((recipient, i) => (
                  <Recipient key={i} recipient={recipient} />
                ))}
              </div>
            </motion.div>
            {hasCc && (
              <motion.div
                className="flex items-center gap-2 border-b px-3 py-2"
                variants={animated ? row : undefined}
              >
                <span className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">Cc</span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                  {cc!.map((recipient, i) => (
                    <Recipient key={i} recipient={recipient} />
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div
              className="flex items-center gap-2 border-b px-3 py-2"
              variants={animated ? row : undefined}
            >
              <span className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">
                Subject
              </span>
              <span className="truncate text-[11px] font-medium text-foreground">{subject}</span>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 border-b px-3 py-3"
              variants={animated ? row : undefined}
            >
              {LINE_WIDTHS.map((width, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={lineVariants[i]}
                  className={`h-1 origin-left rounded-full bg-muted-foreground/20 ${width}`}
                />
              ))}
              <div className="mt-1 flex items-center gap-1">
                <div className="h-1 w-8 rounded-full bg-muted-foreground/20" />
                <motion.div
                  className="h-2 w-px bg-foreground"
                  variants={animated ? caret : undefined}
                  animate={animated ? "visible" : undefined}
                />
              </div>
            </motion.div>
          </motion.div>
          <div className="flex items-center justify-between px-3 py-2">
            <motion.button
              type="button"
              className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground"
              variants={sendVariants}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              {sendLabel}
            </motion.button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Paperclip className="size-3.5" />
              <Image className="size-3.5" />
              <Smile className="size-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
