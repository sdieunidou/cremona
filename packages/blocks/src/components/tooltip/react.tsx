"use client";

import { useId, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type Side = "top" | "right" | "bottom" | "left";

export interface TooltipProps extends VisualProps {
  /** Rich bubbles with a title and body. */
  rich?: boolean;
  /** Title for rich bubbles. */
  title?: string;
  /** Bubble text (the body of a rich bubble; default: a demo text per side). */
  content?: string;
  /** Show one side only (default: the four sides). */
  side?: Side;
  /** Text of the trigger buttons. */
  triggerLabel?: string;
  /** The four-side showcase spreads over the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const SIDES: Side[] = ["top", "right", "bottom", "left"];

const sideText: Record<Side, string> = {
  top: "Deploy to staging",
  right: "Last run 2m ago",
  bottom: "Retry failed checks",
  left: "View run logs",
};

const richBody = "Hold ⌘ while clicking to open the run in a new tab.";

const arrowClasses: Record<Side, string> = {
  top: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
  right: "right-full top-1/2 translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const bubbleIn = (i: number): Variants => ({
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, delay: i * 0.07 },
  },
});

function Bubble({
  id,
  side,
  rich,
  title,
  text,
  i,
}: {
  id: string;
  side: Side;
  rich: boolean;
  title: string;
  text: string;
  i: number;
}) {
  return (
    <motion.div
      variants={bubbleIn(i)}
      id={id}
      role="tooltip"
      className={cn(
        "relative bg-primary text-primary-foreground shadow-md",
        rich
          ? "w-32 rounded-lg p-3"
          : "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
      )}
    >
      {rich ? (
        <>
          <p className="text-xs font-semibold">{title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-primary-foreground/70">{text}</p>
        </>
      ) : (
        text
      )}
      <span
        aria-hidden="true"
        className={cn("absolute size-2.5 rotate-45 bg-primary", arrowClasses[side])}
      />
    </motion.div>
  );
}

export function Tooltip({
  rich = false,
  title = "Pro tip",
  content,
  side,
  triggerLabel = "Hover",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const buttonClasses = cn(
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground",
    focusRing,
  );
  const shown = side ? [side] : SIDES;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "grid gap-x-8 gap-y-7",
          shown.length > 1 ? "grid-cols-2" : "grid-cols-1",
          fill ? "w-full self-center" : "max-w-md",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {shown.map((s, i) => {
          const bubbleId = `${id}-${s}`;
          const bubble = (
            <Bubble
              id={bubbleId}
              side={s}
              rich={rich}
              title={title}
              text={content ?? (rich ? richBody : sideText[s])}
              i={i}
            />
          );
          const button = (
            <button type="button" aria-describedby={bubbleId} className={buttonClasses}>
              {triggerLabel}
            </button>
          );
          const vertical = s === "top" || s === "bottom";
          return (
            <div
              key={s}
              className={cn(
                "flex items-center gap-2",
                vertical ? "flex-col" : fill && "justify-center",
              )}
            >
              {s === "top" || s === "left" ? (
                <>
                  {bubble}
                  {button}
                </>
              ) : (
                <>
                  {button}
                  {bubble}
                </>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
