"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2, Info, OctagonX, TriangleAlert, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type ToastVariant = "info" | "success" | "warning" | "destructive";

export interface ToastProps extends VisualProps {
  /** Visual intent (`error` is a deprecated alias of `destructive`). */
  variant?: ToastVariant | "error";
  title?: string;
  description?: string;
  /** Action button: its text, or `true` for "View". */
  action?: boolean | string;
  /** Show a close button. */
  dismissible?: boolean;
  /** Toasts in the stack (up to 3 drawn). */
  stack?: number;
  /** In the flow at the full width of the box, instead of pinned to its bottom-right corner. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const copy: Record<ToastVariant, { title: string; description: string }> = {
  info: {
    title: "Meeting notes shared",
    description: "Ava shared notes from the roadmap sync.",
  },
  success: {
    title: "Changes saved",
    description: "Your workspace settings are live.",
  },
  warning: {
    title: "Storage almost full",
    description: "92% of your plan is used.",
  },
  destructive: {
    title: "Upload failed",
    description: "handoff.fig exceeds the 25 MB limit.",
  },
};

const variantClasses: Record<ToastVariant, { icon: string; Icon: LucideIcon }> = {
  info: { icon: "text-info", Icon: Info },
  success: { icon: "text-success", Icon: CheckCircle2 },
  warning: { icon: "text-warning", Icon: TriangleAlert },
  destructive: { icon: "text-destructive", Icon: OctagonX },
};

// Cards drawn behind the front toast, nearest first.
const behind = ["-translate-y-2 scale-95 opacity-80", "-translate-y-4 scale-90 opacity-60"];

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
  dismissible = false,
  stack = 1,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ToastProps) {
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

  const tone: ToastVariant = variant === "error" ? "destructive" : variant;
  const { icon, Icon } = variantClasses[tone] ?? variantClasses.info;
  const fallback = copy[tone] ?? copy.info;
  const heading = title ?? fallback.title;
  const body = description ?? fallback.description;
  const actionLabel = action === true ? "View" : action || undefined;
  const cardClasses = "flex w-full items-start gap-3 rounded-lg border bg-popover p-4 shadow-lg";
  const back = behind.slice(0, Math.max(0, Math.min(stack, behind.length + 1) - 1));

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(fill ? "relative w-full self-start" : "absolute right-3 bottom-3 w-64")}
        variants={animated ? toastIn : undefined}
        {...state}
      >
        {back
          .map((position, i) => (
            <div
              key={i}
              aria-hidden="true"
              className={cn(cardClasses, "absolute inset-x-0 top-0", position)}
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} />
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">{heading}</p>
                <p className="text-xs text-muted-foreground">{body}</p>
              </div>
            </div>
          ))
          .reverse()}
        <div
          role={tone === "destructive" ? "alert" : "status"}
          className={cn(cardClasses, "relative")}
        >
          <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">{heading}</p>
            <p className="text-xs text-muted-foreground">{body}</p>
            {actionLabel && (
              <button
                type="button"
                className={cn(
                  "mt-1.5 inline-flex h-7 w-fit items-center rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10",
                  focusRing,
                )}
              >
                {actionLabel}
              </button>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              aria-label="Dismiss"
              className={cn(
                "-mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                focusRing,
              )}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
