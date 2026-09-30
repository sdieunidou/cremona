import { useState } from "react";
import { CodePanel, PreviewToolbar } from "./code-panel.js";
import { PreviewFrame } from "./preview-frame.js";
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
  return (
    <PreviewFrame
      label={label}
      size={size}
      overlay={
        <>
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            <PreviewToolbar entry={entry} label={label} onOpenCode={() => setOpen(true)} />
          </div>
          <CodePanel open={open} onClose={() => setOpen(false)} entry={entry} label={label} />
        </>
      }
    >
      {children}
    </PreviewFrame>
  );
}
