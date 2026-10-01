"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { ArrowRight, LoaderCircle, type LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ButtonProps extends VisualProps {
  /** Visual intent. */
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon" | "icon-sm";
  /** Button text. With an icon-only size it is the accessible name instead. */
  label?: string;
  /** true = leading icon, "end" = trailing icon */
  withIcon?: boolean | "end";
  /** Icon for `withIcon` and the icon-only sizes (default ArrowRight). */
  icon?: LucideIcon;
  loading?: boolean;
  /** Text shown while `loading`. */
  loadingText?: string;
  disabled?: boolean;
  /** Render a link styled as a button. */
  href?: string;
  /** Full-width button. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  outline:
    "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs font-medium has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  default:
    "h-9 gap-2 rounded-md px-4 text-sm font-medium has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  lg: "h-10 gap-2 rounded-md px-6 text-sm font-medium has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
  icon: "size-9 rounded-md",
  "icon-sm": "size-8 rounded-md",
};

const entrance = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

export function Button({
  variant = "default",
  size = "default",
  label = "Continue",
  withIcon = false,
  icon: Icon = ArrowRight,
  loading = false,
  loadingText = "Working…",
  disabled = false,
  href,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const spin = useLoopActive(ref, animated && loading);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const iconOnly = size === "icon" || size === "icon-sm";
  const classes = cn(
    "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    focusRing,
    variantClasses[variant],
    sizeClasses[size],
    fill && "w-full",
  );

  const content = loading ? (
    <>
      <LoaderCircle className={cn("size-4", spin && "animate-spin")} />
      {!iconOnly && <span>{loadingText}</span>}
    </>
  ) : iconOnly ? (
    <Icon className="size-4" />
  ) : (
    <>
      {withIcon && withIcon !== "end" && <Icon className="size-4" data-icon="inline-start" />}
      <span>{label}</span>
      {withIcon === "end" && <Icon className="size-4" data-icon="inline-end" />}
    </>
  );
  const a11y = {
    "aria-label": iconOnly ? (loading ? loadingText : label) : undefined,
    "aria-busy": loading || undefined,
  };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={fill ? "w-full" : undefined}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {href ? (
          <a
            href={disabled ? undefined : href}
            aria-disabled={disabled || loading || undefined}
            className={classes}
            {...a11y}
          >
            {content}
          </a>
        ) : (
          <button type="button" className={classes} disabled={disabled || loading} {...a11y}>
            {content}
          </button>
        )}
      </motion.div>
    </div>
  );
}
