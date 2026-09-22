import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { LoaderCircle } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ButtonProps extends VisualProps {
  /** Visual intent. */
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon" | "icon-sm";
  label?: string;
  /** true = leading icon, "end" = trailing icon */
  withIcon?: boolean | "end";
  loading?: boolean;
  disabled?: boolean;
}

const variantClasses: Record<string, string> = {
  default:
    "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
  outline:
    "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  ghost: "hover:bg-muted hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<string, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs font-medium has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  default:
    "h-9 gap-2 rounded-md px-2.5 text-sm font-medium has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
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
  loading = false,
  disabled = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ButtonProps) {
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

  const Icon = withIcon ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-arrow-right size-4"
      data-icon={withIcon === "end" ? "inline-end" : "inline-start"}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ) : null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div variants={animated ? entrance : undefined} {...state}>
        <button
          type="button"
          className={cn(
            "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            variantClasses[variant],
            sizeClasses[size],
            loading && "gap-2",
            disabled && "opacity-50",
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              <span>Working…</span>
            </>
          ) : (
            <>
              {withIcon && withIcon !== "end" && Icon}
              <span>{label}</span>
              {withIcon === "end" && Icon}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
