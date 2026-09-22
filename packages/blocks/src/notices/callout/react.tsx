import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Info, Sparkles, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CalloutProps extends VisualProps {
  variant?: "info" | "warning" | "update";
}

const copy: Record<string, { title: string; description: string; link: string }> = {
  info: {
    title: "New workspace features",
    description: "Comment mentions are rolling out to all teams this week.",
    link: "Learn more",
  },
  warning: {
    title: "Storage almost full",
    description: "You've used 92% of your plan. Upgrade to keep uploading.",
    link: "Upgrade plan",
  },
  update: {
    title: "Cremona 2.4 is here",
    description: "Motion presets, 12 new blocks and a rebuilt command menu.",
    link: "See changelog",
  },
};

const variantClasses: Record<string, { box: string; icon: string; Icon: LucideIcon }> = {
  info: {
    box: "border-sky-500/20 bg-sky-500/5",
    icon: "text-sky-600 dark:text-sky-400",
    Icon: Info,
  },
  warning: {
    box: "border-amber-500/20 bg-amber-500/5",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: TriangleAlert,
  },
  update: {
    box: "border-primary/20 bg-primary/5",
    icon: "text-primary",
    Icon: Sparkles,
  },
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const badgeIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18, delay: 0.15 },
  },
};

export function Callout({
  variant = "info",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CalloutProps) {
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
  const text = copy[variant] ?? copy.info!;

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
        className={cn("flex w-full", !fill && "max-w-80", "items-start gap-3 rounded-lg border p-4", box)}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{text.title}</p>
            {variant === "update" && (
              <motion.span
                className="inline-flex h-4.5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-semibold text-primary"
                variants={animated ? badgeIn : undefined}
                {...state}
              >
                New
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{text.description}</p>
          <a
            href="#"
            className="mt-1 w-fit text-xs font-medium text-primary underline-offset-2 transition-colors duration-200 hover:underline"
          >
            {text.link}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
