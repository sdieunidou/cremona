import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Truck, ChevronRight } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface OrderRowProps extends VisualProps {
  order?: string;
  items?: string;
  total?: string;
  status?: "processing" | "shipped" | "refunded";
}

const statusStyles: Record<string, { pill: string; label: string }> = {
  processing: {
    pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Processing",
  },
  shipped: {
    pill: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Shipped",
  },
  refunded: {
    pill: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Refunded",
  },
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

export function OrderRow({
  order = "#ORD-10241",
  items = "3 items · Placed Sep 18",
  total = "$86.00",
  status = "processing",
  animated = false,
  trigger = "inView",
  className,
}: OrderRowProps) {
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

  const s = statusStyles[status] ?? statusStyles.processing!;

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
        variants={animated ? entrance : undefined}
        {...state}
        className="w-full max-w-96"
      >
        <motion.button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left shadow-xs transition-all duration-200 hover:border-ring/40 hover:shadow-sm",
            status === "shipped" && "flex-col items-stretch gap-2.5",
          )}
        >
          <motion.span
            className={cn(
              "flex items-center gap-3",
              status === "shipped" && "w-full",
            )}
            variants={animated ? item : undefined}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
              <img
                src="/media/placeholders/photo-02.jpg"
                alt=""
                className="size-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1 flex-col">
              <span className="font-mono text-xs font-medium text-foreground">{order}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{items}</span>
            </span>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                s.pill,
              )}
            >
              {status === "shipped" && <Truck className="size-2.5" strokeWidth={2.25} />}
              {s.label}
            </span>
            <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
              {total}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
          </motion.span>
          {status === "shipped" && (
            <motion.span
              className="flex items-center gap-1 px-1"
              variants={animated ? item : undefined}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="h-px w-7 bg-emerald-500/50" />
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="h-px w-7 bg-border" />
              <span className="size-1.5 rounded-full bg-muted-foreground/25" />
              <span className="ml-auto text-[9px] text-muted-foreground">Out for delivery</span>
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}