import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUp, ChevronDown, FileText, Paperclip, X } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const promptBoxDefaultCopy = {
  prompt: "Summarize the key wins from the Q3 report and suggest improvements for next quarter",
  model: "Claude Opus",
  tokens: "1,240",
  attachments: ["Q3-report.pdf"],
} as const;

const WORD_DELAY_BASE = 0.4;
const WORD_DELAY_UNIT = 0.05;
const WORD_DURATION = 0.22;
const WORDS_END = (index: number) =>
  WORD_DELAY_BASE + Math.max(index - 1, 0) * WORD_DELAY_UNIT + WORD_DURATION;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

const PARTICLES: Particle[] = [
  { x: 12.4, y: 28.6, size: 3, color: "bg-primary", duration: 4.82, delay: -5.22, driftX: 4.87, driftY: 14.97, opacity: 0.6 },
  { x: 88.7, y: 34.1, size: 3, color: "bg-chart-1", duration: 6.16, delay: -2.68, driftX: -3.11, driftY: 12.52, opacity: 0.63 },
  { x: 22.1, y: 70.3, size: 2, color: "bg-chart-2", duration: 6.41, delay: -1.19, driftX: -2.04, driftY: 16.24, opacity: 0.48 },
  { x: 80.6, y: 64.2, size: 3, color: "bg-chart-3", duration: 4.09, delay: -3.47, driftX: 5.93, driftY: 13.39, opacity: 0.65 },
  { x: 6.8, y: 52.5, size: 2, color: "bg-chart-4", duration: 4.41, delay: -5.43, driftX: 6.64, driftY: 15.95, opacity: 0.55 },
  { x: 93.2, y: 56.4, size: 3, color: "bg-primary", duration: 4.22, delay: -1.23, driftX: -3.05, driftY: 14.75, opacity: 0.45 },
  { x: 16.3, y: 18.2, size: 2, color: "bg-chart-1", duration: 4.72, delay: -5.81, driftX: 4.22, driftY: 9.62, opacity: 0.5 },
  { x: 74.5, y: 22.7, size: 3, color: "bg-chart-4", duration: 7.66, delay: -5.45, driftX: 6.82, driftY: 13.1, opacity: 0.57 },
  { x: 30.6, y: 80.6, size: 3, color: "bg-primary", duration: 5.43, delay: -2.72, driftX: -2.28, driftY: 10, opacity: 0.62 },
  { x: 67.4, y: 78.3, size: 2, color: "bg-chart-3", duration: 4.75, delay: -1.01, driftX: 5.27, driftY: 8.7, opacity: 0.5 },
  { x: 4.9, y: 38.4, size: 3, color: "bg-primary", duration: 4.94, delay: -5.65, driftX: 4.64, driftY: 13.44, opacity: 0.46 },
  { x: 95.3, y: 44.8, size: 2, color: "bg-chart-2", duration: 4.69, delay: -2.39, driftX: -3.07, driftY: 15.9, opacity: 0.52 },
  { x: 48.5, y: 12.6, size: 3, color: "bg-chart-4", duration: 6.13, delay: -5.07, driftX: -2.6, driftY: 9.3, opacity: 0.5 },
  { x: 55.2, y: 88.1, size: 2, color: "bg-primary", duration: 6.39, delay: -5.57, driftX: 1.33, driftY: 9.13, opacity: 0.55 },
  { x: 38.8, y: 84.9, size: 3, color: "bg-chart-1", duration: 7.31, delay: -5.08, driftX: -4.42, driftY: 14.91, opacity: 0.5 },
  { x: 85.1, y: 84.4, size: 2, color: "bg-chart-4", duration: 5.23, delay: -2.49, driftX: 3.29, driftY: 7.84, opacity: 0.48 },
];

const column = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const card = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 26, delay: 0.1 },
  },
} as const;

const glowVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" } },
} as const;

const particlesVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: PARTICLES_DELAY, ease: "easeOut" } },
} as const;

const gradientGlow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const attachmentsAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.25, ease: "easeOut" } },
} as const;

const word: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  visible: (index: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: WORD_DURATION, delay: WORD_DELAY_BASE + index * WORD_DELAY_UNIT, ease: "easeOut" },
  }),
};

const caretAnim = (lastWordEnd: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    transition: { duration: 1, repeat: Infinity, delay: lastWordEnd + 0.05, ease: "easeInOut" },
  },
});

const toolbarAnim = (lastWordEnd: number): Variants => ({
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: lastWordEnd + 0.15, ease: "easeOut" },
  },
});

const meterAnim = (lastWordEnd: number): Variants => ({
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, delay: lastWordEnd + 0.25, ease: "easeOut" } },
});

const sendAnim = (lastWordEnd: number): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: lastWordEnd + 0.3 },
  },
});

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-2/3 left-1/4 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-1/3 left-3/4 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

export interface PromptBoxProps extends VisualProps {
  prompt?: string;
  model?: string;
  tokens?: string;
  contextUsed?: number;
  attachments?: readonly string[];
  caret?: boolean;
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
  gradient?: boolean;
}

export function PromptBox({
  prompt = promptBoxDefaultCopy.prompt,
  model = promptBoxDefaultCopy.model,
  tokens = promptBoxDefaultCopy.tokens,
  contextUsed = 0.16,
  attachments = promptBoxDefaultCopy.attachments,
  caret = true,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  gradient = true,
  className,
}: PromptBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = (hover ? hovered : inView) && ticked;
  const drifting = inView && ticked;
  const state = { initial: "hidden", animate: inView ? "visible" : "hidden" } as const;
  const innerState = { initial: "hidden", animate: active ? "visible" : "hidden" } as const;

  const tokens2 = prompt.split(/(\s+)/).filter(Boolean);
  let wordIndex = 0;
  const words = tokens2.map((text) =>
    /^\s+$/.test(text) ? { type: "space", text } : { type: "word", text, index: wordIndex++ },
  );
  const wordCount = wordIndex;
  const lastWordEnd = WORDS_END(wordCount);
  const meterWidth = `${Math.max(0, Math.min(contextUsed, 1)) * 100}%`;

  const cardInner = (motionContent: boolean) => (
    <>
      <div className="min-h-16 px-4 pt-4 pb-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {words.map((token, t) =>
            token.type === "space" ? (
              <span key={t}>{token.text}</span>
            ) : motionContent ? (
              <motion.span key={t} className="inline-block" variants={word} custom={token.index} {...innerState}>
                {token.text}
              </motion.span>
            ) : (
              <span key={t}>{token.text}</span>
            ),
          )}
          {caret &&
            (motionContent ? (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-0.5 -translate-y-px bg-primary align-middle"
                variants={caretAnim(wordCount)}
                {...innerState}
              />
            ) : (
              <span className="ml-0.5 inline-block h-3.5 w-0.5 -translate-y-px bg-primary align-middle" />
            ))}
        </p>
      </div>
      {attachments.length > 0 && (
        <motion.div className="flex flex-wrap gap-1.5 px-4 pb-2" variants={motionContent ? attachmentsAnim : undefined} {...(motionContent ? innerState : {})}>
          {attachments.map((name, t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-md border bg-muted/50 py-1 pr-1 pl-1.5 text-[10px] text-foreground"
            >
              <FileText className="size-3 text-muted-foreground" strokeWidth={2} />
              <span className="max-w-28 truncate">{name}</span>
              <button
                type="button"
                className="flex size-3.5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <X className="size-2.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </motion.div>
      )}
      <motion.div
        className="flex items-center gap-1.5 border-t px-3 py-2.5"
        variants={motionContent ? toolbarAnim(wordCount) : undefined}
        {...(motionContent ? innerState : {})}
      >
        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="line-clamp-1">{model}</span>
          <ChevronDown className="size-3 text-muted-foreground" strokeWidth={2.5} />
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1 w-9 overflow-hidden rounded-full bg-muted">
            {motionContent ? (
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                style={{ width: meterWidth }}
                variants={meterAnim(wordCount)}
                {...innerState}
              />
            ) : (
              <div className="h-full origin-left rounded-full bg-primary" style={{ width: meterWidth }} />
            )}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{tokens}</span>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Paperclip className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
        {motionContent ? (
          <motion.button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            variants={sendAnim(wordCount)}
            {...innerState}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </button>
        )}
      </motion.div>
    </>
  );

  if (!animated) {
    return (
      <div
        aria-hidden="true"
        className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      >
        {glow && (
          <div className="absolute inset-0 -z-10">
            <GlowScene />
          </div>
        )}
        {particles && (
          <div className="absolute inset-0 -z-10">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className={`rotate-45 rounded-[1px] ${p.color}`}
                  style={{ width: p.size, height: p.size, opacity: p.opacity * 0.7 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="relative w-full max-w-md">
          {gradient && (
            <>
              <div className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm" />
              <div className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs" />
            </>
          )}
          <div className="relative z-10 rounded-xl border bg-card shadow-xs">{cardInner(false)}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
    >
      {glow && (
        <motion.div className="absolute inset-0 -z-10" variants={glowVariant} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={active ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.85 }}
            transition={
              active ? { duration: 4.5, ease: "easeInOut", repeat: Infinity } : { duration: 0.6, ease: "easeOut" }
            }
          >
            <GlowScene />
          </motion.div>
        </motion.div>
      )}
      {particles && (
        <motion.div className="absolute inset-0 -z-10" variants={particlesVariant} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: +!!active }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <motion.div
                  animate={
                    drifting
                      ? { x: [0, p.driftX, 0], y: [0, -p.driftY, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }
                      : { x: 0, y: 0, opacity: 0 }
                  }
                  transition={
                    drifting
                      ? { duration: p.duration, delay: p.delay, ease: "easeInOut", repeat: Infinity }
                      : { duration: 0.3 }
                  }
                >
                  <div className={`rotate-45 rounded-[1px] ${p.color}`} style={{ width: p.size, height: p.size }} />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
      <motion.div className="relative w-full max-w-md" variants={column} {...state}>
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={gradientGlow}
              {...state}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
              variants={veil}
              {...state}
            />
          </>
        )}
        <motion.div className="relative z-10 rounded-xl border bg-card shadow-xs" variants={card} {...state}>
          {cardInner(true)}
        </motion.div>
      </motion.div>
    </div>
  );
}
