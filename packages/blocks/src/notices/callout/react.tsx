import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { CircleCheck, Info, OctagonX, Sparkles, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type CalloutVariant = "info" | "warning" | "update" | "success" | "error";

export interface CalloutProps extends VisualProps {
  variant?: CalloutVariant;
  /** Each variant has its own default copy. */
  title?: string;
  description?: string;
  /** Link text; an empty string hides the link. */
  link?: string;
  href?: string;
  /** Pill next to the title (the update variant shows "New"). */
  badge?: string;
}

const copy: Record<CalloutVariant, { title: string; description: string; link: string }> = {
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
    title: "Acme 2.4 is here",
    description: "Faster search, shared dashboards and a rebuilt command menu.",
    link: "See changelog",
  },
  success: {
    title: "Payment received",
    description: "Your invoice has been paid. A receipt is on its way to your inbox.",
    link: "View receipt",
  },
  error: {
    title: "Sync failed",
    description: "We couldn't reach your calendar. Your events are safe; try again.",
    link: "Retry",
  },
};

/** Status tones tint the box and color the icon; the text keeps the theme's foregrounds. */
const tones: Record<CalloutVariant, { box: string; icon: string; Icon: LucideIcon }> = {
  info: { box: "border-info/25 bg-info/5", icon: "text-info", Icon: Info },
  warning: { box: "border-warning/25 bg-warning/5", icon: "text-warning", Icon: TriangleAlert },
  update: { box: "border-primary/20 bg-primary/5", icon: "text-primary", Icon: Sparkles },
  success: { box: "border-success/25 bg-success/5", icon: "text-success", Icon: CircleCheck },
  error: {
    box: "border-destructive/25 bg-destructive/5",
    icon: "text-destructive",
    Icon: OctagonX,
  },
};

/** Preview only: keeps a link out of the tab order, unfocused and inactive on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent, onClick: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

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
  title,
  description,
  link,
  href = "#",
  badge,
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

  const { box, icon, Icon } = tones[variant] ?? tones.info;
  const text = copy[variant] ?? copy.info;
  const pill = badge ?? (variant === "update" ? "New" : undefined);
  const linkText = link ?? text.link;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.aside
        className={cn(
          "flex w-full",
          !fill && "max-w-80",
          "items-start gap-3 rounded-lg border p-4",
          box,
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <Icon className={cn("mt-0.5 size-4 shrink-0", icon)} aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{title ?? text.title}</p>
            {pill && (
              <motion.span
                className="inline-flex h-4.5 shrink-0 items-center rounded-full bg-primary/10 px-2 text-[10px] font-semibold text-primary"
                variants={animated ? badgeIn : undefined}
                {...state}
              >
                {pill}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description ?? text.description}</p>
          {linkText && (
            <a
              href={href}
              className="mt-1 w-fit rounded-sm text-xs font-medium text-primary underline-offset-2 outline-none transition-colors duration-200 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              {...noFocus}
            >
              {linkText}
            </a>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
