import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils.js";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground *:data-[slot=alert-description]:text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        info: "border-info/30 bg-info/10 text-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type AlertProps = React.ComponentProps<"div"> & VariantProps<typeof alertVariants>;

/**
 * A message in the page. `destructive` and `warning` are announced at once (`role="alert"`), the others
 * politely (`role="status"`); pass `role` to choose. A message that is on screen when the page loads
 * needs neither: `role="none"` leaves it to be read in order. Put an icon first (it is hidden from
 * assistive technology by its own `aria-hidden`), then an `AlertTitle` and an `AlertDescription`.
 */
function Alert({ className, variant, role, ...props }: AlertProps) {
  const defaultRole = variant === "destructive" || variant === "warning" ? "alert" : "status";
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? "default"}
      role={role ?? defaultRole}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants, type AlertProps };
