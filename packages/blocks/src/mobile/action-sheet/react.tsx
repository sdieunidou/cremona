"use client";

import { useId, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Copy,
  Download,
  Flag,
  Link,
  Mail,
  MessageCircle,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type ActionSheetIcon =
  "share" | "message" | "mail" | "copy" | "link" | "download" | "edit" | "flag" | "trash";

export interface ActionSheetOption {
  label: string;
  icon?: ActionSheetIcon;
  /** Secondary line under the label. */
  note?: string;
  destructive?: boolean;
}

export interface ActionSheetProps extends VisualProps {
  /** Use the destructive preset (share + delete) instead of the share preset. */
  danger?: boolean;
  /** Sheet title; each preset has its own. */
  title?: string;
  /** Options, top to bottom; replace the preset. */
  options?: ActionSheetOption[];
  cancelLabel?: string;
}

const icons: Record<ActionSheetIcon, LucideIcon> = {
  share: Share2,
  message: MessageCircle,
  mail: Mail,
  copy: Copy,
  link: Link,
  download: Download,
  edit: Pencil,
  flag: Flag,
  trash: Trash2,
};

const shareOptions: ActionSheetOption[] = [
  { icon: "share", label: "AirDrop" },
  { icon: "message", label: "Messages" },
  { icon: "mail", label: "Mail" },
  { icon: "copy", label: "Copy photo" },
];

const dangerOptions: ActionSheetOption[] = [
  { icon: "share", label: "Share photo…" },
  { icon: "trash", label: "Delete photo", note: "This can't be undone", destructive: true },
];

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function ActionSheet({
  danger = false,
  title,
  options,
  cancelLabel = "Cancel",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ActionSheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const id = useId();
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const list = options ?? (danger ? dangerOptions : shareOptions);
  const heading =
    title ?? (danger ? "This photo will be deleted from all your devices." : "Share photo");

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      {/* a bottom sheet: pinned to the bottom edge of its box */}
      <motion.div
        role="dialog"
        aria-labelledby={`${id}-title`}
        className={cn(
          "w-full self-end rounded-t-3xl border border-b-0 bg-background p-3 pb-4 shadow-2xl",
          !fill && "max-w-72",
        )}
        variants={animated ? sheetIn : undefined}
        {...state}
      >
        <div className="mx-auto h-1 w-8 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <p id={`${id}-title`} className="px-3 py-1 text-center text-xs text-muted-foreground">
          {heading}
        </p>
        <div className="flex flex-col gap-0.5">
          {list.map((option, i) => {
            const Icon = icons[option.icon ?? "share"] ?? Share2;
            return (
              <motion.button
                key={i}
                type="button"
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-left transition-colors duration-200",
                  option.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-muted",
                  focusRing,
                )}
                variants={animated ? optionIn(i) : undefined}
                {...state}
                {...noFocus}
              >
                <Icon className="size-4.5 shrink-0" strokeWidth={2} />
                {option.note ? (
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">{option.label}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {option.note}
                    </span>
                  </span>
                ) : (
                  <span className="truncate text-sm">{option.label}</span>
                )}
              </motion.button>
            );
          })}
        </div>
        <motion.button
          type="button"
          className={cn(
            "mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted/70",
            focusRing,
          )}
          variants={animated ? optionIn(list.length) : undefined}
          {...state}
          {...noFocus}
        >
          {cancelLabel}
        </motion.button>
      </motion.div>
    </div>
  );
}
