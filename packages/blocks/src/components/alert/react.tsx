"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2, Info, OctagonX, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface AlertProps extends VisualProps {
  variant?: "info" | "success" | "warning" | "destructive";
  title?: string;
  description?: string;
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

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

const variantClasses: Record<string, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-info/20 bg-info/10", icon: "text-info", Icon: Info },
  success: { box: "border-success/20 bg-success/10", icon: "text-success", Icon: CheckCircle2 },
  warning: { box: "border-warning/20 bg-warning/10", icon: "text-warning", Icon: TriangleAlert },
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
  fill = false,
  className,
}: AlertProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
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
  const urgent = variant === "destructive" || variant === "warning";

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        role={urgent ? "alert" : "status"}
        className={cn(
          "flex w-full",
          fill ? "self-start" : "max-w-80",
          "gap-3 rounded-lg border p-4",
          box,
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <Icon className={cn("mt-0.5 size-4.5 shrink-0", icon)} />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{title ?? fallback.title}</p>
          <p className="text-xs text-muted-foreground">{description ?? fallback.description}</p>
        </div>
      </motion.div>
    </div>
  );
}
