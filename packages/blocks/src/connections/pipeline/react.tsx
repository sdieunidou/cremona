"use client";

import { isValidElement, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import {
  ChartColumn,
  Cloud,
  Cpu,
  Database,
  FileText,
  Image,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

/** A node's content: an icon component (drawn at the node's icon size) or any element. */
export type PipelineNode = ReactNode | LucideIcon;

export const pipelineDefaultCopy = {
  logo: <Cpu className="size-5" strokeWidth={1.5} />,
  inputs: [
    <Database className="size-4" strokeWidth={2} />,
    <FileText className="size-4" strokeWidth={2} />,
    <Image className="size-4" strokeWidth={2} />,
  ],
  outputs: [
    <ChartColumn className="size-4" strokeWidth={2} />,
    <Mail className="size-4" strokeWidth={2} />,
    <Cloud className="size-4" strokeWidth={2} />,
  ],
} as const;

const CANVAS = { w: 280, h: 180 };
const FIRST_NODE_Y = 28;
const INPUT_X = 28;
const OUTPUT_X = 252;
const LOGO_X = 140;
const LOGO_Y = 90;
const INPUT_DELAY = 0.3;
const OUTPUT_DELAY = 0.6;
const DELAY_UNIT = 0.1;

function nodeY(i: number, n: number): number {
  return n <= 1 ? CANVAS.h / 2 : FIRST_NODE_Y + ((CANVAS.h - 56) * i) / (n - 1);
}

function cubic(x1: number, y1: number, x2: number, y2: number): string {
  const mid = (x1 + x2) / 2;
  return `M ${x1},${y1} C ${mid},${y1} ${mid},${y2} ${x2},${y2}`;
}

function isIcon(node: PipelineNode): node is LucideIcon {
  return (
    typeof node === "function" ||
    (typeof node === "object" && node !== null && !isValidElement(node) && "$$typeof" in node)
  );
}

function nodeContent(node: PipelineNode, logo = false): ReactNode {
  if (!isIcon(node)) return node;
  const Icon = node;
  return logo ? (
    <Icon className="size-5" strokeWidth={1.5} />
  ) : (
    <Icon className="size-4" strokeWidth={2} />
  );
}

const NODE =
  "flex size-9 items-center justify-center overflow-hidden rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background";
const EMPTY_NODE =
  "flex size-9 items-center justify-center rounded-xl border border-dashed border-muted-foreground/40 bg-card/60 ring-2 ring-background";

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

const logoAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 18, delay: 0.15 },
  },
} as const;

function PipelinePulse({
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
        <line
          x1={-18}
          y1={0}
          x2={0}
          y2={0}
          stroke={`url(#${gradientId})`}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
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

export interface PipelineProps extends VisualProps {
  /** The hub; `null` draws none. */
  logo?: PipelineNode;
  /** An empty list draws one empty, dashed slot. */
  inputs?: readonly PipelineNode[];
  /** An empty list draws one empty, dashed slot. */
  outputs?: readonly PipelineNode[];
  pulse?: "dot" | "spike";
  hover?: boolean;
  isometric?: boolean;
}

export function Pipeline({
  logo = pipelineDefaultCopy.logo,
  inputs = pipelineDefaultCopy.inputs,
  outputs = pipelineDefaultCopy.outputs,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  fill = false,
  className,
}: PipelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const loop = useLoopActive(ref, animated);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulseVisible = hover ? hovered : inView;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const inputList: readonly PipelineNode[] = inputs.length ? inputs : [null];
  const outputList: readonly PipelineNode[] = outputs.length ? outputs : [null];
  const inputDelay = (i: number) => INPUT_DELAY + i * DELAY_UNIT;
  const outputDelay = (i: number) => OUTPUT_DELAY + i * DELAY_UNIT;
  const inputPaths = inputList.map((_, i) =>
    cubic(INPUT_X, nodeY(i, inputList.length), LOGO_X, LOGO_Y),
  );
  const outputPaths = outputList.map((_, i) =>
    cubic(LOGO_X, LOGO_Y, OUTPUT_X, nodeY(i, outputList.length)),
  );
  const pulseDelay = OUTPUT_DELAY + (outputList.length - 1) * DELAY_UNIT + 0.45;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className={cn("relative aspect-14/9 w-72", fill && "max-w-full self-center")}
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
              <linearGradient
                id={gradientId}
                gradientUnits="userSpaceOnUse"
                x1={-18}
                y1={0}
                x2={0}
                y2={0}
              >
                <stop offset="0" stopColor="var(--color-primary)" stopOpacity={0} />
                <stop offset="1" stopColor="var(--color-primary)" stopOpacity={0.9} />
              </linearGradient>
            </defs>
          )}
          {inputPaths.map((d, i) => (
            <motion.path
              key={`ip${i}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="5 4"
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? path : undefined}
              custom={inputDelay(i) - 0.1}
              {...state}
            />
          ))}
          {outputPaths.map((d, i) => (
            <motion.path
              key={`op${i}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="5 4"
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? path : undefined}
              custom={outputDelay(i) - 0.1}
              {...state}
            />
          ))}
          {animated && loop && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: pulseVisible && !hover ? pulseDelay : 0,
              }}
            >
              {inputPaths.map((d, i) =>
                inputList[i] == null ? null : (
                  <PipelinePulse
                    key={`id${i}`}
                    d={d}
                    dur="2s"
                    begin={`${-i * 0.7}s`}
                    pulse={pulse}
                    gradientId={gradientId}
                  />
                ),
              )}
              {outputPaths.map((d, i) =>
                outputList[i] == null ? null : (
                  <PipelinePulse
                    key={`od${i}`}
                    d={d}
                    dur="2s"
                    begin={`${-(i * 0.7 + 0.3)}s`}
                    pulse={pulse}
                    gradientId={gradientId}
                  />
                ),
              )}
            </motion.g>
          )}
        </svg>
        {inputList.map((node, i) => (
          <div
            key={`in${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(INPUT_X / CANVAS.w) * 100}%`,
              top: `${(nodeY(i, inputList.length) / CANVAS.h) * 100}%`,
            }}
          >
            <motion.div
              className={node == null ? EMPTY_NODE : NODE}
              variants={animated ? nodeAnim : undefined}
              custom={inputDelay(i)}
              {...state}
            >
              {node == null ? null : nodeContent(node)}
            </motion.div>
          </div>
        ))}
        {logo && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(LOGO_X / CANVAS.w) * 100}%`, top: `${(LOGO_Y / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className="flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-primary bg-linear-to-b from-primary/60 to-primary/85 text-primary-foreground shadow-md ring-3 ring-primary/10"
              variants={animated ? logoAnim : undefined}
              {...state}
            >
              {nodeContent(logo, true)}
            </motion.div>
          </div>
        )}
        {outputList.map((node, i) => (
          <div
            key={`on${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(OUTPUT_X / CANVAS.w) * 100}%`,
              top: `${(nodeY(i, outputList.length) / CANVAS.h) * 100}%`,
            }}
          >
            <motion.div
              className={node == null ? EMPTY_NODE : NODE}
              variants={animated ? nodeAnim : undefined}
              custom={outputDelay(i)}
              {...state}
            >
              {node == null ? null : nodeContent(node)}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
