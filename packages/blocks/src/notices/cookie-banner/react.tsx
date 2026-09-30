import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Cookie } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CookieBannerLabels {
  title: string;
  description: string;
  /** Short text of the minimal variant. */
  short: string;
  policy: string;
  manage: string;
  reject: string;
  accept: string;
}

export interface CookieBannerProps extends VisualProps {
  /** One-line bar: short text, Reject and Accept. */
  minimal?: boolean;
  /** Cookie policy page. */
  policyHref?: string;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<CookieBannerLabels>;
}

const defaultLabels: CookieBannerLabels = {
  title: "We value your privacy",
  description: "We use cookies to personalize content and analyze traffic.",
  short: "We use cookies to improve your experience.",
  policy: "See our cookie policy",
  manage: "Manage",
  reject: "Reject all",
  accept: "Accept all",
};

/** Preview only: keeps a control out of the tab order, unfocused and inactive on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent, onClick: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const bannerIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
/* Reject and Accept share one style: refusing is exactly as easy as accepting (GDPR, CNIL). */
const choice = cn(
  "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-colors duration-200 hover:bg-primary/90",
  focusRing,
);

export function CookieBanner({
  minimal = false,
  policyHref = "#",
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CookieBannerProps) {
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

  const policy = (
    <a
      href={policyHref}
      className={cn(
        "rounded-sm font-medium text-foreground underline underline-offset-2",
        focusRing,
      )}
      {...noFocus}
    >
      {t.policy}
    </a>
  );

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      {minimal ? (
        <motion.section
          aria-label={t.title}
          className={cn(
            "flex w-full flex-wrap items-center gap-3 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg",
            fill ? "self-end" : "max-w-md",
          )}
          variants={animated ? bannerIn : undefined}
          {...state}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Cookie className="size-4.5 text-foreground" strokeWidth={2} />
          </span>
          {/* the buttons wrap under the text when the bar is too narrow for one line */}
          <p className="min-w-0 flex-1 basis-48 text-xs leading-snug text-muted-foreground">
            {t.short} {policy}.
          </p>
          <span className="ml-auto flex shrink-0 gap-1.5">
            <button type="button" className={choice} {...noFocus}>
              {t.reject}
            </button>
            <button type="button" className={choice} {...noFocus}>
              {t.accept}
            </button>
          </span>
        </motion.section>
      ) : (
        <motion.section
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          className={cn(
            "w-full rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg",
            fill ? "self-end" : "max-w-80",
          )}
          variants={animated ? bannerIn : undefined}
          {...state}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Cookie className="size-4.5 text-foreground" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 id={`${id}-title`} className="text-sm font-semibold text-foreground">
                {t.title}
              </h2>
              <p id={`${id}-description`} className="text-xs leading-snug text-muted-foreground">
                {t.description} {policy}.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className={cn(
                "mr-auto inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted",
                focusRing,
              )}
              {...noFocus}
            >
              {t.manage}
            </button>
            <button type="button" className={choice} {...noFocus}>
              {t.reject}
            </button>
            <button type="button" className={choice} {...noFocus}>
              {t.accept}
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}
