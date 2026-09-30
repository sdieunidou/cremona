import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@cremona/core";
import { takePendingFocus } from "../lib/router.js";

/** A page's <h1>; after an in-app navigation it takes focus, so keyboard and screen-reader users land on the new page. */
export function PageHeading({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (takePendingFocus()) ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={cn("outline-none", className)}>
      {children}
    </h1>
  );
}
