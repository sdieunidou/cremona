import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Webhook as WebhookIcon, X, Zap } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export type WebhookVariant = "retry" | "success" | "failed";

export interface Attempt {
  status?: number;
  label: string;
}

export const webhookDefaultCopy = {
  events: { retry: "charge.succeeded", success: "customer.created", failed: "invoice.payment_failed" },
  eventIds: { retry: "evt_1H8kPz", success: "evt_7Qa2Mv", failed: "evt_3Rd9Xb" },
  attempts: {
    retry: [{ status: 502, label: "Bad Gateway" }, { label: "Timed out" }, { status: 200, label: "OK" }],
    success: [{ status: 200, label: "OK" }],
    failed: [{ status: 500, label: "Server Error" }, { status: 500, label: "Server Error" }, { status: 500, label: "Server Error" }],
  },
  summaries: {
    retry: "Delivered after 3 attempts · 10.2s",
    success: "Delivered on first attempt · 240ms",
    failed: "Giving up after 3 attempts",
  },
} as const;

const CANVAS = { w: 416, h: 288 };
const SOURCE_X = 44;
const DEST_X = 372;
const CENTER_X = 208;
const NODE_Y = 144;
const PILL_Y = 24;
const SUMMARY_Y = 272;
const MAX_ATTEMPTS = 3;
const PATH_LENGTH = 100;
const PULSE_STROKE = 1;
const PULSE_DASH = 10;
const CURVE_OFFSET = 12;
const PILL_DELAY = 0.15;
const SOURCE_NODE_DELAY = 0.3;
const DEST_NODE_DELAY = 0.4;
const ARC_DELAY = 0.5;
const ARC_DELAY_UNIT = 0.14;
const CHIP_DELAY = 0.65;
const CHIP_DELAY_UNIT = 0.14;
const SUMMARY_DELAY = 1.25;
const PULSE_DELAY = 1.6;

function attemptOffsets(n: number): number[] {
  if (n <= 1) return [0];
  if (n === 2) return [-62, 62];
  return [-88, 0, 88];
}

function arcPath(offset: number): string {
  const t = NODE_Y + (offset / 88) * CURVE_OFFSET;
  return `M 72,${t} C 150,${NODE_Y + offset} 266,${NODE_Y + offset} 344,${t}`;
}

function chipY(offset: number): number {
  return (NODE_Y + (offset / 88) * CURVE_OFFSET + 3 * (NODE_Y + offset)) / 4;
}

function isOk(attempt: Attempt): boolean {
  return attempt.status !== undefined && attempt.status < 300;
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

const node: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay },
  }),
};

const arc: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.55, delay, ease: "easeOut" },
  }),
};

const eventPill = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22, delay: PILL_DELAY },
  },
} as const;

const attemptChip: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 15, delay: CHIP_DELAY + i * CHIP_DELAY_UNIT },
  }),
};

const summary = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, delay: SUMMARY_DELAY, ease: "easeOut" } },
} as const;

function WebhookPulse({
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

export interface WebhookProps extends VisualProps {
  variant?: WebhookVariant;
  event?: string;
  eventId?: string;
  attempts?: readonly Attempt[];
  summary?: string;
  pulse?: "dot" | "line";
  hover?: boolean;
  isometric?: boolean;
}

export function Webhook({
  variant = "retry",
  event,
  eventId,
  attempts,
  summary: summaryProp,
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  className,
}: WebhookProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulseVisible = hover ? hovered : inView;
  const state = animated
    ? { initial: "hidden", animate: inView ? "visible" : "hidden" }
    : ({} as Record<string, unknown>);

  const eventLabel = event ?? webhookDefaultCopy.events[variant];
  const eventIdLabel = eventId ?? webhookDefaultCopy.eventIds[variant];
  const summaryLabel = summaryProp ?? webhookDefaultCopy.summaries[variant];
  const attemptList = (attempts?.length ? attempts : webhookDefaultCopy.attempts[variant]) as readonly Attempt[];
  const list = attemptList.slice(0, MAX_ATTEMPTS);
  const offsets = attemptOffsets(list.length);
  const paths = offsets.map(arcPath);

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
              key={`arc${t}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeLinecap="round"
              className="text-muted-foreground/50"
              variants={animated ? arc : undefined}
              custom={ARC_DELAY + t * ARC_DELAY_UNIT}
              {...state}
            />
          ))}
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulseVisible }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulseVisible && !hover ? PULSE_DELAY : 0 }}
            >
              {paths.map((d, t) =>
                isOk(list[t]!) ? (
                  <WebhookPulse key={`ap${t}`} d={d} dur="2.6s" begin="0s" pulse={pulse} />
                ) : null,
              )}
            </motion.g>
          )}
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CENTER_X / CANVAS.w) * 100}%`, top: `${(PILL_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex h-7 items-center gap-1.5 rounded-full border bg-card px-1.5 shadow-xs ring-2 ring-background"
            variants={animated ? eventPill : undefined}
            {...state}
          >
            <Zap className="size-3.5 shrink-0 text-primary" />
            <span className="text-[11px] font-medium text-foreground">{eventLabel}</span>
            <span className="flex h-4.5 items-center justify-center rounded-full bg-primary/5 px-1 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {eventIdLabel}
            </span>
          </motion.div>
        </div>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(SOURCE_X / CANVAS.w) * 100}%`, top: `${(NODE_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-2 ring-background"
            variants={animated ? node : undefined}
            custom={SOURCE_NODE_DELAY}
            {...state}
          >
            <Zap className="size-5" strokeWidth={2} />
          </motion.div>
        </div>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(DEST_X / CANVAS.w) * 100}%`, top: `${(NODE_Y / CANVAS.h) * 100}%` }}
        >
          <motion.div
            className="flex size-12 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
            variants={animated ? node : undefined}
            custom={DEST_NODE_DELAY}
            {...state}
          >
            <WebhookIcon className="size-5" strokeWidth={2} />
          </motion.div>
        </div>
        {list.map((attempt, t) => {
          const ok = isOk(attempt);
          return (
            <div
              key={`chip${t}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(CENTER_X / CANVAS.w) * 100}%`, top: `${(chipY(offsets[t]!) / CANVAS.h) * 100}%` }}
            >
              <motion.div
                className="flex h-6 items-center gap-1.5 rounded-full border bg-card px-1 shadow-xs ring-2 ring-background"
                variants={animated ? attemptChip : undefined}
                custom={t}
                {...state}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                    ok
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {ok ? <Check className="size-2.5" strokeWidth={3} /> : <X className="size-2.5" strokeWidth={3} />}
                </span>
                {/* exact renderToString bytes: `#<!-- -->1` */}
                <span
                  className="text-[10px] font-semibold text-foreground"
                  dangerouslySetInnerHTML={{ __html: `#<!-- -->${t + 1}` }}
                />
                <span
                  className={`text-[10px] font-medium ${ok ? "text-muted-foreground" : "text-rose-600/80 dark:text-rose-400/80"}`}
                >
                  {attempt.label}
                </span>
                <span
                  className={`rounded-full px-1 font-mono text-[9px] font-semibold ring-1 ring-inset ${
                    attempt.status === undefined
                      ? "bg-muted text-muted-foreground ring-border"
                      : ok
                        ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400"
                  }`}
                >
                  {attempt.status ?? "\u00B7\u00B7\u00B7"}
                </span>
              </motion.div>
            </div>
          );
        })}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(CENTER_X / CANVAS.w) * 100}%`, top: `${(SUMMARY_Y / CANVAS.h) * 100}%` }}
        >
          <motion.span
            className="text-[10px] font-medium text-muted-foreground"
            variants={animated ? summary : undefined}
            {...state}
          >
            {summaryLabel}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
