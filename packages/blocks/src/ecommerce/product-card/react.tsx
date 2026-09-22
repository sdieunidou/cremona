import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Star, ShoppingCart } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ProductCardProps extends VisualProps {
  title?: string;
  category?: string;
  price?: string;
  compareAt?: string;
  reviews?: string;
  sale?: boolean;
  discount?: string;
  stock?: "in" | "out";
  hoverAdd?: boolean;
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const badgeIn = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 17, delay: 0.3 },
  },
} as const;

export function ProductCard({
  title = "Aero Runner 2",
  category = "Running · Men",
  price = "$128.00",
  compareAt = "$160.00",
  reviews = "214",
  sale = false,
  discount = "-20%",
  stock = "in",
  hoverAdd = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ProductCardProps) {
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

  const outOfStock = stock === "out";

  const addButton = (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      disabled={outOfStock}
      className={cn(
        "flex h-8 w-full items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]",
        outOfStock
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground hover:opacity-90",
      )}
    >
      {!outOfStock && <ShoppingCart className="size-3.5" strokeWidth={2.25} />}
      {outOfStock ? "Sold out" : "Add to cart"}
    </button>
  );

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
        className={cn("group/product w-full", !fill && "max-w-64", "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="relative aspect-square bg-muted">
          <img
            src="/media/placeholders/photo-01.jpg"
            alt={title}
            className={cn("size-full object-cover", outOfStock && "grayscale")}
          />
          {sale && !outOfStock && (
            <motion.span
              className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white"
              variants={animated ? badgeIn : undefined}
              {...state}
            >
              {discount}
            </motion.span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
                Sold out
              </span>
            </div>
          )}
          {hoverAdd && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-200 group-hover/product:opacity-100">
              {addButton}
            </div>
          )}
        </div>
        <motion.div
          className="flex flex-col gap-1.5 p-4"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.p className="text-xs text-muted-foreground" variants={animated ? item : undefined}>
            {category}
          </motion.p>
          <motion.p
            className="text-sm font-semibold text-foreground"
            variants={animated ? item : undefined}
          >
            {title}
          </motion.p>
          <motion.div
            className="flex items-center gap-1"
            variants={animated ? item : undefined}
          >
            <span className="flex items-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="size-3 fill-amber-400 text-amber-400" strokeWidth={2} />
              ))}
              <Star className="size-3 text-muted-foreground/30" strokeWidth={2} />
            </span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </motion.div>
          <motion.div
            className="mt-1 flex items-center justify-between"
            variants={animated ? item : undefined}
          >
            <span className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-foreground tabular-nums">{price}</span>
              {sale && !outOfStock && (
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  {compareAt}
                </span>
              )}
            </span>
            {!hoverAdd && (
              <span className="text-[10px] font-medium text-primary">Free shipping</span>
            )}
          </motion.div>
          {!hoverAdd && <div className="mt-1">{addButton}</div>}
        </motion.div>
      </motion.div>
    </div>
  );
}