"use client";

import * as React from "react";

import { cn } from "./utils.js";
import { useFieldControl } from "./field.js";

/**
 * A multi-line text input. It grows with its content where the browser supports `field-sizing`, and is
 * 16 px on small screens (a smaller size makes iOS zoom in on focus), 14 px from `md`. Inside a `Field`
 * it is labelled, described and marked invalid by the field.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const control = useFieldControl(props);
  return (
    <textarea
      data-slot="textarea"
      {...props}
      {...control}
      className={cn(
        "flex min-h-16 w-full field-sizing-content rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    />
  );
}

export { Textarea };
