import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Bell,
  ChartColumn,
  Database,
  Funnel,
  GitMerge,
  Globe,
  HardDrive,
  Rss,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const flowDefaultCopy = {
  sources: [
    <Database className="size-4" strokeWidth={2} />,
    <Globe className="size-4" strokeWidth={2} />,
    <Rss className="size-4" strokeWidth={2} />,
  ],
  transforms: [
    <Funnel className="size-4.5" strokeWidth={1.5} />,
    <GitMerge className="size-4.5" strokeWidth={1.5} />,
  ],
  destinations: [
    <ChartColumn className="size-4" strokeWidth={2} />,
    <HardDrive className="size-4" strokeWidth={2} />,
    <Bell className="size-4" strokeWidth={2} />,
  ],
} as const;

const CANVAS = { w: 300, h: 180 };
const PULSE_DELAY = 1.1;
const PATH_LENGTH = 100;
const PULSE_STROKE = 1.4;

const SOURCE_POS = [
  { x: 28, y: 28, delay: 0.25 },
  { x: 28, y: 90, delay: 0.3 },
  { x: 28, y: 152, delay: 0.35 },
];
const TRANSFORM_POS = [
  { x: 150, y: 55, delay: 0.45 },
  { x: 150, y: 125, delay: 0.5 },
];
const DEST_POS = [
  { x: 272, y: 28, delay: 0.6 },
  { x: 272, y: 90, delay: 0.65 },
  { x: 272, y: 152, delay: 0.7 },
];

function cubic(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (x1 + x2) / 2;
  return `M ${x1},${y1} C ${mid},${y1} ${mid},${y2} ${x2},${y2}`;
}

const EDGES = [
  { d: cubic(28, 28, 150, 55), delay: 0.2, dotBegin: 0 },
  { d: cubic(28, 90, 150, 55), delay: 0.25, dotBegin: -0.5 },
  { d: cubic(28, 90, 150, 125), delay: 0.3, dotBegin: -1 },
  { d: cubic(28, 152, 150, 125), delay: 0.35, dotBegin: -1.5 },
  { d: cubic(150, 55, 272, 28), delay: 0.4, dotBegin: -0.3 },
  { d: cubic(150, 55, 272, 90), delay: 0.45, dotBegin: -0.8 },
  { d: cubic(150, 125, 272, 90), delay: 0.5, dotBegin: -1.3 },
  { d: cubic(150, 125, 272, 152), delay: 0.55, dotBegin: -1.8 },
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

function FlowPulse({
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
        <line x1={-18} y1={0} x2={0} y2={0} stroke={`url(#${gradientId})`} strokeWidth={PULSE_STROKE} strokeLinecap="round" />
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

export interface FlowProps extends VisualProps {
  sources?: readonly ReactNode[];
  transforms?: readonly ReactNode[];
  destinations?: readonly ReactNode[];
  pulse?: "dot" | "spike";
  hover?: boolean;
  isometric?: boolean;
}

export function Flow({
  sources = flowDefaultCopy.sources,
  transforms = flowDefaultCopy.transforms,
  destinations = flowDefaultCopy.destinations,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  fill = false,
  className,
}: FlowProps) {
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

  const sourceList = sources.length ? sources : flowDefaultCopy.sources;
  const transformList = transforms.length ? transforms : flowDefaultCopy.transforms;
  const destList = destinations.length ? destinations : flowDefaultCopy.destinations;

  const nodes = [
    ...SOURCE_POS.map((pos, i) => ({ pos, node: sourceList[i] ?? flowDefaultCopy.sources[i], group: "source" })),
    ...TRANSFORM_POS.map((pos, i) => ({ pos, node: transformList[i] ?? flowDefaultCopy.transforms[i], group: "transform" })),
    ...DEST_POS.map((pos, i) => ({ pos, node: destList[i] ?? flowDefaultCopy.destinations[i], group: "dest" })),
  ];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className="relative aspect-5/3 w-80"
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
          {EDGES.map((edge, t) => (
            <motion.path
              key={`fp${t}`}
              d={edge.d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="5 4"
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? path : undefined}
              custom={edge.delay}
              {...state}
            />
          ))}
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulseVisible && !hover ? PULSE_DELAY : 0 }}
            >
              {EDGES.map((edge, t) => (
                <FlowPulse key={`fd${t}`} d={edge.d} dur="2s" begin={`${edge.dotBegin}s`} pulse={pulse} gradientId={gradientId} />
              ))}
            </motion.g>
          )}
        </svg>
        {nodes.map((entry, t) => (
          <div
            key={`fn${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(entry.pos.x / CANVAS.w) * 100}%`, top: `${(entry.pos.y / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className={cn(
                "flex items-center justify-center overflow-hidden shadow-xs ring-2 ring-background",
                entry.group === "transform"
                  ? "size-10 rounded-2xl border border-primary bg-linear-to-b from-primary/60 to-primary/85 text-primary-foreground"
                  : "size-9 rounded-xl border bg-card text-foreground",
              )}
              variants={animated ? nodeAnim : undefined}
              custom={entry.pos.delay}
              {...state}
            >
              {entry.node}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
