import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Lock, ShieldCheck, Tag } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CheckoutSummaryProps extends VisualProps {
  lines?: { title: string; price: string }[];
  subtotal?: string;
  shipping?: string;
  tax?: string;
  total?: string;
  promo?: boolean;
  promoCode?: string;
  discount?: string;
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

export function CheckoutSummary({
  lines = [
    { title: "Trail Runner GTX", price: "$128.00" },
    { title: "Merino wool socks", price: "$12.00" },
  ],
  subtotal = "$140.00",
  shipping = "$5.00",
  tax = "$11.20",
  total = "$156.20",
  promo = false,
  promoCode = "WELCOME10",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CheckoutSummaryProps) {
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
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={cn("w-full", !fill && "max-w-72", "rounded-xl border bg-card p-5 text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex flex-col gap-2"
          variants={animated ? content : undefined}
          {...state}
        >
          {lines.map((line) => (
            <motion.div
              key={line.title}
              className="flex items-center justify-between text-xs"
              variants={animated ? row : undefined}
            >
              <span className="text-foreground">{line.title}</span>
              <span className="font-medium text-foreground tabular-nums">{line.price}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className="my-3 border-t" />
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
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="ml-auto h-6 rounded px-1.5 text-[10px] font-semibold text-primary transition-colors duration-200 hover:bg-primary/10"
            >
              Apply
            </button>
          </motion.div>
        )}
        <motion.div
          className="flex flex-col gap-1.5"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div
            className="flex items-center justify-between text-xs"
            variants={animated ? row : undefined}
          >
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground tabular-nums">{subtotal}</span>
          </motion.div>
          <motion.div
            className="flex items-center justify-between text-xs"
            variants={animated ? row : undefined}
          >
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground tabular-nums">{shipping}</span>
          </motion.div>
          <motion.div
            className="flex items-center justify-between text-xs"
            variants={animated ? row : undefined}
          >
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground tabular-nums">{tax}</span>
          </motion.div>
          <motion.div
            className="mt-1 flex items-baseline justify-between"
            variants={animated ? row : undefined}
          >
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-base font-semibold text-foreground tabular-nums">{total}</span>
          </motion.div>
        </motion.div>
        <motion.button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          className="mt-3.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          variants={animated ? row : undefined}
        >
          <Lock className="size-3.5" strokeWidth={2.5} />
          Pay {total}
        </motion.button>
        <motion.div
          className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground"
          variants={animated ? row : undefined}
        >
          <ShieldCheck className="size-3" strokeWidth={2.25} />
          Secure 256-bit encrypted checkout
        </motion.div>
      </motion.div>
    </div>
  );
}