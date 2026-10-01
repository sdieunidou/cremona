"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Sparkles, Check, X, CircleAlert } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface BadgeProps extends VisualProps {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
  label?: string;
  withIcon?: boolean;
  pill?: boolean;
  /** Stays centred in the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline:
    "border border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success/10 text-success ring-1 ring-success/20 ring-inset",
  warning: "bg-warning/10 text-warning ring-1 ring-warning/20 ring-inset",
};

const icons: Record<string, React.ReactNode> = {
  default: <Sparkles className="size-3" />,
  success: <Check className="size-3" />,
  destructive: <X className="size-3" />,
  warning: <CircleAlert className="size-3" />,
};

const entrance = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18 },
  },
} as const;

export function Badge({
  variant = "default",
  label = "New",
  withIcon = true,
  pill = true,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: BadgeProps) {
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

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.span
        className={cn(
          "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap px-2 text-xs font-medium transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
          pill ? "rounded-4xl" : "rounded-md",
          variantClasses[variant],
          fill && "self-center",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {withIcon && icons[variant]}
        {label}
      </motion.span>
    </div>
  );
}
