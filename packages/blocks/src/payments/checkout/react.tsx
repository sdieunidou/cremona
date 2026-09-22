import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Lock, CreditCard, Wifi } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

/**
 * The POC SSR emitted `<Lock/>Pay<!-- --> <!-- -->$42.00` inside the pay
 * buttons (renderToString inserts comment separators between adjacent text
 * nodes). renderToStaticMarkup merges them into one node, so the button
 * content is emitted verbatim — including the lock glyph, which is exactly
 * what <Lock className="size-3" strokeWidth={2.5}/> renders.
 */
function payButtonHtml(buttonLabel: string, amount: string): string {
  const lock =
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock size-3" aria-hidden="true">` +
    `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
  return `${lock}${buttonLabel}<!-- --> <!-- -->${amount}`;
}

const wrap = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const wrapIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const miniCardAnim = {
  hidden: { opacity: 0, y: 12, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22, delay: 0.1 },
  },
} as const;

const formAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
} as const;

const actionsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
} as const;

const fieldAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const payFormAnim = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 18, delay: 0.7 },
  },
} as const;

const payCardAnim = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 18, delay: 0.9 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

export interface CheckoutProps extends VisualProps {
  amount?: string;
  buttonLabel?: string;
  name?: string;
  brand?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  card?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Checkout({
  amount = "$42.00",
  buttonLabel = "Pay",
  name = "JOHN T. DOE",
  brand = "PLATINUM",
  cardNumber = "4242 4242 4242 4242",
  expiry = `12/${((new Date().getFullYear() + 3) % 100).toString().padStart(2, "0")}`,
  cvc = "•••",
  card = false,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: CheckoutProps) {
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
        className={cn(
          "relative w-full", !fill && "max-w-80", "rounded-3xl border border-border/50 bg-muted/75 p-1.5 will-change-transform",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? wrapIso : wrap) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Pay with card</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Lock className="size-3" strokeWidth={2.25} />
              <span className="text-[10px] font-medium">Secure</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {card ? (
              <>
                <motion.div
                  className="relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-xl bg-primary p-3 text-primary-foreground"
                  variants={animated ? miniCardAnim : undefined}
                  {...state}
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-primary-foreground/15 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-8 size-28 rounded-full bg-primary-foreground/12 blur-2xl" />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/4 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-size-[10px_10px] opacity-[0.04]" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-5 w-6.5 items-center justify-center rounded-[3px] bg-linear-to-br from-amber-200 to-amber-400">
                        <div className="absolute inset-[2px] rounded-[2px] border border-amber-700/30" />
                        <div className="absolute top-1/2 right-[2px] left-[2px] h-px bg-amber-700/25" />
                        <div className="absolute top-[2px] bottom-[2px] left-1/2 w-px bg-amber-700/25" />
                      </div>
                      <Wifi className="size-3.5 rotate-90 opacity-80" strokeWidth={2} />
                    </div>
                    <span className="text-[8px] font-semibold tracking-[0.2em] opacity-90">
                      {brand}
                    </span>
                  </div>
                  <div className="relative font-mono text-xs font-medium tracking-widest tabular-nums">
                    {cardNumber}
                  </div>
                  <div className="relative flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[6px] tracking-[0.15em] opacity-70">CARD HOLDER</span>
                      <span className="text-[9px] font-semibold tracking-wider">{name}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[6px] tracking-[0.15em] opacity-70">EXPIRES</span>
                      <span className="font-mono text-[9px] font-semibold tracking-wider tabular-nums">
                        {expiry}
                      </span>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex flex-col gap-3"
                  variants={animated ? actionsAnim : undefined}
                  {...state}
                >
                  <motion.button
                    type="button"
                    className="self-center text-[10px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    variants={animated ? fieldAnim : undefined}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Use a different card
                  </motion.button>
                  <motion.button
                    type="button"
                    className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                    variants={animated ? payCardAnim : undefined}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    dangerouslySetInnerHTML={{ __html: payButtonHtml(buttonLabel, amount) }}
                  />
                </motion.div>
              </>
            ) : (
              <motion.div
                className="flex flex-col gap-3"
                variants={animated ? formAnim : undefined}
                {...state}
              >
                <motion.div
                  className="flex flex-col gap-1.5"
                  variants={animated ? fieldAnim : undefined}
                >
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Card number
                  </label>
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2 shadow-xs">
                    <span className="font-mono text-xs tracking-wider text-foreground">
                      {cardNumber}
                    </span>
                    <CreditCard className="size-3.5 text-muted-foreground" strokeWidth={2} />
                  </div>
                </motion.div>
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  variants={animated ? fieldAnim : undefined}
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground">Expires</label>
                    <div className="rounded-md border bg-background px-2.5 py-2 shadow-xs">
                      <span className="font-mono text-xs tracking-wider text-foreground">
                        {expiry}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground">CVC</label>
                    <div className="rounded-md border bg-background px-2.5 py-2 shadow-xs">
                      <span className="font-mono text-xs tracking-wider text-foreground">{cvc}</span>
                    </div>
                  </div>
                </motion.div>
                <motion.button
                  type="button"
                  className="mt-1 flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  variants={animated ? payFormAnim : undefined}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  dangerouslySetInnerHTML={{ __html: payButtonHtml(buttonLabel, amount) }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
