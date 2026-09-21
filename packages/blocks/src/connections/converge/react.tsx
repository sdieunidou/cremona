import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Database, FileText, Image } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const convergeDefaultCopy = {
  nodes: [
    <FileText className="size-4" strokeWidth={2} />,
    <Image className="size-4" strokeWidth={2} />,
    <Database className="size-4" strokeWidth={2} />,
  ],
} as const;

const CANVAS = { w: 280, h: 180 };
const FIRST_NODE_Y = 28;
const NODE_X = 28;
const LINE_END_X = 172;
const DEST_Y = 90;
const DEST_X = 215;
const DELAY_BASE = 0.35;
const DELAY_UNIT = 0.1;
const MAX_NODES = 4;

function nodeY(i: number, n: number): number {
  return n <= 1 ? CANVAS.h / 2 : FIRST_NODE_Y + ((CANVAS.h - 56) * i) / (n - 1);
}

function cubic(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (x1 + x2) / 2;
  return `M ${x1},${y1} C ${mid},${y1} ${mid},${y2} ${x2},${y2}`;
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

const dest = {
  hidden: { scale: 0.85, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.15 },
  },
} as const;

function ConvergePulse({
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

export interface ConvergeProps extends VisualProps {
  nodes?: readonly ReactNode[];
  pulse?: "dot" | "spike";
  hover?: boolean;
  isometric?: boolean;
}

export function Converge({
  nodes = convergeDefaultCopy.nodes,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  className,
}: ConvergeProps) {
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

  const nodeList = (nodes.length ? nodes : convergeDefaultCopy.nodes) as readonly ReactNode[];
  const list = nodeList.slice(0, MAX_NODES);
  const n = list.length;
  const nodeDelay = (i: number) => DELAY_BASE + i * DELAY_UNIT;
  const paths = list.map((_, t) => cubic(NODE_X, nodeY(t, n), LINE_END_X, DEST_Y));
  const pulseDelay = DELAY_BASE + (n - 1) * DELAY_UNIT + 0.45;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className="relative aspect-14/9 w-72"
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
          {paths.map((d, t) => (
            <motion.path
              key={`cp${t}`}
              d={d}
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
              {paths.map((d, i) => (
                <ConvergePulse key={`cd${i}`} d={d} dur="2s" begin={`${-i * 0.7}s`} pulse={pulse} gradientId={gradientId} />
              ))}
            </motion.g>
          )}
        </svg>
        {list.map((node, t) => (
          <div
            key={`cn${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(NODE_X / CANVAS.w) * 100}%`, top: `${(nodeY(t, n) / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className="flex size-9 items-center justify-center overflow-hidden rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
              variants={animated ? nodeAnim : undefined}
              custom={nodeDelay(t)}
              {...state}
            >
              {node}
            </motion.div>
          </div>
        ))}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(DEST_X / CANVAS.w) * 100}%`, top: `${(DEST_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex h-32 w-24 flex-col overflow-hidden rounded-lg border bg-card shadow-md ring-2 ring-background"
            variants={animated ? dest : undefined}
            {...state}
          >
            <div className="flex items-center gap-1 border-b px-1.5 py-1">
              <div className="size-1 rounded-full bg-red-400/70" />
              <div className="size-1 rounded-full bg-amber-400/70" />
              <div className="size-1 rounded-full bg-emerald-400/70" />
              <div className="ml-1 h-1.5 flex-1 rounded-sm bg-muted" />
            </div>
            <div className="flex items-center gap-1.5 border-b px-2 py-1.5">
              <div className="size-1.5 rounded-xs bg-primary/50" />
              <div className="flex gap-1">
                <div className="h-0.75 w-3 rounded-full bg-muted" />
                <div className="h-0.75 w-2.5 rounded-full bg-muted" />
                <div className="h-0.75 w-3 rounded-full bg-muted" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 pt-2">
              <div className="h-1 w-3/4 rounded-full bg-muted-foreground/30" />
              <div className="h-0.75 w-1/2 rounded-full bg-muted" />
            </div>
            <div className="flex gap-1 px-2 pt-2">
              <div className="h-5 flex-1 rounded-xs bg-muted/60" />
              <div className="h-5 flex-1 rounded-xs bg-muted/60" />
              <div className="h-5 flex-1 rounded-xs bg-muted/60" />
            </div>
            <div className="flex flex-col gap-0.75 px-2 pt-2">
              <div className="h-0.75 w-full rounded-full bg-muted" />
              <div className="h-0.75 w-4/5 rounded-full bg-muted" />
              <div className="h-0.75 w-3/5 rounded-full bg-muted" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
