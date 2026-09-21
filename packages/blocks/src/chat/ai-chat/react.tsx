import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUp, Copy, Sparkles, ThumbsUp } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface ChatMessage {
  kind: "paragraph" | "bullet";
  text: string;
}

export const aiChatDefaultCopy: ChatMessage[] = [
  { kind: "paragraph", text: "Here's a quick snapshot of Q3:" },
  { kind: "bullet", text: "Revenue grew 24% year-over-year" },
  { kind: "bullet", text: "Enterprise tier drove 62% of new ARR" },
  { kind: "bullet", text: "Net retention reached an all-time high of 118%" },
];

type StatusKind = "online" | "busy" | "offline";

const statusDot: Record<StatusKind, string> = {
  online: "bg-emerald-500 dark:bg-emerald-400",
  busy: "bg-amber-500 dark:bg-amber-400",
  offline: "bg-muted-foreground/40",
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

const promptAnim = {
  hidden: { opacity: 0, x: 10, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.2 },
  },
} as const;

const headerAnim = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, delay: 0.5, ease: "easeOut" } },
} as const;

const WORD_START = 0.5;
const WORD_STAGGER = 0.05;
const WORD_DURATION = 0.22;
const wordDelay = (index: number) => WORD_START + Math.max(index - 1, 0) * WORD_STAGGER + WORD_DURATION;

const wordAnim: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  visible: (index: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: WORD_DURATION,
      delay: WORD_START + index * WORD_STAGGER,
      ease: "easeOut",
    },
  }),
};

const bulletAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 18,
      delay: WORD_START + index * WORD_STAGGER,
    },
  }),
};

const caretVariants = (index: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      delay: wordDelay(index) + 0.05,
      ease: "easeInOut",
    },
  },
});

const avatarAnim = {
  hidden: { scale: 0, opacity: 0, rotate: -45 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.45 },
  },
} as const;

const actionsVariants = (index: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: wordDelay(index) + 0.3, ease: "easeOut" },
  },
});

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const dotsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
} as const;

const dotAnim: Variants = {
  hidden: { opacity: 0.4 },
  visible: {
    opacity: [0.25, 1, 0.25],
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
};

export interface AiChatProps extends VisualProps {
  title?: string;
  prompt?: string;
  response?: readonly ChatMessage[];
  status?: string;
  statusKind?: StatusKind;
  caret?: boolean;
  actions?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function AiChat({
  title = "AI Assistant",
  prompt = "Summarize Q3 revenue performance.",
  response = aiChatDefaultCopy,
  status = "Ready",
  statusKind = "online",
  caret = true,
  actions = true,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: AiChatProps) {
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

  let wordIndex = 0;
  const blocks = response.map((message) => ({
    kind: message.kind,
    words: message.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, idx: wordIndex++ })),
  }));
  const totalWords = wordIndex;
  const caretVariantsFinal = caretVariants(totalWords);
  const actionsVariantsFinal = actionsVariants(totalWords);

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
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              {statusKind === "busy" ? (
                <motion.span
                  className="flex items-center gap-0.5"
                  variants={animated ? dotsAnim : undefined}
                  {...state}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1 rounded-full bg-primary"
                      variants={animated ? dotAnim : undefined}
                    />
                  ))}
                </motion.span>
              ) : (
                <span className={`size-1.5 rounded-full ${statusDot[statusKind]}`} />
              )}
              {status}
            </span>
          </div>
          <div className="flex flex-col gap-3 px-3 py-3">
            <motion.div
              className="flex justify-end will-change-transform"
              variants={animated ? promptAnim : undefined}
              {...state}
            >
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-2.5 py-1.5 text-[11px] leading-snug text-primary-foreground">
                {prompt}
              </div>
            </motion.div>
            <div className="flex flex-col gap-1.5">
              <motion.div
                className="flex items-center gap-1.5"
                variants={animated ? headerAnim : undefined}
                {...state}
              >
                <motion.div
                  className="flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  variants={animated ? avatarAnim : undefined}
                  {...state}
                >
                  <Sparkles className="size-2.5" strokeWidth={2.5} />
                </motion.div>
                <span className="text-[10px] font-semibold text-muted-foreground">Assistant</span>
              </motion.div>
              <motion.div
                className="flex flex-col gap-1.5 pl-5.5 text-[11px] leading-relaxed text-foreground"
                {...state}
              >
                {blocks.map((block, blockIndex) => {
                  const isLast = blockIndex === blocks.length - 1;
                  const firstIdx = block.words[0]?.idx ?? 0;
                  const spans = block.words.flatMap(({ word, idx }, i, words) => {
                    const span = (
                      <motion.span
                        key={idx}
                        className="inline-block"
                        variants={animated ? wordAnim : undefined}
                        custom={idx}
                      >
                        {word}
                      </motion.span>
                    );
                    return i < words.length - 1 ? [span, " "] : [span];
                  });
                  const caretEl =
                    isLast &&
                    caret && (
                      <motion.span
                        className="ml-0.5 inline-block h-2.5 w-[2px] -translate-y-px bg-primary align-middle"
                        variants={animated ? caretVariantsFinal : undefined}
                        {...state}
                      />
                    );
                  return block.kind === "bullet" ? (
                    <div key={blockIndex} className="flex items-start gap-1.5">
                      <motion.span
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-primary"
                        variants={animated ? bulletAnim : undefined}
                        custom={firstIdx}
                      />
                      <span className="flex-1">
                        {spans}
                        {caretEl}
                      </span>
                    </div>
                  ) : (
                    <p key={blockIndex}>
                      {spans}
                      {caretEl}
                    </p>
                  );
                })}
              </motion.div>
              {actions && (
                <motion.div
                  className="flex items-center gap-1 pt-1 pl-5.5"
                  variants={animated ? actionsVariantsFinal : undefined}
                  {...state}
                >
                  <button
                    type="button"
                    className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Copy className="size-2.5" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <ThumbsUp className="size-2.5" strokeWidth={2.5} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <div className="flex-1 truncate rounded-full bg-muted px-3 py-1.25 text-[10px] text-muted-foreground">
              Ask anything…
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
