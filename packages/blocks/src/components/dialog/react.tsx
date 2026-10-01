"use client";

import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { X, Trash2 } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface DialogField {
  label: string;
  type?: "text" | "email" | "select";
  placeholder?: string;
  /** Choices of a `select` field. */
  options?: string[];
  /** Initial value. */
  value?: string;
}

export interface DialogChange {
  file: string;
  status: string;
}

export interface DialogLabels {
  /** Accessible name of the close button. */
  close: string;
}

export const dialogDefaultLabels: DialogLabels = {
  close: "Close",
};

export interface DialogProps extends VisualProps {
  title?: string;
  description?: string;
  /** Visual intent: neutral confirm or destructive (`danger` is a deprecated alias). */
  variant?: "default" | "destructive" | "danger";
  /** Form layout with inputs above the actions. */
  form?: boolean;
  /** Extra-wide card with a changes summary. */
  width?: "default" | "wide";
  /** Confirm button text (default: "Publish", "Send invite" or "Delete project"). */
  actionLabel?: string;
  cancelLabel?: string;
  /** Form fields (default: the invite form when `form`). */
  fields?: DialogField[];
  /** Changes summary (default: three files when `width` is "wide"). */
  changes?: DialogChange[];
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<DialogLabels>;
  /** The scrim fills the box; the dialog stays centred at its own size. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const demoChanges: DialogChange[] = [
  { file: "blog/launch-post.md", status: "edited" },
  { file: "docs/api-reference.md", status: "edited" },
  { file: "src/theme.css", status: "added" },
];

const demoFields: DialogField[] = [
  { label: "Email", type: "email", placeholder: "teammate@acme.com" },
  {
    label: "Role",
    type: "select",
    options: ["Developer", "Reviewer", "Viewer"],
    value: "Developer",
  },
];

const buttonBase = cn(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-all select-none active:translate-y-px",
  focusRing,
);

const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  outline:
    "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
};

const fieldClasses = cn(
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground",
  focusRing,
);

const scrim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const cardIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 380, damping: 16 },
      opacity: { duration: 0.35, ease: "easeOut" },
    },
  },
} as const;

export function Dialog({
  title = "Publish changes",
  description,
  variant = "default",
  form = false,
  width = "default",
  actionLabel,
  cancelLabel = "Cancel",
  fields,
  changes,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
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

  const text = { ...dialogDefaultLabels, ...labels };
  const destructive = variant === "destructive" || variant === "danger";
  const resolvedDescription =
    description ??
    (destructive
      ? "This will permanently delete the project and all of its environments. This action cannot be undone."
      : "Your draft is ready. Publishing will make this version visible to everyone in the workspace.");
  const primary =
    actionLabel ?? (destructive ? "Delete project" : form ? "Send invite" : "Publish");
  const shownFields = fields ?? (form ? demoFields : []);
  const shownChanges = changes ?? (width === "wide" ? demoChanges : []);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        variants={animated ? scrim : undefined}
        {...state}
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-xs dark:bg-black/60"
      />
      <motion.div
        variants={animated ? cardIn : undefined}
        {...state}
        role={destructive ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-10 w-full rounded-xl border bg-card p-5 text-card-foreground shadow-lg",
          width === "wide" ? "max-w-md" : "max-w-sm",
          fill && "mx-4 self-center",
        )}
      >
        <button
          type="button"
          aria-label={text.close}
          className={cn(
            "absolute top-3 right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            focusRing,
          )}
        >
          <X className="size-4" />
        </button>
        {destructive && (
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <h2 id={titleId} className="pr-6 text-base font-semibold text-foreground">
            {title}
          </h2>
          <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">
            {resolvedDescription}
          </p>
        </div>
        {shownFields.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {shownFields.map((field, i) => {
              const fieldId = `${id}-field-${i}`;
              return (
                <div key={`${field.label}-${i}`} className="flex flex-col gap-1.5">
                  <label htmlFor={fieldId} className="text-xs font-medium text-foreground">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={fieldId}
                      className={fieldClasses}
                      defaultValue={field.value ?? field.options?.[0]}
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={fieldId}
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      defaultValue={field.value}
                      className={fieldClasses}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {shownChanges.length > 0 && (
          <ul className="mt-4 rounded-lg border border-border bg-muted/30 p-1.5">
            {shownChanges.map((change) => (
              <li
                key={change.file}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-xs"
              >
                <span className="font-mono text-[11px] text-foreground">{change.file}</span>
                <span className="text-muted-foreground">{change.status}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" className={cn(buttonBase, buttonVariants.outline)}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              buttonBase,
              destructive ? buttonVariants.destructive : buttonVariants.default,
            )}
          >
            {primary}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
