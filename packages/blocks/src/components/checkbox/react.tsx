import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Minus } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CheckboxProps extends VisualProps {
  checked?: boolean;
  label?: string;
  description?: string;
  mixed?: boolean;
  card?: boolean;
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Checkbox({
  checked = false,
  label = "Accept terms",
  description = "Unlimited projects and priority support.",
  mixed = false,
  card = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CheckboxProps) {
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

  const on = checked || mixed;
  const box = (
    <span
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200",
        mixed
          ? "border-primary bg-primary/20 text-primary"
          : on
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background dark:bg-input/30",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-transform duration-200",
          on ? "scale-100" : "scale-0",
        )}
      >
        {mixed ? <Minus className="size-3" /> : <Check className="size-3" />}
      </span>
    </span>
  );

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
        variants={animated ? entrance : undefined}
        {...state}
      >
        {card ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={mixed ? "mixed" : checked}
            className={cn(
              "flex w-full", !fill && "max-w-64", "items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200",
              on
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:bg-muted/40",
            )}
          >
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </span>
            {box}
          </button>
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={mixed ? "mixed" : checked}
            className="flex w-fit items-center gap-2"
          >
            {box}
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
