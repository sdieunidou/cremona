import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { cn } from "@cremona/core";
import { stats } from "../lib/discovery.js";
import { queryWords, searchCatalog, type SearchHit } from "../lib/search.js";
import { useFocusTrap } from "../lib/focus.js";

// as many as fit without an inner scroll area
const SHOWN = 10;

/** Ctrl/⌘+K command palette: a combobox whose listbox holds the matching visuals. */
export function SearchDialog({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}) {
  if (!open) return null;
  return createPortal(<SearchPanel onClose={onClose} onNavigate={onNavigate} />, document.body);
}

function SearchPanel({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (to: string) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useFocusTrap(dialogRef, true, {
    onEscape: onClose,
    initialFocus: () => inputRef.current,
    inertOutside: () => [document.getElementById("root")],
    lockScroll: true,
  });

  const hits = searchCatalog(query);
  const shown = hits.slice(0, SHOWN);
  const current = shown[Math.min(active, shown.length - 1)];
  const optionId = (i: number) => `${id}-option-${i}`;
  const status =
    queryWords(query).length === 0
      ? ""
      : hits.length === 0
        ? `No results for “${query.trim()}”.`
        : hits.length > SHOWN
          ? `${hits.length} results, showing the first ${SHOWN}.`
          : `${hits.length} result${hits.length === 1 ? "" : "s"}.`;

  const open = (hit: SearchHit) => {
    onClose();
    onNavigate(`/visuals/${hit.key}`);
  };

  const moveTo = (i: number) => {
    setActive(i);
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(i))}`)
      ?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (shown.length === 0) return;
    const index = Math.min(active, shown.length - 1);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveTo((index + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo((index - 1 + shown.length) % shown.length);
    } else if (e.key === "Enter" && current) {
      e.preventDefault();
      open(current);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-background/80 p-4 pt-[12vh] backdrop-blur-xs"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
      >
        <h2 id={`${id}-title`} className="sr-only">
          Search visuals
        </h2>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 opacity-50" aria-hidden="true" />
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search visuals"
            aria-autocomplete="list"
            aria-expanded={shown.length > 0}
            aria-controls={`${id}-listbox`}
            aria-activedescendant={current ? optionId(shown.indexOf(current)) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search visuals..."
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded border bg-background/75 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Esc<span className="sr-only"> — close search</span>
          </button>
        </div>
        <div className="p-1.5">
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label="Visuals"
            className={cn(shown.length === 0 && "hidden")}
          >
            {shown.map((hit, i) => (
              // keyboard selection goes through the combobox input (aria-activedescendant)
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={hit.key}
                id={optionId(i)}
                role="option"
                tabIndex={-1}
                aria-selected={hit === current}
                className={cn(
                  "flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left",
                  hit === current && "bg-accent text-accent-foreground",
                )}
                onMouseMove={() => i !== active && setActive(i)}
                onClick={() => open(hit)}
              >
                <span className="text-sm font-medium">
                  <span>{highlight(hit.item.name, query)}</span>{" "}
                  <span className="font-normal text-muted-foreground">· {hit.group.category}</span>
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {hit.item.description}
                </span>
              </li>
            ))}
          </ul>
          {shown.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {queryWords(query).length === 0 ? `Type to search ${stats.blocks} visuals…` : status}
            </p>
          )}
          {hits.length > SHOWN && (
            <p className="px-3 py-2 text-center text-xs text-muted-foreground">
              {hits.length - SHOWN} more — refine the search to see them.
            </p>
          )}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
      </div>
    </div>
  );
}

/** Marks the start of every name word that a query word matches. */
function highlight(text: string, query: string): ReactNode {
  const words = queryWords(query);
  if (words.length === 0) return text;
  const pattern = new RegExp(
    `(^|[^a-z0-9])(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const start = m.index + m[1]!.length;
    parts.push(text.slice(last, start));
    parts.push(
      <mark
        key={start}
        className="rounded-[3px] bg-yellow-200 text-foreground dark:bg-yellow-400 dark:text-black"
      >
        {m[2]}
      </mark>,
    );
    last = start + m[2]!.length;
  }
  parts.push(text.slice(last));
  return parts;
}
