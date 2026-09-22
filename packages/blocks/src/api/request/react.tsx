import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Globe, Server, Timer } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type RequestVariant = "get" | "post" | "error";

export const requestDefaultCopy = {
  methods: { get: "GET", post: "POST", error: "POST" },
  endpoints: { get: "/v1/customers/cus_9s2", post: "/v1/subscriptions", error: "/v1/charges" },
  statuses: { get: 200, post: 201, error: 422 },
  statusTexts: { get: "OK", post: "Created", error: "Unprocessable" },
  latencies: { get: "142ms", post: "268ms", error: "94ms" },
  responses: {
    get: ['{ "id": "cus_9s2", "plan": "scale", "seats": 24 }'],
    post: ['{ "id": "sub_4Tn", "status": "active", "amount": 4900 }'],
    error: ['{ "error": { "code": "expired_card", "param": "exp" } }'],
  },
} as const;

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  POST: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  PATCH: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  PUT: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  DELETE: "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
};

const CANVAS = { w: 416, h: 288 };
const LEFT_X = 44;
const RIGHT_X = 372;
const NODE_Y = 144;
const PILL_Y = 32;
const PANEL_Y = 220;
const PANEL_X = 208;
const PATH_LENGTH = 100;
const PULSE_STROKE = 1;
const PULSE_DASH = 10;
const CURVE_IN = "M 72,132 C 150,70 266,70 344,132";
const CURVE_OUT = "M 344,156 C 266,218 150,218 72,156";
const LEFT_NODE_DELAY = 0.2;
const CURVE_IN_DELAY = 0.4;
const PILL_DELAY = 0.6;
const PANEL_DELAY = 0.85;
const CHIP_DELAY = 1.05;
const ROW_STAGGER = 0.09;
const ROW_DELAY_CHILDREN = 1.1;
const PULSE_DELAY = 1.5;
const GLOW_DELAY = 1.1;

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
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: GLOW_DELAY, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: GLOW_DELAY, ease: "easeOut" } },
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
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

const methodPill = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: PILL_DELAY },
  },
} as const;

const panel = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: PANEL_DELAY },
  },
} as const;

const statusChip = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: CHIP_DELAY },
  },
} as const;

const rows = {
  hidden: {},
  visible: { transition: { staggerChildren: ROW_STAGGER, delayChildren: ROW_DELAY_CHILDREN } },
} as const;

const row = {
  hidden: { opacity: 0, y: 3 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

function RequestPulse({
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

const JSON_TOKEN_RE = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+\.?\d*)|(true|false|null)|(\s+)|([^\s])/g;

function tokenColor(token: string): string {
  if (/^"/.test(token) && /:\s*$/.test(token)) return "text-violet-600 dark:text-violet-400";
  if (/^"/.test(token)) return "text-emerald-600 dark:text-emerald-400";
  if (/^-?\d/.test(token)) return "text-sky-600 dark:text-sky-400";
  if (/^(true|false|null)$/.test(token)) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

function JSONLine({ text }: { text: string }) {
  const tokens = text.match(JSON_TOKEN_RE) ?? [];
  return (
    <span className="whitespace-pre">
      {tokens.map((token, t) => (
        <span key={t} className={tokenColor(token)}>
          {token}
        </span>
      ))}
    </span>
  );
}

export interface RequestProps extends VisualProps {
  variant?: RequestVariant;
  method?: string;
  endpoint?: string;
  status?: number;
  statusText?: string;
  latency?: string;
  response?: readonly string[];
  pulse?: "dot" | "line";
  hover?: boolean;
  gradient?: boolean;
  isometric?: boolean;
}

export function Request({
  variant = "get",
  method,
  endpoint,
  status,
  statusText,
  latency,
  response,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  isometric = false,
  fill = false,
  className,
}: RequestProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulseVisible = hover ? hovered : inView;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const methodLabel = method ?? requestDefaultCopy.methods[variant];
  const endpointLabel = endpoint ?? requestDefaultCopy.endpoints[variant];
  const statusValue = status ?? requestDefaultCopy.statuses[variant];
  const statusTextLabel = statusText ?? requestDefaultCopy.statusTexts[variant];
  const latencyLabel = latency ?? requestDefaultCopy.latencies[variant];
  const responseLines = (response ?? requestDefaultCopy.responses[variant]) as readonly string[];
  const isError = statusValue >= 400;
  const chipClass = isError
    ? "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400"
    : "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), className)}
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
          <motion.path
            d={CURVE_IN}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeLinecap="round"
            className="text-muted-foreground/50"
            variants={animated ? line : undefined}
            custom={CURVE_IN_DELAY}
            {...state}
          />
          <motion.path
            d={CURVE_OUT}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeLinecap="round"
            className="text-muted-foreground/50"
            variants={animated ? line : undefined}
            custom={0.5}
            {...state}
          />
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulseVisible && !hover ? PULSE_DELAY : 0 }}
            >
              <RequestPulse d={CURVE_IN} dur="2.6s" begin="0s" pulse={pulse} />
              <RequestPulse d={CURVE_OUT} dur="2.6s" begin="-1.3s" pulse={pulse} />
            </motion.g>
          )}
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(LEFT_X / CANVAS.w) * 100}%`, top: `${(NODE_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex size-12 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
            variants={animated ? node : undefined}
            custom={LEFT_NODE_DELAY}
            {...state}
          >
            <Globe className="size-5" strokeWidth={2} />
          </motion.div>
        </div>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(RIGHT_X / CANVAS.w) * 100}%`, top: `${(NODE_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-2 ring-background"
            variants={animated ? node : undefined}
            custom={0.30000000000000004}
            {...state}
          >
            <Server className="size-5" strokeWidth={2} />
          </motion.div>
        </div>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(PANEL_X / CANVAS.w) * 100}%`, top: `${(PILL_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex h-7 items-center gap-2 rounded-full border bg-card pr-3 pl-1.5 shadow-xs ring-2 ring-background"
            variants={animated ? methodPill : undefined}
            {...state}
          >
            <span className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold ring-1 ring-inset ${METHOD_STYLES[methodLabel]}`}>
              {methodLabel}
            </span>
            <span className="max-w-52 truncate text-[11px] font-medium text-foreground">{endpointLabel}</span>
          </motion.div>
        </div>
        <div
          className="absolute -translate-x-1/2"
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
            className="relative w-72 overflow-hidden rounded-xl border bg-card shadow-md ring-2 ring-background"
            variants={animated ? panel : undefined}
            {...state}
          >
            <div className="flex items-center gap-1.5 border-b bg-muted/40 px-2 py-1.5">
              <motion.span
                className={`flex items-center gap-1 rounded-full px-1.75 py-0.5 text-[9px] font-semibold ring-1 ring-inset ${chipClass}`}
                variants={animated ? statusChip : undefined}
                {...state}
                /* exact renderToString bytes: `200<!-- --> <!-- -->OK` */
                dangerouslySetInnerHTML={{
                  __html: `<span class="size-1.25 rounded-full ${isError ? "bg-rose-500" : "bg-emerald-500"}"></span>${statusValue}<!-- --> <!-- -->${statusTextLabel}`,
                }}
              />
              <span className="ml-auto flex items-center gap-0.75 text-[9px] text-muted-foreground tabular-nums">
                <Timer className="size-2.5" strokeWidth={2.5} />
                {latencyLabel}
              </span>
            </div>
            <motion.div
              className="flex flex-col gap-0.5 px-2.5 py-2 font-mono text-[10px] leading-relaxed"
              variants={animated ? rows : undefined}
              {...state}
            >
              {responseLines.map((text, t) => (
                <motion.div key={t} variants={animated ? row : undefined}>
                  <JSONLine text={text} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
