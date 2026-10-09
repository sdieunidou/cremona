"use client";

import * as React from "react";

import { cn } from "./utils.js";

interface TableContextValue {
  captionId: string;
  setHasCaption: (present: boolean) => void;
}

const TableContext = React.createContext<TableContextValue | null>(null);

type TableProps = React.ComponentProps<"table"> & {
  /** Class names of the scrollable region around the table. */
  containerClassName?: string;
  /** Accessible name of the scrollable region. Without it, the `TableCaption` names it. */
  label?: string;
};

/**
 * A data table. It scrolls sideways inside its own region instead of widening the page, and that
 * region takes keyboard focus while it overflows, so that a keyboard user can scroll it. Give it a
 * `TableCaption` or a `label`: they name the region for assistive technology.
 */
function Table({ className, containerClassName, label, ...props }: TableProps) {
  const captionId = React.useId();
  const [hasCaption, setHasCaption] = React.useState(false);
  const [scrollable, setScrollable] = React.useState(false);
  const region = React.useRef<HTMLDivElement>(null);
  const value = React.useMemo(() => ({ captionId, setHasCaption }), [captionId]);

  React.useEffect(() => {
    const element = region.current;
    if (!element) return;
    const update = () => setScrollable(element.scrollWidth > element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <TableContext.Provider value={value}>
      <div
        ref={region}
        data-slot="table-container"
        role="region"
        // a scrollable region must be reachable by keyboard (WCAG 2.1.1)
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={scrollable ? 0 : undefined}
        aria-label={label}
        aria-labelledby={!label && hasCaption ? captionId : undefined}
        className={cn(
          "relative w-full overflow-x-auto rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          containerClassName,
        )}
      >
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

/** A row. `data-state="selected"` highlights it. */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

/** A header cell, a column header by default (`scope="col"`); use `scope="row"` for a row header. */
function TableHead({ className, scope = "col", ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

/** The title of the table: it names the scrollable region. */
function TableCaption({ className, id, ...props }: React.ComponentProps<"caption">) {
  const table = React.useContext(TableContext);
  const setHasCaption = table?.setHasCaption;
  React.useEffect(() => {
    if (!setHasCaption) return;
    setHasCaption(true);
    return () => setHasCaption(false);
  }, [setHasCaption]);
  return (
    <caption
      id={id ?? table?.captionId}
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
};
