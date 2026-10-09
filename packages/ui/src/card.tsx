import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "./utils.js";

type CardProps = React.ComponentProps<"div"> & {
  /** Render the child element (`article`, `section`, a link…) with the card's styles. */
  asChild?: boolean;
};

/**
 * A surface that groups related content: a `CardHeader` (with a `CardTitle`, a `CardDescription` and
 * a `CardAction`), a `CardContent` and a `CardFooter`. The header lays its action out beside the text
 * when the card is wide enough to hold both (a container query, not the viewport).
 */
function Card({ className, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

/** The title is a `div`: render the heading that fits the page with `asChild`, `<CardTitle asChild><h2>…</h2></CardTitle>`. */
function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Render the child element, a heading, with the title's styles. */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** A control or a link at the end of the header, beside the title and the description. */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps,
};
