"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

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

const frame = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface TimelineItem {
  /** Drawn in place of the title bar. */
  title: string;
  /** Drawn in place of the first line bar. */
  date?: string;
  /** Drawn in place of the second line bar. */
  description?: string;
}

/** Four unnamed events, the first one current. */
const defaultItems: readonly (string | TimelineItem)[] = ["", "", "", ""];

/** A count instead of a list means that many blank entries (at most 12). */
function blanks<T>(count: number, blank: T): T[] {
  return Array.from({ length: Math.min(Math.max(Math.floor(count) || 0, 0), 12) }, () => blank);
}

export interface TimelineProps extends VisualProps {
  /** One event per entry (a title, or a title with a date and a description), or a count. */
  items?: readonly (string | TimelineItem)[] | number;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

export function Timeline({
  items = defaultItems,
  animated = false,
  trigger = "inView",
  gradient = true,
  fadeOut = false,
  isometric = false,
  fill = false,
  className,
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const events = typeof items === "number" ? blanks(items, "") : items;
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

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("w-full", !fill && "max-w-72", "p-8.5", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative p-1.5">
          <motion.div variants={animated ? frame : undefined} {...state}>
            <div className="absolute -inset-8.5 bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] bg-size-[24px_24px] dark:opacity-50" />
            <div className="absolute inset-0 border border-border/75" />
            <div className="absolute -top-6 left-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute -top-6 right-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute top-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute top-0 -right-6 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
            <div className="absolute -bottom-6 left-0 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute right-0 -bottom-6 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute bottom-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute -right-6 bottom-0 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
          </motion.div>
          {gradient && !fadeOut && (
            <>
              <motion.div
                className="absolute inset-x-2.5 bottom-1.5 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? glowAnim : undefined}
                {...state}
              />
              <motion.div
                className="absolute inset-x-1 bottom-1 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
                variants={animated ? veilAnim : undefined}
                {...state}
              />
            </>
          )}
          <div className="relative rounded-xl border bg-card px-4 py-6 shadow-xs">
            <motion.div
              className="mx-auto flex w-full max-w-24 flex-col"
              variants={animated ? list : undefined}
              {...state}
            >
              {events.map((raw, i) => {
                const event =
                  typeof raw === "object" && raw !== null ? raw : { title: String(raw ?? "") };
                return (
                  <motion.div key={i} className="flex gap-3" variants={animated ? item : undefined}>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "size-2.75 rounded-full",
                          i === 0 ? "bg-primary" : "bg-muted-foreground/20",
                        )}
                      />
                      {i < events.length - 1 && <div className="h-4.5 w-px bg-border" />}
                    </div>
                    <div className={cn("flex flex-col gap-0.5", event.title && "min-w-0")}>
                      {event.title ? (
                        <span className="truncate text-[8px] leading-none font-medium text-foreground/80">
                          {event.title}
                        </span>
                      ) : (
                        <div className="h-0.75 w-10 rounded-full bg-foreground/10" />
                      )}
                      {event.date ? (
                        <span className="truncate text-[7px] leading-none text-muted-foreground">
                          {event.date}
                        </span>
                      ) : (
                        <div className="mt-0.5 h-0.5 w-16 rounded-full bg-muted-foreground/12" />
                      )}
                      {event.description ? (
                        <span className="truncate text-[6px] leading-tight text-muted-foreground">
                          {event.description}
                        </span>
                      ) : (
                        <div className="h-0.5 w-12 rounded-full bg-muted-foreground/12" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
