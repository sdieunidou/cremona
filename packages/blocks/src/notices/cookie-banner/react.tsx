import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Cookie } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CookieBannerProps extends VisualProps {
  minimal?: boolean;
}

const bannerIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

export function CookieBanner({
  minimal = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CookieBannerProps) {
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
      {minimal ? (
        <motion.div
          className="flex w-80 items-center gap-3 rounded-xl border bg-popover p-3 shadow-lg"
          variants={animated ? bannerIn : undefined}
          {...state}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Cookie className="size-4.5 text-foreground" strokeWidth={2} />
          </span>
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
            We use cookies to improve your experience.
          </p>
          <button
            type="button"
            aria-label="Accept all"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs transition-colors duration-200 hover:bg-primary/90"
          >
            <Check className="size-4" strokeWidth={2.25} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="w-80 rounded-xl border bg-popover p-4 shadow-lg"
          variants={animated ? bannerIn : undefined}
          {...state}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Cookie className="size-4.5 text-foreground" strokeWidth={2} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                We value your privacy
              </p>
              <p className="text-xs leading-snug text-muted-foreground">
                We use cookies to personalize content and analyze traffic. See our
                cookie policy for details.
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              Manage
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-colors duration-200 hover:bg-primary/90"
            >
              Accept all
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
