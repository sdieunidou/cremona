import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2, Info, OctagonX, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface AlertProps extends VisualProps {
  variant?: "info" | "success" | "warning" | "destructive";
  title?: string;
  description?: string;
}

const copy: Record<string, { title: string; description: string }> = {
  info: {
    title: "New version available",
    description: "Release 2.4 ships a rebuilt activity feed and faster search.",
  },
  success: {
    title: "Deployment complete",
    description: "aurora-web is live in production after 3m 12s of pipeline time.",
  },
  warning: {
    title: "Storage almost full",
    description: "You've used 92% of your plan. Upgrade to keep uploading.",
  },
  destructive: {
    title: "Payment failed",
    description: "Your card was declined. Update your billing details to restore access.",
  },
};

const variantClasses: Record<
  string,
  { box: string; icon: string; Icon: LucideIcon }
> = {
  info: {
    box: "border-sky-500/20 bg-sky-500/10",
    icon: "text-sky-600 dark:text-sky-400",
    Icon: Info,
  },
  success: {
    box: "border-emerald-500/20 bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  warning: {
    box: "border-amber-500/20 bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: TriangleAlert,
  },
  destructive: {
    box: "border-destructive/30 bg-destructive/10",
    icon: "text-destructive",
    Icon: OctagonX,
  },
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Alert({
  variant = "info",
  title,
  description,
  animated = false,
  trigger = "inView",
  className,
}: AlertProps) {
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

  const { box, icon, Icon } = variantClasses[variant] ?? variantClasses.info!;
  const fallback = copy[variant] ?? copy.info!;

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
        role="alert"
        className={cn("flex w-full max-w-80 gap-3 rounded-lg border p-4", box)}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <Icon className={cn("mt-0.5 size-4.5 shrink-0", icon)} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{title ?? fallback.title}</p>
          <p className="text-xs text-muted-foreground">
            {description ?? fallback.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
