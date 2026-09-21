import { useEffect, useRef, useState } from "react";
import { motion, type ValueTransition, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { FileText, Search, Sparkles } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const retrievalDefaultCopy = {
  query: "How do refunds work?",
  sources: [
    { name: "billing.mdx", score: 0.94 },
    { name: "refunds.pdf", score: 0.87 },
    { name: "terms.md", score: 0.71 },
  ],
  answer: "Refunds are issued within 30 days of renewal, to the original payment method.",
} as const;

interface Source {
  name: string;
  score: number;
}

const CANVAS = { w: 416, h: 288 };
const QUERY_Y = 26;
const LINE_TOP = 44;
const LINE_BOTTOM = 108;
const SOURCES_Y = 144;
const CONVERGE_START_Y = 180;
const CONVERGE_END_Y = 230;
const ANSWER_Y = 258;
const CENTER_X = 208;
const SOURCE_GAP = 124;
const MAX_SOURCES = 3;
const BEZIER_STEPS = 20;
const FAN_DELAY = 0.35;
const LINE_DELAY_UNIT = 0.08;
const SOURCE_DELAY = 0.45;
const SOURCE_DELAY_UNIT = 0.12;
const CONVERGE_DELAY = 0.95;
const ANSWER_DELAY = 1.15;
const ANSWER_WORD_DELAY = 1.35;
const ANSWER_WORD_UNIT = 0.05;
const ANSWER_WORD_DURATION = 0.22;
const PULSE_OPACITY = [0, 1, 1, 0];
const PULSE_TIMES = [0, 0.12, 0.88, 1];
const PATH_LENGTH = 100;
const PULSE_STROKE = 1;
const PULSE_DASH = 24;
const FAN_PULSE_DURATION = 0.65;
const CONVERGE_PULSE_DURATION = 0.85;
const LOOP_RESTART = 0.3;
const INITIAL_DELAY = 1.9;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

function sourceX(i: number, n: number): number {
  return n <= 1 ? CENTER_X : CENTER_X + (i - (n - 1) / 2) * SOURCE_GAP;
}

function verticalLine(x: number): string {
  return `M ${x},${LINE_TOP} L ${x},${LINE_BOTTOM}`;
}

function bezier(x: number): { p0: [number, number]; p1: [number, number]; p2: [number, number]; p3: [number, number] } {
  return { p0: [x, CONVERGE_START_Y], p1: [x, 205], p2: [CENTER_X, 205], p3: [CENTER_X, CONVERGE_END_Y] };
}

function bezierPath({ p0, p1, p2, p3 }: ReturnType<typeof bezier>): string {
  return `M ${p0[0]},${p0[1]} C ${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
}

function sampleBezier({ p0, p1, p2, p3 }: ReturnType<typeof bezier>): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= BEZIER_STEPS; i++) {
    const s = i / BEZIER_STEPS;
    const c = 1 - s;
    const l = c * c * c;
    const u = 3 * c * c * s;
    const d = 3 * c * s * s;
    const f = s * s * s;
    xs.push(l * p0[0] + u * p1[0] + d * p2[0] + f * p3[0]);
    ys.push(l * p0[1] + u * p1[1] + d * p2[1] + f * p3[1]);
  }
  return { xs, ys };
}

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
  { x: 8.4, y: 22.6, size: 3, color: "bg-primary", duration: 5.12, delay: -4.82, driftX: 4.4, driftY: 13.6, opacity: 0.55 },
  { x: 92.4, y: 30.8, size: 3, color: "bg-chart-1", duration: 6.44, delay: -2.15, driftX: -3.6, driftY: 11.9, opacity: 0.6 },
  { x: 14.6, y: 74.1, size: 2, color: "bg-chart-2", duration: 6.02, delay: -1.44, driftX: -2.3, driftY: 15.4, opacity: 0.45 },
  { x: 86.3, y: 68.7, size: 3, color: "bg-chart-3", duration: 4.38, delay: -3.71, driftX: 5.5, driftY: 12.8, opacity: 0.62 },
  { x: 3.4, y: 48.2, size: 2, color: "bg-chart-4", duration: 4.66, delay: -5.11, driftX: 6.2, driftY: 15.1, opacity: 0.5 },
  { x: 96.1, y: 55.3, size: 3, color: "bg-primary", duration: 4.47, delay: -1.62, driftX: -3.4, driftY: 14.2, opacity: 0.42 },
  { x: 20.8, y: 9.9, size: 2, color: "bg-chart-1", duration: 5.03, delay: -5.64, driftX: 3.9, driftY: 9.1, opacity: 0.48 },
  { x: 79.2, y: 12.4, size: 3, color: "bg-chart-4", duration: 7.24, delay: -5.19, driftX: 6.4, driftY: 12.6, opacity: 0.54 },
  { x: 26.9, y: 92.3, size: 3, color: "bg-primary", duration: 5.71, delay: -2.94, driftX: -2.7, driftY: 10.4, opacity: 0.58 },
  { x: 73.1, y: 94.8, size: 2, color: "bg-chart-3", duration: 4.92, delay: -1.33, driftX: 4.9, driftY: 8.2, opacity: 0.47 },
  { x: 1.8, y: 86.1, size: 3, color: "bg-primary", duration: 5.28, delay: -5.38, driftX: 4.1, driftY: 13.9, opacity: 0.43 },
  { x: 97.2, y: 84.6, size: 2, color: "bg-chart-2", duration: 4.83, delay: -2.71, driftX: -3.3, driftY: 15.2, opacity: 0.5 },
];

const stage = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const stageIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
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

const line: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, delay, ease: "easeOut" },
  }),
};

const queryPill = {
  hidden: { opacity: 0, y: -8, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.15 },
  },
} as const;

const sourceCard: Variants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 18, delay: SOURCE_DELAY + i * SOURCE_DELAY_UNIT },
  }),
};

const meter: Variants = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.5, delay: SOURCE_DELAY + i * SOURCE_DELAY_UNIT + 0.15, ease: "easeOut" },
  }),
};

const answerBox = {
  hidden: { scale: 0.9, opacity: 0, y: 8 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22, delay: ANSWER_DELAY },
  },
} as const;

const answerWord: Variants = {
  hidden: { opacity: 0, filter: "blur(2px)" },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: ANSWER_WORD_DURATION, delay: ANSWER_WORD_DELAY + i * ANSWER_WORD_UNIT, ease: "easeOut" },
  }),
};

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-1/4 left-1/4 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-3/4 left-3/4 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

function Pulse({
  d,
  xs,
  ys,
  duration,
  ease,
  pulse,
}: {
  d: string;
  xs: number[];
  ys: number[];
  duration: number;
  ease: "easeInOut" | "linear";
  pulse: "dot" | "line";
}) {
  const base: ValueTransition = { duration, ease };
  const keys: ValueTransition = { duration, ease: "linear", times: PULSE_TIMES };
  if (pulse === "line") {
    return (
      <motion.path
        d={d}
        pathLength={PATH_LENGTH}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={PULSE_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${PULSE_DASH} 200`}
        initial={{ strokeDashoffset: PULSE_DASH, opacity: 0 }}
        animate={{ strokeDashoffset: -76, opacity: PULSE_OPACITY }}
        transition={{ strokeDashoffset: base, opacity: keys }}
      />
    );
  }
  return (
    <>
      <motion.circle
        r={5}
        fill="currentColor"
        className="text-primary/15"
        initial={{ cx: xs[0], cy: ys[0], opacity: 0 }}
        animate={{ cx: xs, cy: ys, opacity: PULSE_OPACITY }}
        transition={{ cx: base, cy: base, opacity: keys }}
      />
      <motion.circle
        r={2.4}
        fill="currentColor"
        className="text-primary"
        initial={{ cx: xs[0], cy: ys[0], opacity: 0 }}
        animate={{ cx: xs, cy: ys, opacity: PULSE_OPACITY }}
        transition={{ cx: base, cy: base, opacity: keys }}
      />
    </>
  );
}

function tokenize(text: string): { type: "space" | "word"; text: string; index?: number }[] {
  const out: { type: "space" | "word"; text: string; index?: number }[] = [];
  let i = 0;
  for (const part of text.split(/(\s+)/).filter(Boolean)) {
    if (/^\s+$/.test(part)) out.push({ type: "space", text: part });
    else {
      out.push({ type: "word", text: part, index: i });
      i += 1;
    }
  }
  return out;
}

function SourceCard({
  source,
  lit,
  animated,
  index,
  state,
}: {
  source: Source;
  lit: boolean;
  animated: boolean;
  index: number;
  state: Record<string, unknown>;
}) {
  return (
    <motion.div
      className="relative flex h-20 w-27 flex-col gap-1.5 rounded-xl border bg-card p-3 shadow-xs ring-2 ring-background will-change-transform"
      variants={animated ? sourceCard : undefined}
      custom={index}
      {...state}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-primary/50"
        initial={false}
        animate={{ opacity: animated && lit ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <span className="flex items-center gap-1">
        <FileText className="size-3 shrink-0 text-muted-foreground" strokeWidth={2} />
        <span className="flex-1 truncate font-mono text-[10px] text-foreground">{source.name}</span>
      </span>
      <span className="flex flex-1 flex-col justify-center gap-1">
        <span className="h-1 w-full rounded-full bg-muted" />
        <span className="h-1 w-4/5 rounded-full bg-muted" />
        <span className="h-1 w-3/5 rounded-full bg-muted" />
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.span
            className="block h-full origin-left rounded-full bg-primary"
            style={{ width: `${source.score * 100}%` }}
            variants={animated ? meter : undefined}
            custom={index}
            {...state}
          />
        </span>
        <span className="text-[9px] font-medium text-muted-foreground tabular-nums">{source.score.toFixed(2)}</span>
      </span>
    </motion.div>
  );
}

export interface RetrievalProps extends VisualProps {
  query?: string;
  sources?: readonly Source[];
  answer?: string;
  pulse?: "dot" | "line";
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
  isometric?: boolean;
}

export function Retrieval({
  query = retrievalDefaultCopy.query,
  sources = retrievalDefaultCopy.sources,
  answer = retrievalDefaultCopy.answer,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  isometric = false,
  className,
}: RetrievalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [lineIndex, setLineIndex] = useState(-1);
  const [litCount, setLitCount] = useState(0);
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = (hover ? hovered : inView) && ticked;
  const drifting = inView && ticked;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const sourceList = ((sources.length ? sources : retrievalDefaultCopy.sources) as readonly Source[]).slice(
    0,
    MAX_SOURCES,
  );
  const n = sourceList.length;
  const words = tokenize(answer);
  const fanLines = sourceList.map((_, t) => verticalLine(sourceX(t, n)));
  const fanSamples = sourceList.map((_, t) => {
    const x = sourceX(t, n);
    return { xs: [x, x], ys: [LINE_TOP, LINE_BOTTOM] };
  });
  const beziers = sourceList.map((_, t) => bezier(sourceX(t, n)));
  const convergePaths = beziers.map(bezierPath);
  const convergeSamples = beziers.map(sampleBezier);

  useEffect(() => {
    if (!animated || !active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const first = FAN_PULSE_DURATION * 1000;
    const convergeStart = (n - 1) * 870 + first;
    const restart = convergeStart + 2050;
    const run = () => {
      timers.length = 0;
      setLineIndex(0);
      setLitCount(0);
      for (let i = 0; i < n; i++) {
        at(() => setLitCount(i + 1), i * 870 + first);
        if (i + 1 < n) at(() => setLineIndex(i + 1), (i + 1) * 870);
      }
      at(() => setLineIndex(n), convergeStart);
      at(() => {
        setLineIndex(-1);
        setLitCount(0);
        at(run, LOOP_RESTART * 1000);
      }, restart);
    };
    at(run, hover ? 0 : INITIAL_DELAY * 1000);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [animated, active, hover, n]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={
        animated && hover
          ? () => {
              setHovered(false);
              setLineIndex(-1);
              setLitCount(0);
            }
          : undefined
      }
    >
      {glow &&
        (animated ? (
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
        ) : (
          <div className="absolute inset-0 -z-10">
            <GlowScene />
          </div>
        ))}
      {particles &&
        (animated ? (
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
        ) : (
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
        ))}
      <motion.div
        className="relative shrink-0"
        style={
          !animated && isometric
            ? { width: CANVAS.w, height: CANVAS.h, transform: "rotateX(45deg) rotateZ(-45deg)" }
            : { width: CANVAS.w, height: CANVAS.h }
        }
        variants={animated ? (isometric ? stageIso : stage) : undefined}
        {...state}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          fill="none"
        >
          {fanLines.map((d, t) => (
            <motion.path
              key={`fan${t}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? line : undefined}
              custom={FAN_DELAY + t * LINE_DELAY_UNIT}
              {...state}
            />
          ))}
          {convergePaths.map((d, t) => (
            <motion.path
              key={`conv${t}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? line : undefined}
              custom={CONVERGE_DELAY + t * LINE_DELAY_UNIT}
              {...state}
            />
          ))}
          {animated &&
            active &&
            fanSamples.map((s, t) =>
              lineIndex === t ? (
                <Pulse
                  key={`fanPulse${t}`}
                  d={fanLines[t]!}
                  xs={s.xs}
                  ys={s.ys}
                  duration={FAN_PULSE_DURATION}
                  ease="easeInOut"
                  pulse={pulse}
                />
              ) : null,
            )}
          {animated &&
            active &&
            lineIndex === n &&
            convergeSamples.map((s, t) => (
              <Pulse
                key={`convPulse${t}`}
                d={convergePaths[t]!}
                xs={s.xs}
                ys={s.ys}
                duration={CONVERGE_PULSE_DURATION}
                ease="linear"
                pulse={pulse}
              />
            ))}
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CENTER_X / CANVAS.w) * 100}%`, top: `${(QUERY_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex h-9 w-80 items-center justify-between gap-2 rounded-full border bg-card px-4 shadow-xs ring-2 ring-background"
            variants={animated ? queryPill : undefined}
            {...state}
          >
            <span className="flex-1 truncate text-[11px]/5 font-medium text-foreground">{query}</span>
            <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          </motion.div>
        </div>
        {sourceList.map((source, t) => (
          <div
            key={`sc${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(sourceX(t, n) / CANVAS.w) * 100}%`,
              top: `${(SOURCES_Y / CANVAS.h) * 100}%`,
            }}
          >
            <SourceCard source={source} lit={active && litCount > t} animated={animated} index={t} state={state} />
          </div>
        ))}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CENTER_X / CANVAS.w) * 100}%`, top: `${(ANSWER_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex w-84 flex-col gap-1.5 rounded-xl border bg-card px-3 py-2.5 shadow-md ring-2 ring-background"
            variants={animated ? answerBox : undefined}
            {...state}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" strokeWidth={2.5} />
              <span className="text-[9px] font-medium tracking-wide text-muted-foreground uppercase">Answer</span>
            </span>
            <p className="text-[11px] leading-relaxed text-foreground">
              {words.map((token, t) =>
                token.type === "space" ? (
                  <span key={t}>{token.text}</span>
                ) : (
                  <motion.span
                    key={t}
                    className="inline-block"
                    variants={animated ? answerWord : undefined}
                    custom={token.index}
                    {...state}
                  >
                    {token.text}
                  </motion.span>
                ),
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
