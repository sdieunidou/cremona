import { useEffect, useRef, useState } from "react";
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
  const viewCode = useRef<HTMLButtonElement>(null);
  const restore = useRef(false);

  // back to "View code" once the panel is gone and the toolbar is no longer inert
  useEffect(() => {
    if (open || !restore.current) return;
    restore.current = false;
    viewCode.current?.focus();
  }, [open]);

  return (
    <PreviewFrame
      label={label}
      size={size}
      stageInert={open}
      overlay={
        <>
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1" inert={open}>
            <PreviewToolbar
              entry={entry}
              label={label}
              onOpenCode={() => setOpen(true)}
              viewCodeRef={viewCode}
            />
          </div>
          {open && (
            <CodePanel
              entry={entry}
              label={label}
              onClose={() => {
                restore.current = true;
                setOpen(false);
              }}
            />
          )}
        </>
      }
    >
      {children}
    </PreviewFrame>
  );
}
