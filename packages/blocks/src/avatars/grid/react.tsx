"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface GridMember {
  initials: string;
  image?: string;
  tint?: string;
}

export const gridDefaultCopy: { members: GridMember[] } = {
  members: [
    { initials: "JC", tint: "bg-chart-1/20 text-foreground" },
    { initials: "AM", tint: "bg-chart-5/20 text-foreground" },
    {
      initials: "KL",
      tint: "bg-chart-3/20 text-foreground",
    },
    {
      initials: "DP",
      tint: "bg-chart-2/20 text-foreground",
    },
    {
      initials: "SR",
      tint: "bg-chart-4/20 text-foreground",
    },
    { initials: "TN", tint: "bg-chart-1/20 text-foreground" },
  ],
};

const CELL = 40;
const GAP_X = 48;
const GAP_Y = 40;
const PADDING = 40;

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const lines = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.1, ease: "easeOut" } },
} as const;

const gridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 14 },
  },
} as const;

export interface GridMember {
  initials: string;
  image?: string;
  tint?: string;
}

export interface AvatarGridProps extends VisualProps {
  members?: GridMember[];
  isometric?: boolean;
}

export function AvatarGrid({
  members = gridDefaultCopy.members,
  animated = false,
  trigger = "inView",
  isometric = false,
  fill = false,
  className,
}: AvatarGridProps) {
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
  const cols = members.length === 4 ? 2 : Math.min(members.length, 3);
  const rows = Math.ceil(members.length / (cols || 1));
  const innerWidth = cols * CELL + Math.max(0, cols - 1) * GAP_X;
  const innerHeight = rows * CELL + Math.max(0, rows - 1) * GAP_Y;
  const width = innerWidth + 80;
  const height = innerHeight + 80;
  const verticalLines = Array.from({ length: cols }, (_, i) => PADDING + i * 88 + CELL / 2);
  const horizontalLines = Array.from({ length: rows }, (_, i) => PADDING + i * 80 + CELL / 2);

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("relative", fill && "self-center")}
        style={{
          width,
          height,
          ...(!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : {}),
        }}
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        <motion.div className="absolute inset-0" variants={animated ? lines : undefined} {...state}>
          {horizontalLines.map((y, i) => (
            <div
              key={`h-${i}`}
              className="absolute inset-x-0 border-t border-dashed border-border"
              style={{
                top: y,
                maskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              }}
            />
          ))}
          {verticalLines.map((x, i) => (
            <div
              key={`v-${i}`}
              className="absolute inset-y-0 border-l border-dashed border-border"
              style={{
                left: x,
                maskImage:
                  "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
              }}
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute grid"
          style={{
            top: PADDING,
            left: PADDING,
            gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
            gap: `${GAP_Y}px ${GAP_X}px`,
          }}
          variants={animated ? gridStagger : undefined}
          {...state}
        >
          {members.map((member, i) => (
            <motion.div
              key={i}
              className="relative flex items-center justify-center will-change-transform"
              variants={animated ? item : undefined}
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.initials}
                  className="size-10 rounded-full object-cover shadow-lg ring-2 ring-background"
                />
              ) : (
                <div
                  className={`flex size-10 items-center justify-center rounded-full text-xs font-semibold shadow-lg ring-2 ring-background ${member.tint ?? ""}`}
                >
                  {member.initials}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
