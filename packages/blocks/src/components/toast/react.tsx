import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2, Info, OctagonX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ToastProps extends VisualProps {
  variant?: "info" | "success" | "error";
  title?: string;
  description?: string;
  action?: boolean;
  stack?: number;
}

const copy: Record<string, { title: string; description: string }> = {
  info: {
    title: "Meeting notes shared",
    description: "Ava shared notes from the roadmap sync.",
  },
  success: {
    title: "Changes saved",
    description: "Your workspace settings are live.",
  },
  error: {
    title: "Upload failed",
    description: "handoff.fig exceeds the 25 MB limit.",
  },
};

const variantClasses: Record<
  string,
  { icon: string; Icon: LucideIcon }
> = {
  info: { icon: "text-sky-600 dark:text-sky-400", Icon: Info },
  success: { icon: "text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 },
  error: { icon: "text-red-600 dark:text-red-400", Icon: OctagonX },
};

const toastIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

export function Toast({
  variant = "info",
  title,
  description,
  action = false,
  stack = 1,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ToastProps) {
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

  const { icon, Icon } = variantClasses[variant] ?? variantClasses.info!;
  const fallback = copy[variant] ?? copy.info!;

  const cardClasses =
    "flex w-64 items-start gap-3 rounded-lg border bg-popover p-4 shadow-lg";

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
        className="absolute right-3 bottom-3 w-64"
        variants={animated ? toastIn : undefined}
        {...state}
      >
        {stack >= 2 && (
          <div
            className={cn(
              cardClasses,
              "absolute inset-x-0 top-0 -translate-y-2 scale-95 opacity-80",
            )}
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                {title ?? fallback.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {description ?? fallback.description}
              </p>
            </div>
          </div>
        )}
        <div role="status" className={cn(cardClasses, "relative")}>
          <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">
              {title ?? fallback.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {description ?? fallback.description}
            </p>
            {action && (
              <button
                type="button"
                className="mt-1.5 inline-flex h-7 w-fit items-center rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                View
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
