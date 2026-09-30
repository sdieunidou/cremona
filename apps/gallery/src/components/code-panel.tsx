import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { X, Check, Copy, FileCode2 } from "lucide-react";
import { cn } from "@cremona/core";
import { reactUsage } from "../lib/code.js";
import type { BlockEntry } from "../lib/discovery.js";

type Tab = "usage" | "source" | "stimulus";

const TABS: { id: Tab; label: string }[] = [
  { id: "usage", label: "Usage" },
  { id: "source", label: "React source" },
  { id: "stimulus", label: "Stimulus" },
];

type Loaded = { status: "loading" } | { status: "ready"; text: string } | { status: "failed" };

const sources = () => import("../lib/sources.js");

function stimulusSlug(entry: BlockEntry, label: string): string {
  return (entry.meta.variants.find((v) => v.label === label) ?? entry.meta.variants[0])?.slug ?? "";
}

/** Copies to the clipboard; the returned state drives the button label. */
function useCopy(): ["idle" | "copied" | "failed", (text: string) => void] {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = (text: string) => {
    const done = (next: "copied" | "failed") => {
      setState(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1500);
    };
    // clipboard is missing outside secure contexts (plain-HTTP LAN) and can be denied
    if (!navigator.clipboard) return done("failed");
    navigator.clipboard.writeText(text).then(
      () => done("copied"),
      () => done("failed"),
    );
  };
  return [state, copy];
}

export interface CodePanelProps {
  onClose: () => void;
  entry: BlockEntry;
  label: string;
}

/** Code overlay for one preview variant: Usage / React source / Stimulus tabs. */
export function CodePanel({ onClose, entry, label }: CodePanelProps) {
  const id = useId();
  const [tab, setTab] = useState<Tab>("usage");
  const [source, setSource] = useState<Loaded>({ status: "loading" });
  const [stimulus, setStimulus] = useState<Loaded>({ status: "loading" });
  const [copyState, copy] = useCopy();
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const close = useEffectEvent(onClose);

  useEffect(() => {
    tabRefs.current.usage?.focus();
    // Escape closes the panel that holds focus (or any panel when nothing is focused)
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const focus = document.activeElement;
      if (e.key !== "Escape" || !(panelRef.current?.contains(focus) || focus === document.body))
        return;
      e.stopPropagation();
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const wantsSource = tab === "source";
  const wantsStimulus = tab === "stimulus";
  useEffect(() => {
    if (!wantsSource) return;
    let live = true;
    sources()
      .then((m) => m.loadReactSource(entry.key))
      .then(
        (text) => live && setSource(text ? { status: "ready", text } : { status: "failed" }),
        () => live && setSource({ status: "failed" }),
      );
    return () => {
      live = false;
    };
  }, [wantsSource, entry.key]);

  useEffect(() => {
    if (!wantsStimulus) return;
    let live = true;
    sources()
      .then((m) => m.loadStimulusTemplate(entry.key, stimulusSlug(entry, label)))
      .then(
        (text) => live && setStimulus(text ? { status: "ready", text } : { status: "failed" }),
        () => live && setStimulus({ status: "failed" }),
      );
    return () => {
      live = false;
    };
  }, [wantsStimulus, entry, label]);

  const loaded: Loaded =
    tab === "usage"
      ? { status: "ready", text: reactUsage(entry, label) }
      : tab === "source"
        ? source
        : stimulus;
  const content =
    loaded.status === "ready"
      ? loaded.text
      : loaded.status === "loading"
        ? "Loading…"
        : "Could not load this file. Reload the page to try again.";

  const select = (next: Tab) => {
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const at = (index: number) => TABS[(index + TABS.length) % TABS.length]!.id;
    const next =
      e.key === "ArrowRight"
        ? at(i + 1)
        : e.key === "ArrowLeft"
          ? at(i - 1)
          : e.key === "Home"
            ? at(0)
            : e.key === "End"
              ? at(TABS.length - 1)
              : null;
    if (!next) return;
    e.preventDefault();
    select(next);
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={`Code for ${label}`}
      className="absolute inset-0 z-30 flex flex-col bg-background/95 backdrop-blur-xs"
    >
      <div className="flex min-h-12.5 items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        <div role="tablist" aria-label="Code" className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`${id}-panel`}
              tabIndex={tab === t.id ? 0 : -1}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                tab === t.id
                  ? "bg-muted font-semibold text-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
              onClick={() => select(t.id)}
              onKeyDown={onTabKeyDown}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => loaded.status === "ready" && copy(loaded.text)}
            disabled={loaded.status !== "ready"}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {copyState === "copied" ? (
              <Check className="size-3.5 text-success" aria-hidden="true" />
            ) : (
              <Copy className="size-3" aria-hidden="true" />
            )}
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close code"
            className="inline-flex size-7 items-center justify-center rounded-md transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tab}`}
        tabIndex={0}
        className="flex-1 overflow-auto p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
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
  viewCodeRef?: Ref<HTMLButtonElement>;
}

const TOOL =
  "inline-flex size-7 items-center justify-center rounded-md border bg-background/80 text-muted-foreground opacity-0 shadow-xs backdrop-blur-sm transition-opacity outline-none group-hover/preview:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50";

/** Top-right toolbar of a preview frame: code toggle + copy buttons. */
export function PreviewToolbar({ entry, label, onOpenCode, viewCodeRef }: ToolbarProps) {
  const [copyState, copy] = useCopy();

  return (
    <>
      <button
        ref={viewCodeRef}
        type="button"
        aria-label="View code"
        onClick={onOpenCode}
        className={TOOL}
      >
        <FileCode2 aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={
          copyState === "copied"
            ? "React usage copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy React usage"
        }
        onClick={() => copy(reactUsage(entry, label))}
        className={TOOL}
      >
        {copyState === "copied" ? (
          <Check className="size-3.5 text-success" aria-hidden="true" />
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
