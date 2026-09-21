import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Archive, Cloud, Database, FileText, HardDrive, Server } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const syncDefaultCopy = {
  pairs: [
    [<Cloud className="size-4" strokeWidth={2} />, <Server className="size-4" strokeWidth={2} />],
    [<Database className="size-4" strokeWidth={2} />, <HardDrive className="size-4" strokeWidth={2} />],
    [<FileText className="size-4" strokeWidth={2} />, <Archive className="size-4" strokeWidth={2} />],
  ],
} as const;

const CANVAS = { w: 260, h: 180 };
const FIRST_PAIR_Y = 30;
const LEFT_X = 34;
const RIGHT_X = 226;
const DELAY_BASE = 0.3;
const DELAY_UNIT = 0.1;
const MAX_PAIRS = 4;

function pairY(i: number, n: number): number {
  return n <= 1 ? CANVAS.h / 2 : FIRST_PAIR_Y + ((CANVAS.h - 60) * i) / (n - 1);
}

function pairPaths(i: number, n: number): { forward: string; reverse: string } {
  const y = pairY(i, n);
  const r = y + ((i - (n - 1) / 2) * 18);
  return {
    forward: `M ${LEFT_X},${y} Q 130,${r} ${RIGHT_X},${y}`,
    reverse: `M ${RIGHT_X},${y} Q 130,${r} ${LEFT_X},${y}`,
  };
}

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

const path: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: "easeOut" },
  }),
};

const nodeAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay },
  }),
};

function SyncPulse({
  d,
  dur,
  begin,
  pulse,
  gradientId,
}: {
  d: string;
  dur: string;
  begin: string;
  pulse: "dot" | "spike";
  gradientId: string;
}) {
  if (pulse === "spike") {
    return (
      <g>
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} rotate="auto" />
        <line x1={-18} y1={0} x2={0} y2={0} stroke={`url(#${gradientId})`} strokeWidth={1.4} strokeLinecap="round" />
        <circle r={2} fill="currentColor" className="text-primary" />
      </g>
    );
  }
  return (
    <g>
      <circle r={5} fill="currentColor" className="text-primary/15">
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
      <circle r={2.5} fill="currentColor" className="text-primary">
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
    </g>
  );
}

export interface SyncProps extends VisualProps {
  pairs?: readonly (readonly ReactNode[])[];
  pulse?: "dot" | "spike";
  hover?: boolean;
  isometric?: boolean;
}

export function Sync({
  pairs = syncDefaultCopy.pairs,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  className,
}: SyncProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulseVisible = hover ? hovered : inView;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const pairList = (pairs.length ? pairs : syncDefaultCopy.pairs) as readonly (readonly ReactNode[])[];
  const list = pairList.slice(0, MAX_PAIRS);
  const n = list.length;
  const nodeDelay = (i: number) => DELAY_BASE + i * DELAY_UNIT;
  const curves = list.map((_, t) => pairPaths(t, n));
  const pulseDelay = DELAY_BASE + (n - 1) * DELAY_UNIT + 0.1 + 0.45;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className="relative aspect-13/9 w-72"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? stageIso : stage) : undefined}
        {...state}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          fill="none"
        >
          {pulse === "spike" && (
            <defs>
              <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={-18} y1={0} x2={0} y2={0}>
                <stop offset="0" stopColor="var(--color-primary)" stopOpacity={0} />
                <stop offset="1" stopColor="var(--color-primary)" stopOpacity={0.9} />
              </linearGradient>
            </defs>
          )}
          {curves.map((pair, t) => (
            <motion.path
              key={`sp${t}`}
              d={pair.forward}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="5 4"
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? path : undefined}
              custom={nodeDelay(t) - 0.1}
              {...state}
            />
          ))}
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulseVisible && !hover ? pulseDelay : 0 }}
            >
              {curves.map((pair, i) => (
                <g key={`sd${i}`}>
                  <SyncPulse d={pair.forward} dur="3s" begin={`${-i * 0.8}s`} pulse={pulse} gradientId={gradientId} />
                  <SyncPulse
                    d={pair.reverse}
                    dur="3s"
                    begin={`${-(i * 0.8 + 1.5)}s`}
                    pulse={pulse}
                    gradientId={gradientId}
                  />
                </g>
              ))}
            </motion.g>
          )}
        </svg>
        {list.map((pair, t) => (
          <div
            key={`ln${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(LEFT_X / CANVAS.w) * 100}%`, top: `${(pairY(t, n) / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className="flex size-9 items-center justify-center overflow-hidden rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
              variants={animated ? nodeAnim : undefined}
              custom={nodeDelay(t)}
              {...state}
            >
              {pair[0]}
            </motion.div>
          </div>
        ))}
        {list.map((pair, t) => (
          <div
            key={`rn${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(RIGHT_X / CANVAS.w) * 100}%`, top: `${(pairY(t, n) / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className="flex size-9 items-center justify-center overflow-hidden rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
              variants={animated ? nodeAnim : undefined}
              custom={nodeDelay(t) + 0.1}
              {...state}
            >
              {pair[1]}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
