import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Sparkles, X } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface UpdateBannerProps extends VisualProps {
  /** Show the "Update now" button. */
  action?: boolean;
  message?: string;
  actionLabel?: string;
  /** Link text; an empty string hides the link. */
  linkLabel?: string;
  href?: string;
  dismissLabel?: string;
}

/** Preview only: keeps a control out of the tab order, unfocused and inactive on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent, onClick: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const bannerIn = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

/* on the primary band, overlays are primary-foreground tints: they follow the theme in both modes */
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground";

export function UpdateBanner({
  action = false,
  message = "Acme 2.4 is out — faster search and shared dashboards",
  actionLabel = "Update now",
  linkLabel = "See changelog",
  href = "#",
  dismissLabel = "Dismiss",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: UpdateBannerProps) {
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
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "@container relative flex h-9 w-full items-center bg-primary pr-10 pl-4 text-xs font-medium text-primary-foreground",
          fill && "self-start",
        )}
        variants={animated ? bannerIn : undefined}
        {...state}
      >
        {/* the message truncates first; the link drops out below 20rem */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
          <p className="min-w-0 truncate">{message}</p>
          {action && (
            <button
              type="button"
              className={cn(
                "inline-flex h-6 shrink-0 items-center rounded-md bg-primary-foreground/15 px-2.5 text-xs font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary-foreground/25",
                focusRing,
              )}
              {...noFocus}
            >
              {actionLabel}
            </button>
          )}
          {linkLabel && (
            <a
              href={href}
              className={cn(
                "hidden shrink-0 rounded-sm underline underline-offset-2 @xs:inline",
                focusRing,
              )}
              {...noFocus}
            >
              {linkLabel}
            </a>
          )}
        </div>
        <button
          type="button"
          aria-label={dismissLabel}
          className={cn(
            "absolute right-2 flex size-6 shrink-0 items-center justify-center rounded-md opacity-80 transition-colors duration-200 hover:bg-primary-foreground/15 hover:opacity-100",
            focusRing,
          )}
          {...noFocus}
        >
          <X className="size-3.5" strokeWidth={2.25} />
        </button>
      </motion.div>
    </div>
  );
}
