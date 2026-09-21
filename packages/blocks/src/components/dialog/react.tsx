import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { X, Trash2 } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface DialogProps extends VisualProps {
  title?: string;
  description?: string;
  /** Visual intent: neutral confirm or destructive. */
  variant?: "default" | "danger";
  /** Form layout with inputs above the actions. */
  form?: boolean;
  /** Extra-wide card with a changes summary. */
  width?: "default" | "wide";
}

const changes: [string, string][] = [
  ["blog/launch-post.md", "edited"],
  ["docs/api-reference.md", "edited"],
  ["src/theme.css", "added"],
];

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
  animated = false,
  trigger = "inView",
  className,
}: DialogProps) {
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

  const danger = variant === "danger";
  const resolvedDescription =
    description ??
    (danger
      ? "This will permanently delete the project and all of its environments. This action cannot be undone."
      : "Your draft is ready. Publishing will make this version visible to everyone in the workspace.");
  const primary = danger ? "Delete project" : form ? "Send invite" : "Publish";

  const fieldClasses =
    "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        variants={animated ? scrim : undefined}
        {...state}
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-xs dark:bg-black/60"
      />
      <motion.div
        variants={animated ? cardIn : undefined}
        {...state}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cremona-dialog-title"
        className={cn(
          "relative z-10 w-full rounded-xl border bg-card p-5 text-card-foreground shadow-lg",
          width === "wide" ? "max-w-md" : "max-w-sm",
        )}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        {danger && (
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" aria-hidden="true" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <h2 className="pr-6 text-base font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-xs leading-5 text-muted-foreground">
            {resolvedDescription}
          </p>
        </div>
        {form && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cremona-dialog-email"
                className="text-xs font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="cremona-dialog-email"
                type="email"
                placeholder="teammate@acme.com"
                className={fieldClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cremona-dialog-role"
                className="text-xs font-medium text-foreground"
              >
                Role
              </label>
              <select id="cremona-dialog-role" className={fieldClasses} defaultValue="Developer">
                <option>Developer</option>
                <option>Reviewer</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>
        )}
        {width === "wide" && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-1.5">
            {changes.map(([file, status]) => (
              <div
                key={file}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-xs"
              >
                <span className="font-mono text-[11px] text-foreground">{file}</span>
                <span className="text-muted-foreground">{status}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Cancel
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center justify-center rounded-md text-sm font-medium shadow-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              danger
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {primary}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
