import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface TooltipProps extends VisualProps {
  /** Rich bubbles with a title and body. */
  rich?: boolean;
  /** Title for rich bubbles. */
  title?: string;
}

type Side = "top" | "right" | "bottom" | "left";

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
    transition: { type: "spring", stiffness: 420, damping: 18, delay: i * 0.06 },
  },
});

function Bubble({
  side,
  rich,
  title,
  i,
}: {
  side: Side;
  rich: boolean;
  title: string;
  i: number;
}) {
  return (
    <motion.div
      variants={bubbleIn(i)}
      role="tooltip"
      className={cn(
        "relative bg-primary text-primary-foreground shadow-md",
        rich ? "w-32 rounded-lg p-3" : "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
      )}
    >
      {rich ? (
        <>
          <p className="text-xs font-semibold">{title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-primary-foreground/70">
            {richBody}
          </p>
        </>
      ) : (
        sideText[side]
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
  animated = false,
  trigger = "inView",
  className,
}: TooltipProps) {
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

  const buttonClasses =
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

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
        className="grid max-w-md grid-cols-2 gap-x-8 gap-y-7"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="flex flex-col items-center gap-2">
          <Bubble side="top" rich={rich} title={title} i={0} />
          <button type="button" className={buttonClasses}>
            Hover
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={buttonClasses}>
            Hover
          </button>
          <Bubble side="right" rich={rich} title={title} i={1} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <button type="button" className={buttonClasses}>
            Hover
          </button>
          <Bubble side="bottom" rich={rich} title={title} i={2} />
        </div>
        <div className="flex items-center gap-2">
          <Bubble side="left" rich={rich} title={title} i={3} />
          <button type="button" className={buttonClasses}>
            Hover
          </button>
        </div>
      </motion.div>
    </div>
  );
}
