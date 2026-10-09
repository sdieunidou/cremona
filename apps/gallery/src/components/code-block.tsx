import { Check, Copy } from "lucide-react";
import { cn } from "@cremona/core";
import { useCopy } from "./code-panel.js";

/** A code listing with a copy button. `label` names it for assistive technology. */
export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label: string;
  className?: string;
}) {
  const [state, copy] = useCopy();
  return (
    <div
      className={cn("relative min-w-0 rounded-lg border border-border/60 bg-muted/50", className)}
    >
      <button
        type="button"
        onClick={() => copy(code)}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border bg-background/80 px-2 py-1 text-xs text-muted-foreground shadow-xs outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {state === "copied" ? (
          <Check className="size-3.5 text-success" aria-hidden="true" />
        ) : (
          <Copy className="size-3" aria-hidden="true" />
        )}
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
        <span className="sr-only"> {label}</span>
      </button>
      <pre
        role="region"
        aria-label={label}
        // a listing that scrolls must be reachable by keyboard (WCAG 2.1.1)
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="max-h-[32rem] overflow-auto rounded-lg px-3 py-3 pr-24 font-mono text-xs/relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
