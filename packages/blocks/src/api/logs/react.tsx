import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Cloud, Cpu, Database, Globe, Server } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export type LogLevel = "info" | "warn" | "error" | "debug" | "success";

export interface LogLine {
  time: string;
  level: LogLevel;
  message: string;
}

export const logsDefaultCopy = {
  services: { api: "api-gateway", worker: "queue-worker", errors: "api-gateway" },
  lines: {
    api: [
      { time: "12:04:01", level: "info", message: "GET /v1/customers 200" },
      { time: "12:04:02", level: "debug", message: "cache hit page:1" },
      { time: "12:04:04", level: "warn", message: "slow query 812ms" },
      { time: "12:04:06", level: "info", message: "POST /v1/charges 201" },
      { time: "12:04:07", level: "error", message: "upstream timeout" },
      { time: "12:04:09", level: "success", message: "retry succeeded" },
    ],
    worker: [
      { time: "09:12:44", level: "info", message: "job:invoice picked up" },
      { time: "09:12:45", level: "debug", message: "rendering inv_88213" },
      { time: "09:12:47", level: "success", message: "completed in 2.4s" },
      { time: "09:12:48", level: "info", message: "job:email picked up" },
      { time: "09:12:50", level: "warn", message: "rate limited 5s" },
      { time: "09:12:55", level: "success", message: "completed in 6.9s" },
    ],
    errors: [
      { time: "18:30:11", level: "error", message: "500 /v1/subscriptions" },
      { time: "18:30:11", level: "debug", message: "at charge.js:82" },
      { time: "18:30:12", level: "error", message: "card_declined cus_9s2" },
      { time: "18:30:14", level: "warn", message: "error rate 4.2%" },
      { time: "18:30:16", level: "error", message: "502 unavailable" },
      { time: "18:30:19", level: "info", message: "breaker opened" },
    ],
  },
} as const;

const DEFAULT_SOURCES: ReactNode[] = [
  <Globe className="size-3.5" strokeWidth={2} />,
  <Server className="size-3.5" strokeWidth={2} />,
  <Database className="size-3.5" strokeWidth={2} />,
];

const LEVEL_LABELS: Record<LogLevel, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  debug: "DEBUG",
  success: "OK",
};

const LEVEL_PILL: Record<LogLevel, string> = {
  info: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  warn: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  error: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
  debug: "bg-muted text-muted-foreground ring-border",
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
};

const LEVEL_TEXT: Record<LogLevel, string> = {
  info: "text-foreground",
  warn: "text-foreground",
  error: "text-rose-600 dark:text-rose-400",
  debug: "text-muted-foreground/70",
  success: "text-foreground",
};

const CANVAS = { w: 416, h: 288 };
const SOURCE_X = 40;
const LINE_END_X = 160;
const PANEL_X = 284;
const PANEL_Y = 144;
const FIRST_SOURCE_Y = 68;
const MAX_SOURCES = 4;
const PATH_LENGTH = 100;
const PULSE_STROKE = 1;
const PULSE_DASH = 24;
const LINE_DELAY = 0.3;
const LINE_DELAY_UNIT = 0.1;
const PANEL_DELAY = 0.15;
const ROW_STAGGER = 0.1;
const ROW_DELAY_CHILDREN = 0.6;
const PULSE_DELAY = 1.4;

function sourceY(i: number, n: number): number {
  return n <= 1 ? PANEL_Y : FIRST_SOURCE_Y + (CANVAS.h - 136) * (i / (n - 1));
}

function linePath(x1: number, y1: number, x2: number, y2: number): string {
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

const gradientGlow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const node: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay },
  }),
};

const line: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.45, delay, ease: "easeOut" },
  }),
};

const panel = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22, delay: PANEL_DELAY },
  },
} as const;

const lines = {
  hidden: {},
  visible: { transition: { staggerChildren: ROW_STAGGER, delayChildren: ROW_DELAY_CHILDREN } },
} as const;

const logRow = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
} as const;

function LogPulse({
  d,
  dur,
  begin,
  pulse,
}: {
  d: string;
  dur: string;
  begin: string;
  pulse: "dot" | "line";
}) {
  if (pulse === "line") {
    return (
      <path
        d={d}
        pathLength={PATH_LENGTH}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth={PULSE_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${PULSE_DASH} 200`}
      >
        <animate attributeName="stroke-dashoffset" values={`${PULSE_DASH};-100`} dur={dur} repeatCount="indefinite" begin={begin} />
      </path>
    );
  }
  return (
    <g>
      <circle r={4.5} fill="currentColor" className="text-primary/15">
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
      <circle r={2.2} fill="currentColor" className="text-primary">
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
    </g>
  );
}

export interface LogsProps extends VisualProps {
  variant?: "api" | "worker" | "errors";
  service?: string;
  lines?: readonly LogLine[];
  sources?: readonly ReactNode[];
  pulse?: "dot" | "line";
  hover?: boolean;
  gradient?: boolean;
  isometric?: boolean;
}

export function Logs({
  variant = "api",
  service,
  lines: linesProp,
  sources = DEFAULT_SOURCES,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  isometric = false,
  className,
}: LogsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulseVisible = hover ? hovered : inView;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const serviceLabel = service ?? logsDefaultCopy.services[variant];
  const logLines = (linesProp ?? logsDefaultCopy.lines[variant]) as readonly LogLine[];
  const sourceList = (sources.length ? sources : DEFAULT_SOURCES).slice(0, MAX_SOURCES);
  const count = sourceList.length;
  const lastRow = logLines.length - 1;
  const paths = sourceList.map((_, t) => linePath(62, sourceY(t, count), LINE_END_X, PANEL_Y));

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
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
          {paths.map((d, t) => (
            <motion.path
              key={`lp${t}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? line : undefined}
              custom={LINE_DELAY + t * LINE_DELAY_UNIT - 0.1}
              {...state}
            />
          ))}
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulseVisible && !hover ? PULSE_DELAY : 0 }}
            >
              {paths.map((d, t) => (
                <LogPulse key={`ld${t}`} d={d} dur="2s" begin={`${-t * 0.65}s`} pulse={pulse} />
              ))}
            </motion.g>
          )}
        </svg>
        {sourceList.map((icon, t) => (
          <div
            key={`sn${t}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(SOURCE_X / CANVAS.w) * 100}%`, top: `${(sourceY(t, count) / CANVAS.h) * 100}%` }}
          >
            <motion.div
              className="flex size-11 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
              variants={animated ? node : undefined}
              custom={LINE_DELAY + t * LINE_DELAY_UNIT}
              {...state}
            >
              {icon}
            </motion.div>
          </div>
        ))}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(PANEL_X / CANVAS.w) * 100}%`, top: `${(PANEL_Y / CANVAS.h) * 100}%` }}
        >
          {gradient && (
            <>
              <motion.div
                className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? gradientGlow : undefined}
                {...state}
              />
              <motion.div
                className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
                variants={animated ? veil : undefined}
                {...state}
              />
            </>
          )}
          <motion.div
            className="relative w-62 overflow-hidden rounded-xl border bg-card shadow-md ring-2 ring-background"
            variants={animated ? panel : undefined}
            {...state}
          >
            <div className="flex items-center gap-2 border-b bg-muted/40 px-2 py-1.5">
              <div className="flex gap-1">
                <div className="size-1.5 rounded-full bg-rose-400" />
                <div className="size-1.5 rounded-full bg-amber-400" />
                <div className="size-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="truncate text-[10px] text-muted-foreground">{serviceLabel}</span>
            </div>
            <motion.div
              className="flex flex-col font-mono text-[10px] leading-tight"
              variants={animated ? lines : undefined}
              {...state}
            >
              {logLines.map((line2, t) => (
                <motion.div
                  key={t}
                  className="relative border-b border-border/40 last:border-b-0"
                  variants={animated ? logRow : undefined}
                >
                  {animated && t === lastRow && (
                    <motion.span
                      className="absolute inset-0 bg-primary/6"
                      animate={pulseVisible ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                      transition={
                        pulseVisible
                          ? { duration: 2.4, ease: "easeInOut", repeat: Infinity, delay: PULSE_DELAY }
                          : { duration: 0.4, ease: "easeOut" }
                      }
                    />
                  )}
                  <span className="relative flex items-center gap-1.5 px-2 py-1.5">
                    <span className="shrink-0 text-muted-foreground/80 tabular-nums">{line2.time}</span>
                    <span
                      className={`w-9 shrink-0 rounded px-0.75 py-px text-center text-[8px] font-semibold ring-1 ring-inset ${LEVEL_PILL[line2.level]}`}
                    >
                      {LEVEL_LABELS[line2.level]}
                    </span>
                    <span className={`truncate ${LEVEL_TEXT[line2.level]}`}>{line2.message}</span>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
