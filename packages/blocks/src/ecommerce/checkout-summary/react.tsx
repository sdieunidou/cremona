import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Lock, ShieldCheck, Tag } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CheckoutLine {
  title: string;
  /** Unit price, in `currency`. */
  price: number;
  /** Quantity (default 1): the line shows price × qty. */
  qty?: number;
}

export interface CheckoutSummaryLabels {
  title: string;
  subtotal: string;
  discount: string;
  shipping: string;
  free: string;
  tax: string;
  total: string;
  removePromo: string;
  pay: string;
  secure: string;
}

export interface CheckoutSummaryProps extends VisualProps {
  /** Order lines: the subtotal, discount, tax and total are computed from them. */
  lines?: CheckoutLine[];
  /** ISO 4217 currency of every amount. */
  currency?: string;
  /** Locale used to format amounts. */
  locale?: string;
  /** Shipping cost; 0 reads "Free". */
  shipping?: number;
  /** Tax rate applied to the discounted subtotal (0.08 = 8 %). */
  taxRate?: number;
  /** Apply the promo code: its chip and a discount line appear. */
  promo?: boolean;
  promoCode?: string;
  /** Promo discount, in percent of the subtotal. */
  promoPercent?: number;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<CheckoutSummaryLabels>;
}

const defaultLabels: CheckoutSummaryLabels = {
  title: "Order summary",
  subtotal: "Subtotal",
  discount: "Discount",
  shipping: "Shipping",
  free: "Free",
  tax: "Tax",
  total: "Total",
  removePromo: "Remove",
  pay: "Pay",
  secure: "Secure 256-bit encrypted checkout",
};

const defaultLines: CheckoutLine[] = [
  { title: "Trail Runner GTX", price: 128 },
  { title: "Merino wool socks", price: 12 },
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

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const row = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Amounts are rounded to cents before they are summed or displayed. */
const cents = (n: number) => Math.round(n * 100) / 100;

export function CheckoutSummary({
  lines = defaultLines,
  currency = "USD",
  locale = "en-US",
  shipping = 5,
  taxRate = 0.08,
  promo = false,
  promoCode = "WELCOME10",
  promoPercent = 10,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CheckoutSummaryProps) {
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

  const money = new Intl.NumberFormat(locale, { style: "currency", currency });
  const subtotal = cents(lines.reduce((sum, l) => sum + cents(l.price * (l.qty ?? 1)), 0));
  const discount = promo ? cents((subtotal * promoPercent) / 100) : 0;
  const tax = cents((subtotal - discount) * taxRate);
  const total = cents(subtotal - discount + shipping + tax);

  const amountRow = "flex items-center justify-between text-xs";

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.section
        aria-label={t.title}
        className={cn(
          "flex w-full flex-col",
          !fill && "max-w-72",
          "rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.ul
          className="flex flex-col gap-2"
          variants={animated ? content : undefined}
          {...state}
        >
          {lines.map((line, i) => (
            <motion.li key={i} className={amountRow} variants={animated ? row : undefined}>
              <span className="min-w-0 truncate text-foreground">
                {line.title}
                {(line.qty ?? 1) > 1 && (
                  <span className="text-muted-foreground"> × {line.qty}</span>
                )}
              </span>
              <span className="shrink-0 font-medium text-foreground tabular-nums">
                {money.format(cents(line.price * (line.qty ?? 1)))}
              </span>
            </motion.li>
          ))}
        </motion.ul>
        <div className="my-3 border-t" />
        <div className={cn("flex flex-col", fill && "mt-auto")}>
          {promo && (
            <motion.div
              className="mb-3 flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 shadow-xs"
              variants={animated ? row : undefined}
              {...state}
            >
              <Tag className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.25} />
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {promoCode}
              </span>
              <span className="text-[10px] text-muted-foreground">-{promoPercent}%</span>
              <button
                type="button"
                className={cn(
                  "ml-auto h-6 rounded px-1.5 text-[10px] font-semibold text-primary transition-colors duration-200 hover:bg-primary/10",
                  focusRing,
                )}
                {...noFocus}
              >
                {t.removePromo}
              </button>
            </motion.div>
          )}
          <motion.dl
            className="flex flex-col gap-1.5"
            variants={animated ? content : undefined}
            {...state}
          >
            <motion.div className={amountRow} variants={animated ? row : undefined}>
              <dt className="text-muted-foreground">{t.subtotal}</dt>
              <dd className="text-foreground tabular-nums">{money.format(subtotal)}</dd>
            </motion.div>
            {promo && (
              <motion.div className={amountRow} variants={animated ? row : undefined}>
                <dt className="text-muted-foreground">{t.discount}</dt>
                <dd className="text-success tabular-nums">{money.format(-discount)}</dd>
              </motion.div>
            )}
            <motion.div className={amountRow} variants={animated ? row : undefined}>
              <dt className="text-muted-foreground">{t.shipping}</dt>
              <dd className="text-foreground tabular-nums">
                {shipping === 0 ? t.free : money.format(shipping)}
              </dd>
            </motion.div>
            <motion.div className={amountRow} variants={animated ? row : undefined}>
              <dt className="text-muted-foreground">{t.tax}</dt>
              <dd className="text-foreground tabular-nums">{money.format(tax)}</dd>
            </motion.div>
            <motion.div
              className="mt-1 flex items-baseline justify-between"
              variants={animated ? row : undefined}
            >
              <dt className="text-sm font-medium text-foreground">{t.total}</dt>
              <dd className="text-base font-semibold text-foreground tabular-nums">
                {money.format(total)}
              </dd>
            </motion.div>
          </motion.dl>
          <motion.button
            type="button"
            className={cn(
              "mt-3.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
              focusRing,
            )}
            variants={animated ? row : undefined}
            {...noFocus}
          >
            <Lock className="size-3.5" strokeWidth={2.5} />
            {t.pay} {money.format(total)}
          </motion.button>
          <motion.p
            className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground"
            variants={animated ? row : undefined}
          >
            <ShieldCheck className="size-3" strokeWidth={2.25} />
            {t.secure}
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}
