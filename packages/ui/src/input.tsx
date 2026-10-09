"use client";

import * as React from "react";

import { cn } from "./utils.js";
import { useFieldControl } from "./field.js";

/**
 * A text input. 16 px text on small screens (a smaller size makes iOS zoom in on focus), 14 px from
 * `md`. Inside a `Field` it is labelled, described and marked invalid by the field.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const control = useFieldControl(props);
  return (
    <input
      type={type}
      data-slot="input"
      {...props}
      {...control}
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    />
  );
}

export { Input };
