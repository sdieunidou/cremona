import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export const toastDefaultCopy = {
  variant: "success",
} as const;

type Variant = "success" | "warning" | "info";

const variantStyles: Record<Variant, { icon: LucideIcon; accent: string }> = {
  success: { icon: CircleCheck, accent: "text-emerald-500" },
  warning: { icon: TriangleAlert, accent: "text-amber-500" },
  info: { icon: Info, accent: "text-sky-500" },
};

const copy: Record<Variant, { title: string; description: string }> = {
  success: {
    title: "Changes saved",
    description: "Your profile has been updated successfully.",
  },
  warning: {
    title: "Storage almost full",
    description: "You've used 92% of your available space.",
  },
  info: {
    title: "New update available",
    description: "Version 2.4 is ready to install.",
  },
};

const cardIso = {
  hidden: { transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const main = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const stack: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: "easeOut" },
  }),
};

const text = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, delay: 0.2, ease: "easeOut" } },
} as const;

const iconAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.4 },
  },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface ToastProps extends VisualProps {
  variant?: Variant;
  title?: string;
  description?: string;
  isometric?: boolean;
  gradient?: boolean;
}

export function Toast({
  variant = "success",
  title,
  description,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
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
  const { icon: Icon, accent } = variantStyles[variant];
  const fallback = copy[variant];
  const heading = title ?? fallback.title;
  const body = description ?? fallback.description;

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
        className={cn("relative flex w-full", !fill && "max-w-72", "flex-col items-center gap-2")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated && isometric ? cardIso : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <motion.div
          className="absolute -top-3 left-1/2 h-4 w-[88%] -translate-x-1/2 rounded-xl border bg-card/60 shadow-xs"
          variants={animated ? stack : undefined}
          custom={0.55}
          {...state}
        />
        <motion.div
          className="absolute -top-1.5 left-1/2 h-4 w-[94%] -translate-x-1/2 rounded-xl border bg-card/80 shadow-xs"
          variants={animated ? stack : undefined}
          custom={0.4}
          {...state}
        />
        <motion.div
          className="relative w-full rounded-xl border bg-card shadow-xs"
          variants={animated ? main : undefined}
          {...state}
        >
          <div className="flex items-start gap-2.5 px-2.5 py-3.5">
            <motion.div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full ${accent}`}
              variants={animated ? iconAnim : undefined}
              {...state}
            >
              <Icon className="size-5" />
            </motion.div>
            <motion.div
              className="flex flex-1 flex-col gap-1 pt-0.5"
              variants={animated ? text : undefined}
              {...state}
            >
              <span className="text-xs font-semibold text-foreground">{heading}</span>
              <span className="text-[10px]/relaxed font-medium text-muted-foreground">{body}</span>
            </motion.div>
            <motion.button
              type="button"
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              variants={animated ? iconAnim : undefined}
              {...state}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <X className="size-3" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
