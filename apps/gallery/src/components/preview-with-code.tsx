import { useState } from "react";
import { cn } from "@cremona/core";
import { CodePanel, PreviewToolbar } from "./code-panel.js";
import type { BlockEntry } from "../lib/discovery.js";

export interface PreviewWithCodeProps {
  entry: BlockEntry;
  label: string;
  size?: string | null;
  children: React.ReactNode;
}

/** Preview frame + toolbar (code, copy) + code panel. Group hover reveals the toolbar. */
export function PreviewWithCode({ entry, label, size, children }: PreviewWithCodeProps) {
  const [open, setOpen] = useState(false);
  void cn;
  void size;
  return (
    <div className="group/preview relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-muted/20 dark:bg-muted/15">
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        <PreviewToolbar entry={entry} label={label} onOpenCode={() => setOpen(true)} />
      </div>
      <div className="flex grow items-center gap-2">{children}</div>
      <CodePanel open={open} onClose={() => setOpen(false)} entry={entry} label={label} />
      <div className="bg-muted/25 px-2 py-2.25 text-center text-xs font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
