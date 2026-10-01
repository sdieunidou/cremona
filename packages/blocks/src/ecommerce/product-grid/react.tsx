import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ProductGridItem {
  name: string;
  /** Category, matched against the active filter. */
  category: string;
  /** Formatted price. */
  price: string;
  /** Image URL; a neutral tile when omitted. */
  image?: string;
}

export interface ProductGridProps extends VisualProps {
  /** Active filter: "All" or one of `filters`. */
  filter?: string;
  /** Filter chips, "All" first. */
  filters?: string[];
  products?: ProductGridItem[];
  title?: string;
  /** Result count label; `{count}` is replaced by `count`. */
  countLabel?: string;
  /** Total number of results (defaults to six per product shown). */
  count?: number;
}

const defaultProducts: ProductGridItem[] = [
  { name: "Aero Runner 2", category: "Shoes", price: "$128" },
  { name: "Court Classic", category: "Shoes", price: "$96" },
  { name: "Trail GTX", category: "Shoes", price: "$142" },
  { name: "Merino Crew", category: "Apparel", price: "$76" },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const chip = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const cards = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
} as const;

const card = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 18 },
  },
} as const;

export function ProductGrid({
  filter = "All",
  filters = ["All", "Shoes", "Apparel"],
  products = defaultProducts,
  title = "New arrivals",
  countLabel = "{count} items",
  count,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ProductGridProps) {
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

  const all = filter === filters[0];
  const visible = all ? products.slice(0, 4) : products.filter((p) => p.category === filter);

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "@container w-full",
          !fill && "max-w-96",
          "rounded-lg border bg-card shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="p-2.5">
          <motion.div
            className="flex items-center justify-between"
            variants={animated ? content : undefined}
            {...state}
          >
            <motion.span
              className="text-[9px] font-semibold text-foreground"
              variants={animated ? chip : undefined}
            >
              {title}
            </motion.span>
            <motion.span
              className="text-[8px] text-muted-foreground"
              variants={animated ? chip : undefined}
            >
              {countLabel.replace("{count}", String(count ?? visible.length * 6))}
            </motion.span>
          </motion.div>
          <motion.div
            className="mt-2 flex flex-wrap gap-1"
            variants={animated ? content : undefined}
            {...state}
          >
            {filters.map((f) => (
              <motion.span
                key={f}
                className={cn(
                  "flex h-4.5 items-center rounded-full px-2 text-[9px] font-medium transition-all duration-200",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/75 text-muted-foreground",
                )}
                variants={animated ? chip : undefined}
              >
                {f}
              </motion.span>
            ))}
          </motion.div>
          {/* two columns (three when filtered), four once the card is 32rem wide */}
          <motion.div
            className={cn(
              "mt-2 grid gap-1.5",
              all ? "grid-cols-2 @lg:grid-cols-4" : "grid-cols-3 @lg:grid-cols-4",
            )}
            variants={animated ? cards : undefined}
            {...state}
          >
            {visible.map((p, i) => (
              <motion.div
                key={i}
                className="overflow-hidden rounded-md border border-border/50 bg-card"
                variants={animated ? card : undefined}
              >
                <div className="relative aspect-[16/10] bg-muted">
                  {p.image ? (
                    <img src={p.image} alt="" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1/2 w-1/2 rounded-[3px] bg-muted-foreground/10" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                  <span className="truncate text-[8px] font-medium text-foreground">{p.name}</span>
                  <span className="text-[8px] font-semibold text-foreground tabular-nums">
                    {p.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
