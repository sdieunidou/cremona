"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "./utils.js";
import { useFieldControl } from "./field.js";

/**
 * A set of radio buttons of which one is chosen. Arrow keys move the choice, and Tab leaves the group.
 * Name the group: a `FieldSet` with a `FieldLegend`, or `aria-label` / `aria-labelledby` here. Put each
 * `RadioGroupItem` in its own horizontal `Field` with a `FieldLabel`.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

/**
 * One radio button. A 24 × 24 px hit area (WCAG 2.5.8) surrounds the 16 px circle. Inside a `Field`
 * it is labelled, described and marked invalid by the field.
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const control = useFieldControl(props);
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      {...props}
      {...control}
      className={cn(
        "peer relative aspect-square size-4 shrink-0 rounded-full border border-input bg-transparent text-primary shadow-xs transition-colors outline-none after:absolute after:-inset-1 after:content-[''] dark:bg-input/30",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "data-[state=checked]:border-primary",
        className,
      )}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
