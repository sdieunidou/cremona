import { Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Mail, Search, Sparkles, Ticket } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface ToolCall {
  name: string;
  args: string;
  result: string;
  duration: string;
  icon?: ReactNode;
}

export const toolsDefaultCopy = {
  title: "Tool calls",
  tools: [
    {
      name: "search_docs",
      args: 'query: "refund policy"',
      result: "3 matches",
      duration: "142ms",
      icon: <Search className="size-3.5" strokeWidth={2} />,
    },
    {
      name: "create_ticket",
      args: 'priority: "high"',
      result: "#4821",
      duration: "310ms",
      icon: <Ticket className="size-3.5" strokeWidth={2} />,
    },
    {
      name: "send_email",
      args: 'to: "customer"',
      result: "delivered",
      duration: "88ms",
      icon: <Mail className="size-3.5" strokeWidth={2} />,
    },
  ],
} as const;

const MAX_TOOLS = 4;
const HEADER_DELAY = 0.12;
const ROW_DELAY = 0.24;
const ROW_DELAY_UNIT = 0.1;
const FOOTER_DELAY = 0.5;
const STEP_MS = 1200;
const LOOP_PAD = 1.8;
const LOOP_INITIAL = 1;
const SPIN_DURATION = 0.8;
const STATUS_DURATION = 0.3;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

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

const header = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: HEADER_DELAY, ease: "easeOut" } },
} as const;

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26, delay: ROW_DELAY + i * ROW_DELAY_UNIT },
  }),
};

const footer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: FOOTER_DELAY, ease: "easeOut" } },
} as const;

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
  { x: 10.2, y: 24.8, size: 3, color: "bg-primary", duration: 5.34, delay: -4.61, driftX: 4.6, driftY: 13.2, opacity: 0.58 },
  { x: 90.6, y: 32.4, size: 3, color: "bg-chart-1", duration: 6.28, delay: -2.37, driftX: -3.4, driftY: 12.1, opacity: 0.62 },
  { x: 18.4, y: 72.6, size: 2, color: "bg-chart-2", duration: 6.11, delay: -1.28, driftX: -2.5, driftY: 15.8, opacity: 0.46 },
  { x: 84.1, y: 66.9, size: 3, color: "bg-chart-3", duration: 4.24, delay: -3.55, driftX: 5.7, driftY: 13.1, opacity: 0.64 },
  { x: 4.6, y: 50.3, size: 2, color: "bg-chart-4", duration: 4.58, delay: -5.27, driftX: 6.4, driftY: 15.6, opacity: 0.52 },
  { x: 95.2, y: 58.1, size: 3, color: "bg-primary", duration: 4.36, delay: -1.41, driftX: -3.2, driftY: 14.4, opacity: 0.44 },
  { x: 24.3, y: 11.6, size: 2, color: "bg-chart-1", duration: 4.88, delay: -5.72, driftX: 4.1, driftY: 9.4, opacity: 0.49 },
  { x: 76.8, y: 15.2, size: 3, color: "bg-chart-4", duration: 7.42, delay: -5.33, driftX: 6.6, driftY: 12.9, opacity: 0.56 },
  { x: 29.1, y: 88.4, size: 3, color: "bg-primary", duration: 5.57, delay: -2.86, driftX: -2.5, driftY: 10.2, opacity: 0.6 },
  { x: 70.4, y: 91.2, size: 2, color: "bg-chart-3", duration: 4.97, delay: -1.18, driftX: 5.1, driftY: 8.5, opacity: 0.48 },
  { x: 2.8, y: 84.7, size: 3, color: "bg-primary", duration: 5.16, delay: -5.44, driftX: 4.3, driftY: 13.7, opacity: 0.45 },
  { x: 96.4, y: 86.3, size: 2, color: "bg-chart-2", duration: 4.71, delay: -2.58, driftX: -3.1, driftY: 15.5, opacity: 0.51 },
  { x: 46.2, y: 6.4, size: 3, color: "bg-chart-4", duration: 6.22, delay: -5.02, driftX: -2.8, driftY: 9.6, opacity: 0.5 },
  { x: 57.6, y: 94.1, size: 2, color: "bg-primary", duration: 6.47, delay: -5.61, driftX: 1.6, driftY: 9.2, opacity: 0.54 },
];

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-1/4 left-1/4 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-3/4 left-3/4 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

/** Split `key: value` args at the first colon (key keeps the colon). */
function splitArgs(args: string): [string, string] {
  const i = args.indexOf(":");
  return i === -1 ? [args, ""] : [args.slice(0, i + 1), args.slice(i + 1)];
}

function ToolRow({
  tool,
  status,
  index,
  animated,
  spinActive,
  state,
}: {
  tool: ToolCall;
  status: "pending" | "running" | "done";
  index: number;
  animated: boolean;
  spinActive: boolean;
  state: Record<string, unknown>;
}) {
  const pending = status === "pending";
  const running = status === "running";
  const done = status === "done";
  const [key, value] = splitArgs(tool.args);
  const statusTransition = { duration: STATUS_DURATION, ease: "easeOut" } as const;
  return (
    <motion.div
      className="relative flex items-center gap-2.5 rounded-xl px-2 py-1.5"
      variants={animated ? row : undefined}
      custom={index}
      {...state}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-xl bg-primary/5 ring-1 ring-primary/20 ring-inset"
        initial={false}
        animate={{ opacity: +!!running }}
        transition={statusTransition}
      />
      <span className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border bg-card">
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-lg bg-primary/5 ring-1 ring-primary/20"
          initial={false}
          animate={{ opacity: +!pending }}
          transition={statusTransition}
        />
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-muted-foreground"
          initial={false}
          animate={{ opacity: +!!pending }}
          transition={statusTransition}
        >
          {tool.icon}
        </motion.span>
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-primary"
          initial={false}
          animate={{ opacity: +!pending }}
          transition={statusTransition}
        >
          {tool.icon}
        </motion.span>
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-mono text-[11px] font-medium text-foreground">{tool.name}</span>
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <span className="min-w-0 truncate text-muted-foreground">
            <span className="text-muted-foreground/50">{"{ "}</span>
            {key}
            <span className="text-foreground/70">{value}</span>
            <span className="text-muted-foreground/50">{" }"}</span>
          </span>
          <motion.span
            className="flex shrink-0 items-center gap-1 text-emerald-600 dark:text-emerald-400"
            initial={false}
            animate={{ opacity: +!!done, x: done ? 0 : -4 }}
            transition={statusTransition}
          >
            <span className="text-muted-foreground/40">{"\u2192"}</span>
            {tool.result}
          </motion.span>
        </span>
      </span>
      <span className="relative flex h-4 w-16 shrink-0 items-center justify-end">
        <motion.span
          className="absolute inset-y-0 right-0 flex items-center"
          initial={false}
          animate={{ opacity: +!!pending }}
          transition={statusTransition}
        >
          <span className="block size-1.5 rounded-full bg-muted-foreground/25" />
        </motion.span>
        <motion.span
          className="absolute inset-y-0 right-0 flex items-center"
          initial={false}
          animate={{ opacity: +!!running }}
          transition={statusTransition}
        >
          <motion.span
            className="block size-3.5 rounded-full border-[1.5px] border-primary/20 border-t-primary"
            animate={{ rotate: spinActive ? 360 : 0 }}
            transition={
              spinActive ? { duration: SPIN_DURATION, ease: "linear", repeat: Infinity } : { duration: 0 }
            }
          />
        </motion.span>
        <motion.span
          className="absolute inset-y-0 right-0 flex items-center gap-1.5"
          initial={false}
          animate={{ opacity: +!!done, scale: done ? 1 : 0.7 }}
          transition={done ? { type: "spring", stiffness: 420, damping: 18 } : statusTransition}
        >
          <span className="text-[9px] text-muted-foreground tabular-nums">{tool.duration}</span>
          <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 ring-inset dark:text-emerald-400">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        </motion.span>
      </span>
    </motion.div>
  );
}

export interface ToolsProps extends VisualProps {
  title?: string;
  tools?: readonly ToolCall[];
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

export function Tools({
  title = toolsDefaultCopy.title,
  tools = toolsDefaultCopy.tools,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  gradient = true,
  fadeOut = false,
  isometric = false,
  className,
}: ToolsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const toolList = ((tools.length ? tools : toolsDefaultCopy.tools) as readonly ToolCall[]).slice(0, MAX_TOOLS);
  const count = toolList.length;
  const [current, setCurrent] = useState(-1);
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = animated && (hover ? hovered : inView) && ticked;
  const drifting = animated && inView && ticked;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);
  const cursor = active ? current : animated ? -1 : count;
  const doneCount = Math.max(0, Math.min(cursor, count));

  useEffect(() => {
    if (!active) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const total = count * STEP_MS + LOOP_PAD * 1000;
    const run = () => {
      timers.length = 0;
      setCurrent(0);
      for (let i = 1; i <= count; i++) at(() => setCurrent(i), i * STEP_MS);
      at(run, total);
    };
    at(run, hover ? 0 : LOOP_INITIAL * 1000);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [active, hover, count]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={
        animated && hover
          ? () => {
              setCurrent(0);
              setHovered(true);
            }
          : undefined
      }
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
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
        className={`relative w-full max-w-96 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <Fragment>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? gradientGlow : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </Fragment>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center gap-2 border-b px-3 py-2.5"
            variants={animated ? header : undefined}
            {...state}
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground">{title}</span>
            <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {count}
            </span>
          </motion.div>
          <div className="flex flex-col gap-0.5 p-1.5">
            {toolList.map((tool, t) => (
              <ToolRow
                key={t}
                tool={tool}
                status={t < cursor ? "done" : t === cursor ? "running" : "pending"}
                index={t}
                animated={animated}
                spinActive={active}
                state={state}
              />
            ))}
          </div>
          <motion.div
            className="flex items-center gap-2 border-t px-3 py-2"
            variants={animated ? footer : undefined}
            {...state}
          >
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="block h-full w-full origin-left rounded-full bg-primary"
                initial={false}
                animate={{ scaleX: animated && !inView ? 0 : doneCount / count }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </span>
            {/* exact renderToString bytes: `0<!-- -->/<!-- -->3` */}
            <span
              className="text-[10px] text-muted-foreground tabular-nums"
              dangerouslySetInnerHTML={{ __html: `${doneCount}<!-- -->/<!-- -->${count}` }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
