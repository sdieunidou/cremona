import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Globe, Database, KeyRound, HardDrive, Cloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

type ServiceStatus = "operational" | "degraded" | "down";

export interface HealthCheckItem {
  icon: LucideIcon;
  name: string;
  region: string;
  status: ServiceStatus;
  latency: string;
}

const statusMeta: Record<ServiceStatus, { dot: string; ping: string; label: string; text: string }> = {
  operational: {
    dot: "bg-emerald-500",
    ping: "bg-emerald-500/60",
    label: "Operational",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  degraded: {
    dot: "bg-amber-500",
    ping: "bg-amber-500/60",
    label: "Degraded",
    text: "text-amber-600 dark:text-amber-400",
  },
  down: {
    dot: "bg-destructive",
    ping: "bg-destructive/60",
    label: "Outage",
    text: "text-destructive",
  },
};

const latencyColor = (status: ServiceStatus): string =>
  status === "degraded"
    ? "text-amber-600 dark:text-amber-400"
    : status === "down"
      ? "text-muted-foreground/60"
      : "text-muted-foreground";

export const healthCheckDefaultItems: HealthCheckItem[] = [
  { icon: Globe, name: "API Gateway", region: "us-east-1", status: "operational", latency: "42 ms" },
  { icon: Database, name: "Database", region: "primary · replica", status: "operational", latency: "8 ms" },
  { icon: KeyRound, name: "Auth Service", region: "us-east-1", status: "operational", latency: "31 ms" },
  { icon: HardDrive, name: "File Storage", region: "us-west-2", status: "degraded", latency: "412 ms" },
  { icon: Cloud, name: "CDN", region: "edge · 218 PoPs", status: "operational", latency: "12 ms" },
];

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

const listAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const itemAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
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

export interface HealthCheckProps extends VisualProps {
  title?: string;
  items?: readonly HealthCheckItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function HealthCheck({
  title = "System Status",
  items = healthCheckDefaultItems,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: HealthCheckProps) {
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
  const allOperational = items.every((i) => i.status === "operational");
  const headline = allOperational
    ? "All systems normal"
    : items.some((i) => i.status === "down")
      ? "Outage detected"
      : "Partial degradation";
  const meta = allOperational
    ? statusMeta.operational
    : items.some((i) => i.status === "down")
      ? statusMeta.down
      : statusMeta.degraded;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={cn(
          "relative w-full max-w-80 rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
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
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className={cn("absolute inset-0 animate-ping rounded-full", meta.ping)} />
                <span className={cn("relative size-2 rounded-full", meta.dot)} />
              </span>
              <span className="text-xs font-semibold text-foreground">{title}</span>
            </div>
            <span className={cn("text-[10px] font-medium", meta.text)}>{headline}</span>
          </div>
          <motion.div
            className="flex flex-col divide-y"
            variants={animated ? listAnim : undefined}
            {...state}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              const s = statusMeta[item.status];
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.25"
                  variants={animated ? itemAnim : undefined}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                    <Icon className="size-3.5" strokeWidth={2} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-xs font-medium text-foreground">{item.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{item.region}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className={cn("w-10 text-right font-mono text-[9px]", latencyColor(item.status))}>
                      {item.latency}
                    </span>
                    <motion.div
                      className={cn(
                        "flex w-19 items-center gap-1 rounded-full text-[9px] font-semibold",
                        s.text,
                      )}
                      variants={animated ? badgeAnim : undefined}
                    >
                      <span className={cn("size-1.5 rounded-full", s.dot)} />
                      {s.label}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
