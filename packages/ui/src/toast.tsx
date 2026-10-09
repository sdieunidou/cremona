"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";

import { cn } from "./utils.js";

type ToastVariant = "default" | "success" | "warning" | "info" | "destructive";

interface ToastOptions {
  /** The headline. */
  title?: React.ReactNode;
  /** The detail under the title. */
  description?: React.ReactNode;
  /**
   * `success`, `warning`, `info` and `destructive` add an icon and a coloured edge from the status
   * tokens. `destructive` and `warning` are announced at once, the others politely.
   */
  variant?: ToastVariant;
  /**
   * Milliseconds before the toast closes by itself; it waits while the pointer or focus is on it.
   * Default 5000, and no limit (`Infinity`) for a `destructive` toast and for one with an `action`:
   * an error or a choice must not vanish before it is read.
   */
  duration?: number;
  /**
   * A button: `onClick` runs, then the toast closes. `altText` says what it does for a screen reader
   * user who cannot reach the toast in time; it defaults to `label`.
   */
  action?: { label: string; onClick: () => void; altText?: string };
}

/** What `toast()` returns: the toast's `id`, and a way to close it or change it. */
interface ToastHandle {
  id: string;
  dismiss: () => void;
  update: (patch: ToastOptions) => void;
}

interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
}

const VISIBLE = 3;
const REMOVE_DELAY = 1000;
const NONE: ToastItem[] = [];

let items: ToastItem[] = NONE;
let counter = 0;
const listeners = new Set<() => void>();
const removals = new Map<string, ReturnType<typeof setTimeout>>();

function emit(next: ToastItem[]) {
  items = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function scheduleRemoval(id: string) {
  if (removals.has(id)) return;
  removals.set(
    id,
    setTimeout(() => {
      removals.delete(id);
      emit(items.filter((item) => item.id !== id));
    }, REMOVE_DELAY),
  );
}

/** Closes a toast, or every toast without an id. */
function dismiss(id?: string) {
  const ids = new Set(id ? [id] : items.map((item) => item.id));
  emit(items.map((item) => (ids.has(item.id) ? { ...item, open: false } : item)));
  for (const target of ids) scheduleRemoval(target);
}

/**
 * Shows a toast and returns its `id` with `dismiss()` and `update()`; `toast.dismiss(id?)` closes one
 * toast or all of them. A `Toaster` must be mounted once, near the root of the app. On the server it
 * does nothing.
 */
const toast = Object.assign(
  (options: ToastOptions): ToastHandle => {
    const id = `toast-${(counter += 1)}`;
    if (typeof window === "undefined") return { id, dismiss: () => {}, update: () => {} };
    emit([{ ...options, id, open: true }, ...items]);
    // a few at a time: the oldest ones go, with their exit animation
    items
      .filter((item) => item.open)
      .slice(VISIBLE)
      .forEach((item) => dismiss(item.id));
    return {
      id,
      dismiss: () => dismiss(id),
      update: (patch: ToastOptions) =>
        emit(items.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    };
  },
  { dismiss },
);

/** The toasts on screen, with `toast` and `dismiss`. */
function useToast() {
  const toasts = React.useSyncExternalStore(
    subscribe,
    () => items,
    () => NONE,
  );
  return { toasts, toast, dismiss };
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border bg-card p-4 pr-10 text-card-foreground shadow-lg",
  {
    variants: {
      variant: {
        default: "",
        success: "border-l-4 border-l-success",
        warning: "border-l-4 border-l-warning",
        info: "border-l-4 border-l-info",
        destructive: "border-l-4 border-l-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const icons = {
  success: { Icon: CircleCheckIcon, className: "text-success" },
  warning: { Icon: TriangleAlertIcon, className: "text-warning" },
  info: { Icon: InfoIcon, className: "text-info" },
  destructive: { Icon: CircleAlertIcon, className: "text-destructive" },
} as const;

interface ToasterProps {
  /**
   * Accessible name of the region that holds the toasts, where `{hotkey}` stands for the key that
   * moves focus to it (F8). Default `"Notifications ({hotkey})"`.
   */
  label?: string;
  /** Accessible name of each toast's close button. Default `"Close"`. */
  closeLabel?: string;
  /** Default milliseconds before a toast closes by itself. Default 5000. */
  duration?: number;
  /** The direction in which a swipe dismisses a toast. Default `"right"`. */
  swipeDirection?: "right" | "left" | "up" | "down";
  /** Class names of the region that holds the toasts, bottom right by default. */
  className?: string;
}

/**
 * Renders the toasts that `toast()` shows. Mount it once. A toast is read out by screen readers when it
 * appears (an error or a warning at once, the rest politely), pauses while the pointer or focus is on it,
 * closes with Escape or its button, and can be reached from anywhere with F8.
 */
function Toaster({
  label,
  closeLabel = "Close",
  duration = 5000,
  swipeDirection = "right",
  className,
}: ToasterProps) {
  const { toasts } = useToast();
  return (
    <ToastPrimitive.Provider label={label} duration={duration} swipeDirection={swipeDirection}>
      {toasts.map(
        ({ id, title, description, variant = "default", duration: own, action, open }) => {
          const status = variant === "default" ? null : icons[variant];
          return (
            <ToastPrimitive.Root
              key={id}
              data-slot="toast"
              data-variant={variant}
              open={open}
              onOpenChange={(next) => {
                if (!next) dismiss(id);
              }}
              type={
                variant === "destructive" || variant === "warning" ? "foreground" : "background"
              }
              duration={own ?? (variant === "destructive" || action ? Infinity : undefined)}
              className={cn(
                toastVariants({ variant }),
                "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none",
                "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:slide-in-from-bottom-4 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:slide-out-to-right-full",
              )}
            >
              {status && (
                <status.Icon
                  aria-hidden="true"
                  className={cn("mt-0.5 size-4 shrink-0", status.className)}
                />
              )}
              <div className="grid flex-1 gap-1">
                {title && (
                  <ToastPrimitive.Title data-slot="toast-title" className="text-sm font-semibold">
                    {title}
                  </ToastPrimitive.Title>
                )}
                {description && (
                  <ToastPrimitive.Description
                    data-slot="toast-description"
                    className="text-sm text-muted-foreground"
                  >
                    {description}
                  </ToastPrimitive.Description>
                )}
              </div>
              {action && (
                <ToastPrimitive.Action altText={action.altText ?? action.label} asChild>
                  <button
                    type="button"
                    data-slot="toast-action"
                    onClick={action.onClick}
                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {action.label}
                  </button>
                </ToastPrimitive.Action>
              )}
              <ToastPrimitive.Close
                data-slot="toast-close"
                aria-label={closeLabel}
                className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <XIcon aria-hidden="true" className="size-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        },
      )}
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          "fixed right-0 bottom-0 z-100 flex max-h-screen w-full flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none sm:max-w-sm",
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

export { Toaster, toast, useToast, type ToastHandle, type ToastOptions, type ToasterProps };
