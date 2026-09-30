import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { X, Lock, Tag, ShoppingBag } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CartDrawerItem {
  name: string;
  qty: number;
  /** Unit price, in `currency`. */
  price: number;
  /** Image URL; a neutral tile when omitted. */
  image?: string;
  /** Image alternative text; empty by default, the name sits next to it. */
  alt?: string;
}

export interface CartDrawerLabels {
  title: string;
  close: string;
  decrease: string;
  increase: string;
  subtotal: string;
  shipping: string;
  free: string;
  checkout: string;
  continue: string;
  empty: string;
  emptyHint: string;
}

export interface CartDrawerProps extends VisualProps {
  /** Line items: the count badge, line totals and totals are computed from them. */
  items?: CartDrawerItem[];
  /** ISO 4217 currency of every amount. */
  currency?: string;
  /** Locale used to format amounts. */
  locale?: string;
  /** Shipping cost; 0 reads "Free". */
  shipping?: number;
  /** Apply the promo code below the totals. */
  discount?: boolean;
  promoCode?: string;
  /** Promo discount, in percent of the subtotal. */
  promoPercent?: number;
  /** Show the empty cart. */
  empty?: boolean;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<CartDrawerLabels>;
}

const defaultLabels: CartDrawerLabels = {
  title: "Your cart",
  close: "Close cart",
  decrease: "Decrease quantity of",
  increase: "Increase quantity of",
  subtotal: "Subtotal",
  shipping: "Shipping",
  free: "Free",
  checkout: "Checkout",
  continue: "Continue shopping",
  empty: "Your cart is empty",
  emptyHint: "Browse products to get started",
};

const defaultItems: CartDrawerItem[] = [
  { name: "Aero Runner 2", qty: 1, price: 128, image: "/media/placeholders/photo-01.jpg" },
  { name: "Trail socks", qty: 2, price: 14, image: "/media/placeholders/photo-02.jpg" },
  { name: "Field cap", qty: 1, price: 22, image: "/media/placeholders/photo-03.jpg" },
];

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const drawer = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 18, delay: 0.15 },
  },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const stepper = cn(
  "flex size-3.5 items-center justify-center rounded-[3px] border text-[9px] leading-none text-muted-foreground transition-colors duration-200 hover:text-foreground",
  focusRing,
);

/** Amounts are rounded to cents before they are summed or displayed. */
const cents = (n: number) => Math.round(n * 100) / 100;

export function CartDrawer({
  items = defaultItems,
  currency = "USD",
  locale = "en-US",
  shipping = 0,
  discount = false,
  promoCode = "WELCOME10",
  promoPercent = 10,
  empty = false,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CartDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const id = useId();
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

  const money = new Intl.NumberFormat(locale, { style: "currency", currency });
  const lines = empty ? [] : items;
  const count = lines.reduce((n, it) => n + it.qty, 0);
  const subtotal = cents(lines.reduce((sum, it) => sum + cents(it.price * it.qty), 0));
  const off = discount ? cents((subtotal * promoPercent) / 100) : 0;
  const total = cents(subtotal - off + shipping);

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border bg-card",
          fill ? "h-full" : "h-80 max-w-96",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="p-3" aria-hidden="true">
          <div className="h-2.5 w-20 rounded-full bg-muted-foreground/15" />
          <div className="mt-2 h-px w-full bg-border" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square rounded-md bg-muted/70" />
            ))}
          </div>
        </div>
        <motion.section
          aria-labelledby={`${id}-title`}
          className="absolute inset-y-0 right-0 flex w-64 max-w-[85%] flex-col rounded-l-xl border-l bg-background shadow-xl"
          variants={animated ? drawer : undefined}
          {...state}
        >
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="flex items-center gap-1.5">
              <h2 id={`${id}-title`} className="text-xs font-semibold text-foreground">
                {t.title}
              </h2>
              <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                {count}
              </span>
            </span>
            <button
              type="button"
              aria-label={t.close}
              className={cn("-m-1 rounded-md p-1 text-muted-foreground", focusRing)}
              {...noFocus}
            >
              <X className="size-3.5" strokeWidth={2.25} />
            </button>
          </div>
          {lines.length === 0 ? (
            <motion.div
              className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center"
              variants={animated ? item : undefined}
              {...state}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="size-4 text-muted-foreground" strokeWidth={2} />
              </span>
              <span className="mt-1 text-[11px] font-semibold text-foreground">{t.empty}</span>
              <span className="text-[9px] text-muted-foreground">{t.emptyHint}</span>
              <button
                type="button"
                className={cn(
                  "mt-2 flex h-7 items-center rounded-md bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90",
                  focusRing,
                )}
                {...noFocus}
              >
                {t.continue}
              </button>
            </motion.div>
          ) : (
            <>
              <motion.ul
                className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-3 pt-1"
                variants={animated ? content : undefined}
                {...state}
              >
                {lines.map((it, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-2"
                    variants={animated ? item : undefined}
                  >
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                      {it.image && (
                        <img src={it.image} alt={it.alt ?? ""} className="size-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium text-foreground">
                        {it.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`${t.decrease} ${it.name}`}
                          className={stepper}
                          {...noFocus}
                        >
                          −
                        </button>
                        <span className="w-3 text-center text-[10px] text-foreground tabular-nums">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`${t.increase} ${it.name}`}
                          className={stepper}
                          {...noFocus}
                        >
                          +
                        </button>
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-foreground tabular-nums">
                      {money.format(cents(it.price * it.qty))}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="border-t" />
              <motion.div
                className="flex flex-col gap-1 p-3"
                variants={animated ? content : undefined}
                {...state}
              >
                <motion.div
                  className="flex items-center justify-between text-[10px]"
                  variants={animated ? item : undefined}
                >
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {money.format(subtotal)}
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between text-[10px]"
                  variants={animated ? item : undefined}
                >
                  <span className="text-muted-foreground">{t.shipping}</span>
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      shipping === 0 ? "text-success" : "text-foreground",
                    )}
                  >
                    {shipping === 0 ? t.free : money.format(shipping)}
                  </span>
                </motion.div>
                {discount && (
                  <motion.div
                    className="flex items-center gap-1 text-[10px]"
                    variants={animated ? item : undefined}
                  >
                    <Tag className="size-2.5 text-primary" strokeWidth={2.25} />
                    <span className="rounded bg-primary/10 px-1 py-0.5 text-[8px] font-semibold text-primary">
                      -{promoPercent}% {promoCode}
                    </span>
                    <span className="ml-auto font-medium text-success tabular-nums">
                      {money.format(-off)}
                    </span>
                  </motion.div>
                )}
                <motion.button
                  type="button"
                  className={cn(
                    "mt-1.5 flex h-7 items-center justify-center gap-1 rounded-md bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
                    focusRing,
                  )}
                  variants={animated ? item : undefined}
                  {...noFocus}
                >
                  <Lock className="size-2.5" strokeWidth={2.5} />
                  {t.checkout} · {money.format(total)}
                </motion.button>
                <motion.button
                  type="button"
                  className={cn(
                    "mt-1 self-center rounded-sm text-center text-[9px] text-muted-foreground transition-colors duration-200 hover:text-foreground",
                    focusRing,
                  )}
                  variants={animated ? item : undefined}
                  {...noFocus}
                >
                  {t.continue}
                </motion.button>
              </motion.div>
            </>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}
