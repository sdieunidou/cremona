import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Truck, ChevronRight } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type OrderStatus = "processing" | "shipped" | "refunded";

export interface OrderRowProps extends VisualProps {
  /** Order number. */
  order?: string;
  /** Secondary line: item count, date… */
  items?: string;
  /** Formatted order total. */
  total?: string;
  status?: OrderStatus;
  /** Status pill text per status. */
  statusLabels?: Partial<Record<OrderStatus, string>>;
  /** Tracking note shown under a shipped order. */
  tracking?: string;
  /** Product thumbnail URL; a neutral tile when empty. */
  image?: string;
  /** Thumbnail alternative text; empty by default, the order number sits next to it. */
  alt?: string;
  /** Order details link. */
  href?: string;
}

const defaultStatusLabels: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  refunded: "Refunded",
};

/** Tint and dot carry the status color; the text stays foreground so it reads in every theme. */
const statusTones: Record<OrderStatus, { pill: string; dot: string }> = {
  processing: { pill: "bg-warning/10", dot: "bg-warning" },
  shipped: { pill: "bg-info/10", dot: "text-info" },
  refunded: { pill: "bg-destructive/10", dot: "bg-destructive" },
};

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent, onClick: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
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
  statusLabels,
  tracking = "Out for delivery",
  image = "/media/placeholders/photo-02.jpg",
  alt = "",
  href = "#",
  animated = false,
  trigger = "inView",
  fill = false,
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

  const tone = statusTones[status] ?? statusTones.processing;
  const label = { ...defaultStatusLabels, ...statusLabels }[status] ?? status;
  const shipped = status === "shipped";

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        variants={animated ? entrance : undefined}
        {...state}
        className={cn("w-full", fill ? "self-center" : "max-w-96")}
      >
        <a
          href={href}
          className="@container flex w-full flex-col gap-2.5 rounded-lg border bg-card p-3 text-left shadow-xs transition-all duration-200 hover:border-ring/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          {...noFocus}
        >
          <motion.span
            className="flex w-full items-center gap-3"
            variants={animated ? item : undefined}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {image && <img src={image} alt={alt} className="size-full object-cover" />}
            </span>
            {/* stacked below 20rem of row width, one line above */}
            <span className="flex min-w-0 flex-1 flex-col gap-1.5 @xs:flex-row @xs:items-center @xs:gap-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-mono text-xs font-medium text-foreground">
                  {order}
                </span>
                <span className="mt-0.5 truncate text-xs text-muted-foreground">{items}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground",
                    tone.pill,
                  )}
                >
                  {shipped ? (
                    <Truck className={cn("size-2.5", tone.dot)} strokeWidth={2.25} />
                  ) : (
                    <span className={cn("size-1.5 rounded-full", tone.dot)} />
                  )}
                  {label}
                </span>
                <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
                  {total}
                </span>
              </span>
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
          </motion.span>
          {shipped && (
            <motion.span
              className="flex items-center gap-1 px-1"
              variants={animated ? item : undefined}
            >
              <span className="size-1.5 rounded-full bg-success" />
              <span className="h-px w-7 bg-success/50" />
              <span className="size-1.5 rounded-full bg-success" />
              <span className="h-px w-7 bg-border" />
              <span className="size-1.5 rounded-full bg-muted-foreground/25" />
              <span className="ml-auto text-[9px] text-muted-foreground">{tracking}</span>
            </motion.span>
          )}
        </a>
      </motion.div>
    </div>
  );
}
