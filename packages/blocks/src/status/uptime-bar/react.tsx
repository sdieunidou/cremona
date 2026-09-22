import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type UptimeStatus = "operational" | "degraded" | "outage";

const barColors: Record<"ok" | "degraded" | "outage", string> = {
  ok: "bg-emerald-500/85 dark:bg-emerald-400/80",
  degraded: "bg-amber-500/90 dark:bg-amber-400/90",
  outage: "bg-destructive/85",
};

const statusMeta: Record<UptimeStatus, { label: string; dot: string; ping: string; badge: string }> = {
  operational: {
    label: "All systems operational",
    dot: "bg-emerald-500",
    ping: "bg-emerald-500/60",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  degraded: {
    label: "Degraded performance",
    dot: "bg-amber-500",
    ping: "bg-amber-500/60",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  outage: {
    label: "Major outage",
    dot: "bg-destructive",
    ping: "bg-destructive/60",
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

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

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.5 },
  },
} as const;

const barsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.012, delayChildren: 0.25 } },
} as const;

const barAnim = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

export interface UptimeBarProps extends VisualProps {
  title?: string;
  days?: number;
  uptime?: string;
  incidents?: readonly number[];
  outages?: readonly number[];
  status?: UptimeStatus;
  showLegend?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function UptimeBar({
  title = "Uptime",
  days = 60,
  uptime,
  incidents = [13, 14, 31, 49],
  outages = [22],
  status,
  showLegend = true,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: UptimeBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};
  const computedUptime = (((days - incidents.length - outages.length) / days) * 100).toFixed(2) + "%";
  const uptimeLabel = uptime ?? computedUptime;
  const meta =
    statusMeta[status ?? (outages.length > 0 ? "outage" : incidents.length > 0 ? "degraded" : "operational")];
  const incidentSet = new Set(incidents);
  const outageSet = new Set(outages);
  const hasIncidents = incidents.length > 0;
  const hasOutages = outages.length > 0;
  const footerAnim = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, delay: 0.6 + days * 0.012, ease: "easeOut" },
    },
  } as const;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={cn("relative w-full", !fill && "max-w-80", "rounded-3xl border border-border/50 bg-muted/75 p-1.5")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative flex flex-col gap-3 rounded-2xl border bg-card p-3.5 shadow-xs">
          <motion.div
            className="flex items-center justify-between"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className={cn("absolute inset-0 animate-ping rounded-full", meta.ping)} />
                <span className={cn("relative size-2 rounded-full", meta.dot)} />
              </span>
              <span className="text-xs font-semibold text-foreground">{title}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{meta.label}</span>
            </div>
            <motion.span
              className={cn("rounded-full border px-1.75 py-px text-[9px] font-semibold", meta.badge)}
              variants={animated ? badgeAnim : undefined}
              {...state}
            >
              {uptimeLabel}
            </motion.span>
          </motion.div>
          <motion.div
            className="flex h-7 items-stretch gap-px"
            variants={animated ? barsAnim : undefined}
            {...state}
          >
            {Array.from({ length: days }).map((_, i) => {
              const color = outageSet.has(i)
                ? barColors.outage
                : incidentSet.has(i)
                  ? barColors.degraded
                  : barColors.ok;
              return (
                <motion.div
                  key={i}
                  className={cn("flex-1 origin-bottom rounded-xs", color)}
                  variants={animated ? barAnim : undefined}
                />
              );
            })}
          </motion.div>
          <motion.div
            className="flex items-center justify-between text-[10px] font-medium text-muted-foreground"
            variants={animated ? footerAnim : undefined}
            {...state}
          >
            {/* renderToString emitted `60<!-- --> days ago`; two text nodes for parity */}
            <span dangerouslySetInnerHTML={{ __html: `${days}<!-- --> days ago` }} />
            {showLegend && (hasIncidents || hasOutages) && (
              <div className="flex items-center gap-2.5">
                {hasIncidents && (
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Degraded
                  </span>
                )}
                {hasOutages && (
                  <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    Outage
                  </span>
                )}
              </div>
            )}
            <span>Today</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
