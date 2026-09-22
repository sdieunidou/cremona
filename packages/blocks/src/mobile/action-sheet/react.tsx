import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Copy, Mail, MessageCircle, Share2, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ActionSheetProps extends VisualProps {
  danger?: boolean;
}

interface SheetOption {
  icon: LucideIcon;
  label: string;
  note?: string;
  destructive?: boolean;
}

const shareOptions: SheetOption[] = [
  { icon: Share2, label: "AirDrop" },
  { icon: MessageCircle, label: "Messages" },
  { icon: Mail, label: "Mail" },
  { icon: Copy, label: "Copy photo" },
];

const dangerOptions: SheetOption[] = [
  { icon: Share2, label: "Share photo…" },
  { icon: Trash2, label: "Delete photo", note: "This can't be undone", destructive: true },
];

const sheetIn = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 16 },
  },
} as const;

const optionIn = (i: number): Variants => ({
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.12 + i * 0.07, ease: "easeOut" },
  },
});

export function ActionSheet({
  danger = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ActionSheetProps) {
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

  const options = danger ? dangerOptions : shareOptions;

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
        className="w-72 rounded-t-3xl border bg-background p-3 shadow-2xl"
        variants={animated ? sheetIn : undefined}
        {...state}
      >
        <div className="mx-auto h-1 w-8 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <p className="py-1 text-center text-xs text-muted-foreground">
          {danger ? "Delete photo" : "Share photo"}
        </p>
        <div className="flex flex-col gap-0.5" role="menu">
          {options.map((option, i) => (
            <motion.button
              key={option.label}
              type="button"
              role="menuitem"
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-left transition-colors duration-200",
                option.destructive
                  ? "bg-destructive/5 text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted",
              )}
              variants={animated ? optionIn(i) : undefined}
              {...state}
            >
              <option.icon className="size-4.5 shrink-0" strokeWidth={2} />
              {option.note ? (
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-[11px] text-destructive/70">{option.note}</span>
                </span>
              ) : (
                <span className="text-sm">{option.label}</span>
              )}
            </motion.button>
          ))}
        </div>
        <motion.button
          type="button"
          className="mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted/70"
          variants={animated ? optionIn(options.length) : undefined}
          {...state}
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}
