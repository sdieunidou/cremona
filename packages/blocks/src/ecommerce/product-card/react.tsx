import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Star, ShoppingCart, Bell } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ProductCardLabels {
  add: string;
  soldOut: string;
  notify: string;
  shipping: string;
  /** `{rating}` is replaced by the rating value. */
  rating: string;
}

export interface ProductCardProps extends VisualProps {
  title?: string;
  category?: string;
  /** Formatted price. */
  price?: string;
  /** Formatted price before the sale, struck through on sale. */
  compareAt?: string;
  /** Review count. */
  reviews?: string;
  /** Average rating out of 5: that many stars are filled (rounded). */
  rating?: number;
  sale?: boolean;
  /** Sale badge text. */
  discount?: string;
  stock?: "in" | "out";
  /** Reveal the add-to-cart button over the image on hover (always shown on touch screens). */
  hoverAdd?: boolean;
  /** Product image URL; a neutral tile when empty. */
  image?: string;
  /** Image alternative text; defaults to the title. */
  alt?: string;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<ProductCardLabels>;
}

const defaultLabels: ProductCardLabels = {
  add: "Add to cart",
  soldOut: "Sold out",
  notify: "Notify me",
  shipping: "Free shipping",
  rating: "Rated {rating} out of 5",
};

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
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
  rating = 4,
  sale = false,
  discount = "-20%",
  stock = "in",
  hoverAdd = false,
  image = "/media/placeholders/photo-01.jpg",
  alt,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const t = { ...defaultLabels, ...labels };
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
  const onSale = sale && !outOfStock;
  const stars = Math.round(Math.min(5, Math.max(0, rating)));

  const addButton = (
    <button
      type="button"
      className={cn(
        "flex h-8 w-full items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        outOfStock
          ? "border bg-background text-foreground hover:bg-accent"
          : "bg-primary text-primary-foreground hover:opacity-90",
      )}
      {...noFocus}
    >
      {outOfStock ? (
        <Bell className="size-3.5" strokeWidth={2.25} />
      ) : (
        <ShoppingCart className="size-3.5" strokeWidth={2.25} />
      )}
      {outOfStock ? t.notify : t.add}
    </button>
  );

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.article
        className={cn(
          "group/product flex w-full flex-col",
          !fill && "max-w-64",
          "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className={cn("relative bg-muted", fill ? "min-h-0 flex-1" : "aspect-square")}>
          {image && (
            <img
              src={image}
              alt={alt ?? title}
              className={cn(
                fill ? "absolute inset-0" : "",
                "size-full object-cover",
                outOfStock && "grayscale",
              )}
            />
          )}
          {onSale && (
            <motion.span
              className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground"
              variants={animated ? badgeIn : undefined}
              {...state}
            >
              {discount}
            </motion.span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
                {t.soldOut}
              </span>
            </div>
          )}
          {hoverAdd && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-200 group-focus-within/product:opacity-100 group-hover/product:opacity-100 [@media(hover:none)]:opacity-100">
              {addButton}
            </div>
          )}
        </div>
        <motion.div
          className="flex flex-col gap-1.5 p-4"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.p
            className="text-xs text-muted-foreground"
            variants={animated ? item : undefined}
          >
            {category}
          </motion.p>
          <motion.h3
            className="text-sm font-semibold text-foreground"
            variants={animated ? item : undefined}
          >
            {title}
          </motion.h3>
          <motion.div className="flex items-center gap-1" variants={animated ? item : undefined}>
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3",
                    i < stars ? "fill-warning text-warning" : "text-muted-foreground/30",
                  )}
                  strokeWidth={2}
                />
              ))}
            </span>
            <span className="sr-only">{t.rating.replace("{rating}", String(rating))}</span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </motion.div>
          <motion.div
            className="mt-1 flex items-center justify-between"
            variants={animated ? item : undefined}
          >
            <span className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-foreground tabular-nums">{price}</span>
              {onSale && <s className="text-xs text-muted-foreground tabular-nums">{compareAt}</s>}
            </span>
            {!hoverAdd && !outOfStock && (
              <span className="text-[10px] font-medium text-primary">{t.shipping}</span>
            )}
          </motion.div>
          {!hoverAdd && <div className="mt-1">{addButton}</div>}
        </motion.div>
      </motion.article>
    </div>
  );
}
