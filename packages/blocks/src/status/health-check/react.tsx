"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { Globe, Database, KeyRound, HardDrive, Cloud, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type ServiceStatus = "operational" | "degraded" | "down";

export interface HealthCheckItem {
  /** Defaults to a server icon. */
  icon?: LucideIcon;
  name: string;
  region: string;
  /** Any other value renders as a neutral status labelled with the value itself. */
  status: ServiceStatus;
  latency: string;
}

export interface HealthCheckLabels {
  /** Status of each service, by status value. */
  operational: string;
  degraded: string;
  down: string;
  /** Header summary when every service is operational. */
  summaryOperational: string;
  /** Header summary when a service is degraded and none is down. */
  summaryDegraded: string;
  /** Header summary when a service is down. */
  summaryDown: string;
}

export const healthCheckDefaultLabels: HealthCheckLabels = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Outage",
  summaryOperational: "All systems normal",
  summaryDegraded: "Partial degradation",
  summaryDown: "Outage detected",
};

const statusMeta: Record<ServiceStatus, { dot: string; ping: string; text: string }> = {
  operational: {
    dot: "bg-success",
    ping: "bg-success/60",
    text: "text-success",
  },
  degraded: {
    dot: "bg-warning",
    ping: "bg-warning/60",
    text: "text-warning",
  },
  down: {
    dot: "bg-destructive",
    ping: "bg-destructive/60",
    text: "text-destructive",
  },
};

function metaFor(status: string) {
  return (
    statusMeta[status as ServiceStatus] ?? {
      dot: "bg-muted-foreground",
      ping: "bg-muted-foreground/60",
      text: "text-muted-foreground",
    }
  );
}

const latencyColor = (status: ServiceStatus): string =>
  status === "degraded"
    ? "text-warning"
    : status === "down"
      ? "text-muted-foreground/60"
      : "text-muted-foreground";

export const healthCheckDefaultItems: HealthCheckItem[] = [
  {
    icon: Globe,
    name: "API Gateway",
    region: "us-east-1",
    status: "operational",
    latency: "42 ms",
  },
  {
    icon: Database,
    name: "Database",
    region: "primary · replica",
    status: "operational",
    latency: "8 ms",
  },
  {
    icon: KeyRound,
    name: "Auth Service",
    region: "us-east-1",
    status: "operational",
    latency: "31 ms",
  },
  {
    icon: HardDrive,
    name: "File Storage",
    region: "us-west-2",
    status: "degraded",
    latency: "412 ms",
  },
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
  /** Shown in place of the list when `items` is empty. */
  emptyLabel?: string;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<HealthCheckLabels>;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function HealthCheck({
  title = "System Status",
  items = healthCheckDefaultItems,
  emptyLabel = "No services",
  labels,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
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
  const loop = useLoopActive(ref, animated);
  const copy = { ...healthCheckDefaultLabels, ...labels };
  const statusLabel = (status: string) =>
    Object.hasOwn(statusMeta, status)
      ? copy[status as ServiceStatus]
      : status.charAt(0).toUpperCase() + status.slice(1);
  const allOperational = items.every((i) => i.status === "operational");
  const headline =
    items.length === 0
      ? ""
      : allOperational
        ? copy.summaryOperational
        : items.some((i) => i.status === "down")
          ? copy.summaryDown
          : copy.summaryDegraded;
  const meta =
    items.length === 0
      ? metaFor("")
      : allOperational
        ? statusMeta.operational
        : items.some((i) => i.status === "down")
          ? statusMeta.down
          : statusMeta.degraded;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full",
          !fill && "max-w-80",
          "rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform",
          fadeOut && "mask-b-from-60%",
          fill && "flex h-full flex-col",
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
        <div className={cn("relative rounded-2xl border bg-card shadow-xs", fill && "flex-1")}>
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span
                  className={cn("absolute inset-0 rounded-full", loop && "animate-ping", meta.ping)}
                />
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
            {items.length === 0 && (
              <motion.div
                className="px-3 py-4 text-center text-[10px] text-muted-foreground"
                variants={animated ? itemAnim : undefined}
              >
                {emptyLabel}
              </motion.div>
            )}
            {items.map((item, i) => {
              const Icon = item.icon ?? Server;
              const s = metaFor(item.status);
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
                    <span className="truncate text-xs font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {item.region}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "w-10 text-right font-mono text-[9px]",
                        latencyColor(item.status),
                      )}
                    >
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
                      {statusLabel(item.status)}
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
