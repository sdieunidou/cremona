import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export const voiceDefaultCopy = {
  listeningStatus: "Listening",
  listeningTranscript: "Add a reminder to follow up with the design team tomorrow morning",
  thinkingStatus: "Thinking",
  thinkingTranscript: "",
  speakingStatus: "Speaking",
  speakingTranscript: "Done. Reminder set for 9 AM tomorrow to follow up with the team.",
} as const;

type VoiceState = "listening" | "thinking" | "speaking";

const WORD_DELAY = 0.6;
const WORD_DELAY_UNIT = 0.06;
const WORD_DURATION = 0.24;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

const CYCLE: VoiceState[] = ["listening", "thinking", "speaking"];
const CYCLE_MS: Record<VoiceState, number> = { listening: 3000, thinking: 1900, speaking: 3600 };

const BARS = [
  { rest: 0.3, peak: 0.7, duration: 0.66, delay: 0.05 },
  { rest: 0.5, peak: 1, duration: 0.58, delay: 0.18 },
  { rest: 0.42, peak: 0.82, duration: 0.62, delay: 0.1 },
  { rest: 0.62, peak: 1, duration: 0.5, delay: 0 },
  { rest: 0.38, peak: 0.9, duration: 0.7, delay: 0.22 },
  { rest: 0.5, peak: 0.78, duration: 0.55, delay: 0.12 },
  { rest: 0.3, peak: 0.66, duration: 0.64, delay: 0.08 },
];

const RINGS = [
  { delay: 0, duration: 3 },
  { delay: -1, duration: 3 },
  { delay: -2, duration: 3 },
];

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
  { x: 14.2, y: 24.6, size: 3, color: "bg-primary", duration: 4.82, delay: -5.22, driftX: 4.87, driftY: 14.97, opacity: 0.6 },
  { x: 86.7, y: 30.1, size: 3, color: "bg-chart-1", duration: 6.16, delay: -2.68, driftX: -3.11, driftY: 12.52, opacity: 0.63 },
  { x: 20.1, y: 72.3, size: 2, color: "bg-chart-2", duration: 6.41, delay: -1.19, driftX: -2.04, driftY: 16.24, opacity: 0.48 },
  { x: 82.6, y: 66.2, size: 3, color: "bg-chart-3", duration: 4.09, delay: -3.47, driftX: 5.93, driftY: 13.39, opacity: 0.65 },
  { x: 6.8, y: 50.5, size: 2, color: "bg-chart-4", duration: 4.41, delay: -5.43, driftX: 6.64, driftY: 15.95, opacity: 0.55 },
  { x: 93.2, y: 54.4, size: 3, color: "bg-primary", duration: 4.22, delay: -1.23, driftX: -3.05, driftY: 14.75, opacity: 0.45 },
  { x: 17.3, y: 15.2, size: 2, color: "bg-chart-1", duration: 4.72, delay: -5.81, driftX: 4.22, driftY: 9.62, opacity: 0.5 },
  { x: 76.5, y: 19.7, size: 3, color: "bg-chart-4", duration: 7.66, delay: -5.45, driftX: 6.82, driftY: 13.1, opacity: 0.57 },
  { x: 28.6, y: 82.6, size: 3, color: "bg-primary", duration: 5.43, delay: -2.72, driftX: -2.28, driftY: 10, opacity: 0.62 },
  { x: 69.4, y: 80.3, size: 2, color: "bg-chart-3", duration: 4.75, delay: -1.01, driftX: 5.27, driftY: 8.7, opacity: 0.5 },
  { x: 4.9, y: 40.4, size: 3, color: "bg-primary", duration: 4.94, delay: -5.65, driftX: 4.64, driftY: 13.44, opacity: 0.46 },
  { x: 95.3, y: 42.8, size: 2, color: "bg-chart-2", duration: 4.69, delay: -2.39, driftX: -3.07, driftY: 15.9, opacity: 0.52 },
  { x: 48.5, y: 10.6, size: 3, color: "bg-chart-4", duration: 6.13, delay: -5.07, driftX: -2.6, driftY: 9.3, opacity: 0.5 },
  { x: 55.2, y: 90.1, size: 2, color: "bg-primary", duration: 6.39, delay: -5.57, driftX: 1.33, driftY: 9.13, opacity: 0.55 },
  { x: 38.8, y: 86.9, size: 3, color: "bg-chart-1", duration: 7.31, delay: -5.08, driftX: -4.42, driftY: 14.91, opacity: 0.5 },
  { x: 88.1, y: 86.4, size: 2, color: "bg-chart-4", duration: 5.23, delay: -2.49, driftX: 3.29, driftY: 7.84, opacity: 0.48 },
];

const content = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const orb = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.1 } },
} as const;

const glowVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" } },
} as const;

const particlesVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: PARTICLES_DELAY, ease: "easeOut" } },
} as const;

const statusPill = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.2, ease: "easeOut" } },
} as const;

const word: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  visible: (index: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: WORD_DURATION, delay: WORD_DELAY + index * WORD_DELAY_UNIT, ease: "easeOut" },
  }),
};

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-2/5 left-2/5 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-3/5 left-3/5 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

function Orb({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground shadow-xl ring-1 shadow-primary/25 ring-black/5 dark:ring-white/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 to-transparent" />
      {children}
    </div>
  );
}

function Equalizer({ animated, loopActive }: { animated: boolean; loopActive: boolean }) {
  return (
    <div className="relative flex h-7 transform-gpu items-center gap-1">
      {BARS.map((bar, r) =>
        animated ? (
          <motion.div
            key={r}
            className="w-1 origin-center rounded-full bg-primary-foreground"
            style={{ height: "100%" }}
            initial={{ scaleY: bar.rest }}
            animate={loopActive ? { scaleY: [bar.rest, bar.peak, bar.rest] } : { scaleY: bar.rest }}
            transition={
              loopActive
                ? { duration: bar.duration, delay: bar.delay, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.4, ease: "easeOut" }
            }
          />
        ) : (
          <div
            key={r}
            className="w-1 origin-center rounded-full bg-primary-foreground"
            style={{ height: "100%", transform: `scaleY(${bar.rest})` }}
          />
        ),
      )}
    </div>
  );
}

function ThinkingDots({ animated, loopActive }: { animated: boolean; loopActive: boolean }) {
  return (
    <div className="relative flex items-center gap-1.5">
      {[0, 1, 2].map((n) =>
        animated ? (
          <motion.div
            key={n}
            className="size-2 rounded-full bg-primary-foreground"
            initial={{ scale: 0.85, opacity: 0.8 }}
            animate={loopActive ? { scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] } : { scale: 0.85, opacity: 0.8 }}
            transition={
              loopActive
                ? { duration: 1.1, delay: n * 0.16, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.4, ease: "easeOut" }
            }
          />
        ) : (
          <div
            key={n}
            className="size-2 rounded-full bg-primary-foreground opacity-80"
            style={{ transform: "scale(0.85)" }}
          />
        ),
      )}
    </div>
  );
}

function Shimmer({ animated, loopActive }: { animated: boolean; loopActive: boolean }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      {["w-40", "w-28"].map((w, r) => (
        <div key={r} className={`relative h-2 ${w} overflow-hidden rounded-full border border-border/75 bg-muted`}>
          {animated && (
            <motion.div
              className="absolute inset-y-px w-1/2 bg-linear-to-r from-transparent via-primary/25 to-transparent"
              animate={loopActive ? { x: ["-120%", "320%"] } : { x: "-120%" }}
              transition={
                loopActive
                  ? { duration: 1.4, delay: r * 0.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2 }
                  : { duration: 0.3 }
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

export interface VoiceProps extends VisualProps {
  state?: VoiceState;
  transcript?: string;
  listeningTranscript?: string;
  speakingTranscript?: string;
  status?: string;
  listeningStatus?: string;
  thinkingStatus?: string;
  speakingStatus?: string;
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
}

export function Voice({
  state: stateProp,
  transcript,
  listeningTranscript,
  speakingTranscript,
  status,
  listeningStatus,
  thinkingStatus,
  speakingStatus,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  className,
}: VoiceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [cycled, setCycled] = useState<VoiceState>("listening");
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const gate = animated && (trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce);
  const active = (hover ? hovered : gate) && ticked;
  const drifting = gate && ticked;
  const noExplicitState = !stateProp;

  useEffect(() => {
    if (!animated || !noExplicitState || !active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const step = (i: number) => {
      const next = CYCLE[i]!;
      setCycled(next);
      timer = setTimeout(() => {
        if (!cancelled) step((i + 1) % CYCLE.length);
      }, CYCLE_MS[next]);
    };
    step(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [animated, noExplicitState, active]);

  const current = stateProp ?? cycled;
  const isThinking = current === "thinking";
  const isListening = current === "listening";
  const statusLabel =
    ({ listening: listeningStatus, thinking: thinkingStatus, speaking: speakingStatus } as const)[current] ??
    status ??
    voiceDefaultCopy[`${current}Status` as const];
  const transcriptLabel =
    ({ listening: listeningTranscript, thinking: undefined, speaking: speakingTranscript } as const)[current] ??
    transcript ??
    voiceDefaultCopy[`${current}Transcript` as const];

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
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute size-24 rounded-full border border-primary/30" />
            {isThinking ? (
              <div className="absolute size-28 rounded-full border border-primary/15" />
            ) : (
              <Fragment>
                <div className="absolute size-36 rounded-full border border-primary/15" />
                <div className="absolute size-48 rounded-full border border-primary/10" />
              </Fragment>
            )}
            <Orb>
              {isThinking ? <ThinkingDots animated={false} loopActive={false} /> : <Equalizer animated={false} loopActive={false} />}
            </Orb>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-medium text-foreground">{statusLabel}</span>
          </div>
          <div className="relative z-10 flex min-h-12 w-full max-w-xs items-start justify-center">
            {isThinking ? (
              <Shimmer animated={false} loopActive={false} />
            ) : (
              <p className="text-center text-sm leading-relaxed text-foreground">{transcriptLabel}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const state = { initial: "hidden", animate: gate ? "visible" : "hidden" } as const;
  const wordsState = { initial: "hidden", animate: active ? "visible" : "hidden" } as const;
  const words = (transcriptLabel ?? "").split(/(\s+)/).filter(Boolean);
  let wordIndex = 0;
  const tokens = words.map((text) =>
    /^\s+$/.test(text) ? { type: "space", text } : { type: "word", text, index: wordIndex++ },
  );

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
      <motion.div className="relative z-10 flex flex-col items-center gap-5" variants={content} {...state}>
        <motion.div className="relative flex items-center justify-center" variants={orb} {...state}>
          <div className="absolute size-24 rounded-full border border-primary/20" />
          <AnimatePresence initial={false}>
            <motion.div
              key={isThinking ? "thinking" : isListening ? "listening" : "speaking"}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {isThinking ? (
                <motion.div
                  className="absolute size-28 rounded-full border border-primary/30"
                  initial={{ scale: 1, opacity: 0.28 }}
                  animate={
                    active ? { scale: [1, 1.12, 1], opacity: [0.3, 0.12, 0.3] } : { scale: 1, opacity: 0.28 }
                  }
                  transition={
                    active ? { duration: 2, ease: "easeInOut", repeat: Infinity } : { duration: 0.4, ease: "easeOut" }
                  }
                />
              ) : (
                RINGS.map((ring, t) => (
                  <motion.div
                    key={t}
                    className="absolute size-24 rounded-full border border-primary/30"
                    initial={{ scale: isListening ? 2.2 : 1, opacity: 0 }}
                    animate={
                      active
                        ? { scale: isListening ? [2.2, 1] : [1, 2.2], opacity: [0, 0.4, 0] }
                        : { scale: isListening ? 2.2 : 1, opacity: 0 }
                    }
                    transition={
                      active
                        ? { duration: ring.duration, delay: ring.delay, ease: "easeOut", repeat: Infinity }
                        : { duration: 0.4, ease: "easeOut" }
                    }
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
          <Orb>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={isThinking ? "thinking" : "wave"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {isThinking ? (
                  <ThinkingDots animated loopActive={active} />
                ) : (
                  <Equalizer animated loopActive={active} />
                )}
              </motion.div>
            </AnimatePresence>
          </Orb>
        </motion.div>
        <motion.div
          layout
          className="relative z-10 flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1"
          variants={statusPill}
          {...state}
          transition={{ layout: { duration: 0.22, ease: "easeOut" } }}
        >
          <motion.span
            className="size-1.5 shrink-0 rounded-full bg-primary"
            animate={active ? { opacity: [1, 0.3, 1], scale: [1, 0.8, 1] } : { opacity: 1, scale: 1 }}
            transition={active ? { duration: 1.4, ease: "easeInOut", repeat: Infinity } : { duration: 0.4 }}
          />
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={statusLabel}
              className="text-[11px] font-medium whitespace-nowrap text-foreground"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {statusLabel}
            </motion.span>
          </AnimatePresence>
        </motion.div>
        <div className="relative z-10 flex min-h-12 w-full max-w-xs items-start justify-center">
          {isThinking ? (
            <Shimmer key={current} animated loopActive={active} />
          ) : (
            <p key={current} className="text-center text-sm leading-relaxed text-foreground">
              {tokens.map((token, t) =>
                token.type === "space" ? (
                  <span key={t}>{token.text}</span>
                ) : (
                  <motion.span
                    key={t}
                    className="inline-block"
                    variants={word}
                    custom={token.index}
                    {...wordsState}
                  >
                    {token.text}
                  </motion.span>
                ),
              )}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
