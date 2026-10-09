import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils.js";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90",
        outline: "border-border text-foreground [a&]:hover:bg-muted",
        success: "bg-success/10 text-success [a&]:hover:bg-success/20",
        warning: "bg-warning/10 text-warning [a&]:hover:bg-warning/20",
        info: "bg-info/10 text-info [a&]:hover:bg-info/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Render the child element (a link, a router link…) with the badge's styles. */
    asChild?: boolean;
  };

/**
 * A short label: a count, a status, a category. `success`, `warning` and `info` are tinted with the
 * status tokens; a badge carries its meaning in its text, never in its colour alone.
 */
function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, type BadgeProps };
