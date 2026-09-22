import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, ChevronDown } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SelectProps extends VisualProps {
  value?: string;
  open?: boolean;
  invalid?: boolean;
}

const options = ["eu-west-1", "us-east-1", "ap-southeast-1"];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const menuIn = {
  hidden: { opacity: 0, y: -4, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
} as const;

export function Select({
  value = "eu-west-1",
  open = false,
  invalid = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SelectProps) {
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
        className={cn("flex w-full", !fill && "max-w-64", "flex-col gap-1.5")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div className="relative w-full">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-colors outline-none",
              invalid
                ? "border-destructive ring-3 ring-destructive/20"
                : "border-input hover:bg-muted/40",
            )}
          >
            <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
              {value || "Select region"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
          {open && (
            <motion.div
              role="listbox"
              aria-label="Region"
              className="absolute top-full z-10 mt-1.5 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
              variants={animated ? menuIn : undefined}
              {...state}
            >
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  className={cn(
                    "flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors hover:bg-muted",
                    option === value && "bg-muted font-medium text-foreground",
                  )}
                >
                  {option}
                  {option === value && <Check className="size-3.5" aria-hidden="true" />}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        {invalid && (
          <p className="text-xs text-destructive">Please choose a region.</p>
        )}
      </motion.div>
    </div>
  );
}
