import { useEffect, useState } from "react";
import { X, Check, Copy, FileCode2 } from "lucide-react";
import { cn } from "@cremona/core";
import { reactUsage, loadReactSource, loadStimulusTemplate } from "../lib/code.js";
import type { BlockEntry } from "../lib/discovery.js";

type Tab = "usage" | "source" | "stimulus";

const TABS: { id: Tab; label: string }[] = [
  { id: "usage", label: "Usage" },
  { id: "source", label: "React source" },
  { id: "stimulus", label: "Stimulus" },
];

export interface CodePanelProps {
  open: boolean;
  onClose: () => void;
  entry: BlockEntry;
  label: string;
}

/** Full-frame code overlay for one preview variant. */
export function CodePanel({ open, onClose, entry, label }: CodePanelProps) {
  const [tab, setTab] = useState<Tab>("usage");
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [stimulus, setStimulus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    if (tab === "source" && source === null) {
      loadReactSource(entry.key).then(setSource);
    }
    if (tab === "stimulus" && stimulus === undefined) {
      const variant = entry.meta.variants.find((v) => v.label === label);
      loadStimulusTemplate(entry.key, variant?.slug ?? entry.meta.variants[0]?.slug ?? "").then(setStimulus);
    }
  }, [open, tab, entry, label, source, stimulus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const variant = entry.meta.variants.find((v) => v.label === label);
  const usage = reactUsage(entry, label);
  const content =
    tab === "usage" ? usage : tab === "source" ? (source ?? "Loading…") : (stimulus ?? "Loading…");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Snippet usage"
      className="absolute inset-0 z-30 flex flex-col bg-background/95 backdrop-blur-xs"
    >
      <div className="flex min-h-12.5 items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors",
                tab === t.id
                  ? "bg-muted font-semibold text-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs/relaxed text-foreground font-mono">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

export interface ToolbarProps {
  entry: BlockEntry;
  label: string;
  onOpenCode: () => void;
}

/** Top-right toolbar of a preview frame: code toggle + copy buttons. */
export function PreviewToolbar({ entry, label, onOpenCode }: ToolbarProps) {
  const [copied, setCopied] = useState<"react" | "stimulus" | null>(null);

  const copy = async (kind: "react" | "stimulus") => {
    const text =
      kind === "react"
        ? reactUsage(entry, label)
        : await loadStimulusTemplate(
            entry.key,
            entry.meta.variants.find((v) => v.label === label)?.slug ?? "",
          );
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="View code"
        onClick={onOpenCode}
        className="inline-flex size-7 items-center justify-center rounded-md border bg-background/80 text-muted-foreground opacity-0 shadow-xs backdrop-blur-sm transition-opacity group-hover/preview:opacity-100 hover:text-foreground focus-visible:opacity-100"
      >
        <FileCode2 />
      </button>
      <button
        type="button"
        aria-label="Copy React usage"
        onClick={() => copy("react")}
        className="inline-flex size-7 items-center justify-center rounded-md border bg-background/80 text-muted-foreground opacity-0 shadow-xs backdrop-blur-sm transition-opacity group-hover/preview:opacity-100 hover:text-foreground focus-visible:opacity-100"
      >
        {copied === "react" ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
            aria-hidden="true"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>
    </>
  );
}
