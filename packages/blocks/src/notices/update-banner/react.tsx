import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Sparkles, X } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface UpdateBannerProps extends VisualProps {
  action?: boolean;
}

const bannerIn = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

export function UpdateBanner({
  action = false,
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
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        role="status"
        className="relative flex h-9 w-full items-center justify-center gap-2 bg-primary px-4 text-xs font-medium text-primary-foreground"
        variants={animated ? bannerIn : undefined}
        {...state}
      >
        <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 truncate">
          Cremona 2.4 is out — motion presets & 12 new blocks
        </p>
        {action && (
          <button
            type="button"
            className="inline-flex h-6 shrink-0 items-center rounded-md bg-white/15 px-2.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-white/25"
          >
            Update now
          </button>
        )}
        <a
          href="#"
          className="shrink-0 opacity-90 underline underline-offset-2 transition-opacity duration-200 hover:opacity-100"
        >
          See changelog
        </a>
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute right-2 flex size-6 shrink-0 items-center justify-center rounded-md opacity-80 transition-colors duration-200 hover:bg-white/15 hover:opacity-100"
        >
          <X className="size-3.5" strokeWidth={2.25} />
        </button>
      </motion.div>
    </div>
  );
}
