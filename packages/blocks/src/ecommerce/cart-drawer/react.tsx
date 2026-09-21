import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { X, Lock, Tag, ShoppingBag } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface CartDrawerProps extends VisualProps {
  items?: { name: string; qty: number; price: string; img: string }[];
  discount?: boolean;
  promoCode?: string;
  promoAmount?: string;
  empty?: boolean;
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

const defaultItems = [
  { name: "Aero Runner 2", qty: 1, price: "$128.00", img: "/media/placeholders/photo-01.jpg" },
  { name: "Trail socks", qty: 2, price: "$14.00", img: "/media/placeholders/photo-02.jpg" },
  { name: "Field cap", qty: 1, price: "$22.00", img: "/media/placeholders/photo-03.jpg" },
];

export function CartDrawer({
  items = defaultItems,
  discount = false,
  promoCode = "WELCOME10",
  promoAmount = "-$17.80",
  empty = false,
  animated = false,
  trigger = "inView",
  className,
}: CartDrawerProps) {
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
        className="relative h-80 w-full max-w-96"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl border bg-card p-3">
          <div className="h-2.5 w-20 rounded-full bg-muted-foreground/15" />
          <div className="mt-2 h-px w-full bg-border" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square rounded-md bg-muted/70" />
            ))}
          </div>
        </div>
        <motion.div
          className="absolute inset-y-0 right-0 flex w-64 flex-col rounded-l-xl border bg-background shadow-xl"
          variants={animated ? drawer : undefined}
          {...state}
        >
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground">Your cart</span>
              <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                {empty ? "0" : "3"}
              </span>
            </span>
            <X className="size-3.5 text-muted-foreground" strokeWidth={2.25} />
          </div>
          {empty ? (
            <motion.div
              className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center"
              variants={animated ? item : undefined}
              {...state}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="size-4 text-muted-foreground" strokeWidth={2} />
              </span>
              <span className="mt-1 text-[11px] font-semibold text-foreground">
                Your cart is empty
              </span>
              <span className="text-[9px] text-muted-foreground">
                Browse products to get started
              </span>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className="mt-2 flex h-7 items-center rounded-md bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90"
              >
                Continue shopping
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="flex flex-1 flex-col gap-2.5 px-3 pt-1"
                variants={animated ? content : undefined}
                {...state}
              >
                {items.map((it) => (
                  <motion.div
                    key={it.name}
                    className="flex items-center gap-2"
                    variants={animated ? item : undefined}
                  >
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img src={it.img} alt="" className="size-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium text-foreground">
                        {it.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1">
                        <span className="flex size-3.5 items-center justify-center rounded-[3px] border text-[9px] leading-none text-muted-foreground transition-colors duration-200 hover:text-foreground">
                          −
                        </span>
                        <span className="w-3 text-center text-[10px] text-foreground tabular-nums">
                          {it.qty}
                        </span>
                        <span className="flex size-3.5 items-center justify-center rounded-[3px] border text-[9px] leading-none text-muted-foreground transition-colors duration-200 hover:text-foreground">
                          +
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold text-foreground tabular-nums">
                      {it.price}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground tabular-nums">$178.00</span>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between text-[10px]"
                  variants={animated ? item : undefined}
                >
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                </motion.div>
                {discount && (
                  <motion.div
                    className="flex items-center gap-1 text-[10px]"
                    variants={animated ? item : undefined}
                  >
                    <Tag className="size-2.5 text-primary" strokeWidth={2.25} />
                    <span className="rounded bg-primary/10 px-1 py-0.5 text-[8px] font-semibold text-primary">
                      -10% {promoCode}
                    </span>
                    <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {promoAmount}
                    </span>
                  </motion.div>
                )}
                <motion.button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  className="mt-1.5 flex h-7 items-center justify-center gap-1 rounded-md bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                  variants={animated ? item : undefined}
                >
                  <Lock className="size-2.5" strokeWidth={2.5} />
                  Checkout · {discount ? "$160.20" : "$178.00"}
                </motion.button>
                <motion.span
                  className="mt-1 text-center text-[9px] text-muted-foreground"
                  variants={animated ? item : undefined}
                >
                  Continue shopping
                </motion.span>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}