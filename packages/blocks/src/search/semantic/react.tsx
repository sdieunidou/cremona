import { useEffect, useId, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Search } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SemanticMatch {
  label: string;
  score: number;
}

export interface SemanticProps extends VisualProps {
  query?: string;
  matches?: SemanticMatch[];
  spaceLabel?: string;
  hover?: boolean;
  isometric?: boolean;
}

const defaultQuery = "upgrade my plan";
const defaultSpaceLabel = "Embedding space";
const defaultMatches: SemanticMatch[] = [
  { label: "Move to a higher tier", score: 0.94 },
  { label: "Compare plan features", score: 0.88 },
  { label: "Add more seats", score: 0.79 },
];

const STAGE = { w: 416, h: 300 };
const BOX = { x: 108, y: 70, w: 200, h: 200, r: 18 };
const QUERY_TOP = 20;
const LINE_TOP = 38;
const CENTER_X = 208;
const CENTER_Y = 170;
const SWEEP_RADIUS = 145;
const MAX_MATCHES = 3;
const MATCH_POINTS: [number, number][] = [
  [272, 136],
  [128, 226],
  [292, 252],
];
const HEADER_DELAY = 0.25;
const BOX_DELAY = 0.5;
const LINK_BASE_DELAY = 0.6;
const LINK_STAGGER = 0.08;
const POINT_BASE_DELAY = 0.7;
const POINT_STAGGER = 0.1;
const CHIP_BASE_DELAY = 0.85;
const CHIP_STAGGER = 0.1;
const SWEEP_DURATION = 2.4;
const SWEEP_CYCLE_MS = 3899.9999999999995;
const SWEEP_FIRST_DELAY = 1.8;

function distanceFromCenter(x: number, y: number): number {
  return Math.hypot(x - CENTER_X, y - CENTER_Y);
}

const stageAnim = {
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

const queryAnim = {
  hidden: { opacity: 0, y: -8, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: 0.15 },
  },
} as const;

const boxAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, delay: HEADER_DELAY, ease: "easeOut" },
  },
} as const;

const originAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay: BOX_DELAY },
  },
} as const;

const stemAnim = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.4, delay: BOX_DELAY, ease: "easeOut" },
  },
} as const;

const linkAnim: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (index: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, delay: LINK_BASE_DELAY + index * LINK_STAGGER, ease: "easeOut" },
  }),
};

const pointAnim: Variants = {
  hidden: { r: 0, opacity: 0 },
  visible: (index: number) => ({
    r: 3.5,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 16,
      delay: POINT_BASE_DELAY + index * POINT_STAGGER,
    },
  }),
};

const chipAnim: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: { ease: "easeOut", delay: CHIP_BASE_DELAY + index * CHIP_STAGGER },
  }),
};

const footerAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, delay: 1.15, ease: "easeOut" },
  },
} as const;

export function Semantic({
  query = defaultQuery,
  matches = defaultMatches,
  spaceLabel = defaultSpaceLabel,
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  fill = false,
  className,
}: SemanticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [sweepCount, setSweepCount] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const sweeping = animated && triggered && ready;
  const pinging = sweeping && (!hover || hovering);
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const resolvedMatches = (matches.length ? matches : defaultMatches).slice(0, MAX_MATCHES);
  const count = resolvedMatches.length;
  const points = resolvedMatches.map((_, i) => MATCH_POINTS[i]!);
  useEffect(() => {
    if (!sweeping) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const cycle = () => {
      timers.length = 0;
      setLitCount(0);
      setSweepCount((c) => c + 1);
      for (let i = 0; i < count; i++) {
        const [x, y] = MATCH_POINTS[i]!;
        schedule(
          () => setLitCount(i + 1),
          (distanceFromCenter(x, y) / SWEEP_RADIUS) * SWEEP_DURATION * 1000,
        );
      }
      schedule(cycle, SWEEP_CYCLE_MS);
    };
    schedule(cycle, SWEEP_FIRST_DELAY * 1000);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [sweeping, count]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className="relative shrink-0"
        style={
          !animated && isometric
            ? { width: STAGE.w, height: STAGE.h, transform: "rotateX(45deg) rotateZ(-45deg)" }
            : { width: STAGE.w, height: STAGE.h }
        }
        variants={animated ? (isometric ? stageIso : stageAnim) : undefined}
        {...state}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
          fill="none"
        >
          <defs>
            <clipPath id={reactId}>
              <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={BOX.r} />
            </clipPath>
          </defs>
          <motion.rect
            x={BOX.x}
            y={BOX.y}
            width={BOX.w}
            height={BOX.h}
            rx={BOX.r}
            stroke="currentColor"
            strokeWidth={0.75}
            strokeDasharray="4 5"
            className="text-muted-foreground/50"
            variants={animated ? boxAnim : undefined}
            {...state}
          />
          <g clipPath={`url(#${reactId})`}>
            {sweeping && sweepCount > 0 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: +!!pinging }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.circle
                  key={`disc${sweepCount}`}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  fill="currentColor"
                  className="text-primary/10"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: SWEEP_RADIUS, opacity: [0, 0.6, 0] }}
                  transition={{ duration: SWEEP_DURATION, ease: "linear" }}
                />
                <motion.circle
                  key={`ring${sweepCount}`}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-primary"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: SWEEP_RADIUS, opacity: [0, 0.7, 0] }}
                  transition={{ duration: SWEEP_DURATION, ease: "linear" }}
                />
              </motion.g>
            )}
            {points.map(([x, y], i) => (
              <motion.path
                key={`link${i}`}
                d={`M ${CENTER_X},${CENTER_Y} L ${x},${y}`}
                stroke="currentColor"
                strokeWidth={0.75}
                strokeDasharray="3 4"
                strokeLinecap="round"
                className="text-muted-foreground/60"
                variants={animated ? linkAnim : undefined}
                custom={i}
                {...state}
              />
            ))}
            {points.map(([x, y], i) => (
              <motion.path
                key={`lit${i}`}
                d={`M ${CENTER_X},${CENTER_Y} L ${x},${y}`}
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
                className="text-primary"
                initial={false}
                animate={{ opacity: pinging && litCount > i ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            ))}
            {points.map(([x, y], i) => (
              <g key={`pt${i}`}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={7}
                  fill="currentColor"
                  className="text-primary/20"
                  initial={false}
                  animate={{ opacity: pinging && litCount > i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r={3.5}
                  fill="currentColor"
                  className="text-primary"
                  variants={animated ? pointAnim : undefined}
                  custom={i}
                  {...state}
                />
              </g>
            ))}
            <motion.g
              variants={animated ? originAnim : undefined}
              {...state}
            >
              <circle cx={CENTER_X} cy={CENTER_Y} r={10} fill="currentColor" className="text-background" />
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={9}
                stroke="currentColor"
                strokeWidth={1.25}
                className="text-primary/40"
              />
              <circle cx={CENTER_X} cy={CENTER_Y} r={4} fill="currentColor" className="text-primary" />
            </motion.g>
          </g>
          <motion.path
            d={`M ${CENTER_X},${LINE_TOP} L ${CENTER_X},158`}
            stroke="currentColor"
            strokeWidth={0.75}
            strokeDasharray="3 4"
            strokeLinecap="round"
            className="text-muted-foreground/60"
            variants={animated ? stemAnim : undefined}
            {...state}
          />
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CENTER_X / STAGE.w) * 100}%`, top: `${(QUERY_TOP / STAGE.h) * 100}%` }}
        >
          <motion.div
            className="flex h-9 w-64 items-center justify-between gap-2 rounded-full border bg-card px-4 shadow-xs ring-2 ring-background sm:w-80"
            variants={animated ? queryAnim : undefined}
            {...state}
          >
            <span className="flex-1 truncate text-[11px]/5 font-medium text-foreground">{query}</span>
            <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          </motion.div>
        </div>
        {points.map(([x, y], i) => (
          <div
            key={`chip${i}`}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(x / STAGE.w) * 100}%`,
              top: `${((y - 14) / STAGE.h) * 100}%`,
            }}
          >
            <motion.div
              className="relative flex max-w-44 items-center gap-1.5 rounded-full border bg-card py-1 pr-1.5 pl-2.5 shadow-xs ring-2 ring-background"
              variants={animated ? chipAnim : undefined}
              custom={i}
              {...state}
            >
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-primary/50"
                initial={false}
                animate={{ opacity: pinging && litCount > i ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <span className="min-w-0 truncate text-[10px] font-medium text-foreground">
                {resolvedMatches[i]!.label}
              </span>
              <span className="shrink-0 rounded-full bg-muted px-1.25 py-px text-[9px] font-semibold text-muted-foreground tabular-nums">
                {resolvedMatches[i]!.score.toFixed(2)}
              </span>
            </motion.div>
          </div>
        ))}
        <motion.span
          className="absolute -translate-x-1/2 text-[9px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase"
          style={{
            left: `${(CENTER_X / STAGE.w) * 100}%`,
            top: `${((BOX.y + BOX.h + 12) / STAGE.h) * 100}%`,
          }}
          variants={animated ? footerAnim : undefined}
          {...state}
        >
          {spaceLabel}
        </motion.span>
        <motion.span
          className="absolute font-mono text-[9px] text-muted-foreground"
          style={{
            left: `${((BOX.x + 16) / STAGE.w) * 100}%`,
            top: `${((BOX.y + BOX.h - 24) / STAGE.h) * 100}%`,
          }}
          variants={animated ? footerAnim : undefined}
          {...state}
          dangerouslySetInnerHTML={{ __html: `k = <!-- -->${count}` }}
        />
      </motion.div>
    </div>
  );
}
