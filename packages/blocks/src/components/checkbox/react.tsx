import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Minus } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CheckboxProps extends VisualProps {
  /** State on first render; clicking toggles it. */
  checked?: boolean | "indeterminate";
  label?: string;
  description?: string;
  /** @deprecated Use `checked="indeterminate"`. */
  mixed?: boolean;
  /** Selectable card with a description. */
  card?: boolean;
  disabled?: boolean;
  /** At the top of the box; the card variant takes its full width and height. */
  fill?: boolean;
}

const NO_REF = { current: null };

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
  disabled = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CheckboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<boolean | "indeterminate">(mixed ? "indeterminate" : checked);
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

  const indeterminate = value === "indeterminate";
  const on = value !== false;
  const control = {
    type: "button" as const,
    role: "checkbox",
    "aria-checked": indeterminate ? ("mixed" as const) : on,
    disabled,
    onClick: () => setValue((v) => v !== true),
  };
  const box = (
    <span
      className={cn(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200",
        indeterminate
          ? "border-primary bg-primary/20 text-primary"
          : on
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/80 bg-background dark:bg-input/30",
        !card &&
          "group-focus-visible/checkbox:outline-2 group-focus-visible/checkbox:outline-offset-2 group-focus-visible/checkbox:outline-ring",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-transform duration-200",
          on ? "scale-100" : "scale-0",
        )}
      >
        {indeterminate ? <Minus className="size-3" /> : <Check className="size-3" />}
      </span>
    </span>
  );

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={fill ? (card ? "flex w-full" : "w-full self-start") : undefined}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {card ? (
          <button
            {...control}
            className={cn(
              "flex w-full",
              !fill && "max-w-64",
              "items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
              on ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/40",
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
            {...control}
            className="group/checkbox flex w-fit items-center gap-2 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {box}
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
