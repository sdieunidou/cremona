import { useEffect, useRef, useState } from "react";
import { Search, Sun, Moon, Palette, Check } from "lucide-react";
import { SHELL } from "../lib/shell-classes.js";
import { CremonaMark } from "./sidebar.js";
import { categories } from "../lib/discovery.js";
import { cn } from "@cremona/core";
import type { Appearance } from "../lib/theme.js";

interface ThemeMeta {
  value: string;
  label: string;
  class: string | null;
  swatches: string[];
}

const THEMES: ThemeMeta[] = [
  { value: "default", label: "Default", class: null, swatches: ["oklch(0.205 0 0)", "oklch(0.556 0 0)", "oklch(0.922 0 0)"] },
  { value: "claude-plus", label: "Claude+", class: "theme-claude-plus", swatches: ["oklch(0.6171 0.1375 39.0427)", "oklch(0.6898 0.1581 290.4107)", "oklch(0.9245 0.0138 92.9892)"] },
  { value: "light-green", label: "Light Green", class: "theme-light-green", swatches: ["oklch(0.72 0.145 145)", "oklch(0.7227 0.192 149.5793)", "oklch(0.3717 0.0392 257.287)"] },
  { value: "zen", label: "Zen", class: "theme-zen", swatches: ["oklch(0.3012 0 0)", "oklch(0.6863 0.1743 34.2614)", "oklch(0.8647 0.0201 87.5232)"] },
  { value: "sakura", label: "Sakura", class: "theme-sakura", swatches: ["oklch(0.7508 0.161 2.6024)", "oklch(0.5367 0.153 7.7575)", "oklch(0.9239 0.0415 1.1045)"] },
  { value: "tiesen", label: "Tiesen", class: "theme-tiesen", swatches: ["oklch(0.2571 0.1161 272.24)", "oklch(0.5144 0.1605 267.44)", "oklch(0.9214 0.0248 257.65)"] },
  { value: "deep-purple", label: "Deep Purple", class: "theme-deep-purple", swatches: ["oklch(0.4865 0.2423 291.8661)", "oklch(0.6192 0.2037 312.7283)", "oklch(0.9546 0.0227 303.2883)"] },
  { value: "indigo-clean", label: "Indigo Clean", class: "theme-indigo-clean", swatches: ["oklch(0.5854 0.2041 277.1173)", "oklch(0.6056 0.2189 292.7172)", "oklch(0.9299 0.0334 272.7879)"] },
  { value: "brutalism", label: "Brutalism", class: "theme-brutalism", swatches: ["hsl(0, 100%, 43%)", "oklch(0.8408 0.1725 84.2008)", "oklch(0 0 0)"] },
];

export interface HeaderProps {
  appearance: Appearance;
  theme: string;
  onToggleDark: () => void;
  onTheme: (value: string) => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

const BUTTON =
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding text-sm font-medium whitespace-nowrap transition-transform outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export function Header({ appearance, theme, onToggleDark, onTheme, onOpenSearch, onToggleSidebar }: HeaderProps) {
  return (
    <header className={SHELL.pageHeader}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-16 flex h-14 items-center gap-2 bg-background/80 backdrop-blur md:gap-2 md:rounded-t-xl">
        <div className="mr-auto flex items-center gap-1 md:gap-2">
          <button
            type="button"
            className={cn(BUTTON, "size-9 md:hidden")}
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left lucide-sidebar" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(BUTTON, "h-9 px-2.5 gap-2 text-muted-foreground md:w-55 md:justify-start")}
            onClick={onOpenSearch}
          >
            <Search data-icon="inline-start" />
            <span className="hidden flex-1 text-left font-normal md:inline">Search visuals...</span>
            <span className="pointer-events-none hidden items-center gap-1 rounded border bg-background/75 px-1 py-0.25 text-[10px] font-semibold uppercase md:inline-flex">
              Ctrl K
            </span>
          </button>
          <a className="group flex md:hidden" href="/" aria-label="Cremona">
            <span className="inline-flex items-center gap-2 transition-opacity group-hover:opacity-80 ml-[36px]">
              <CremonaMark />
            </span>
          </a>
        </div>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <ThemePicker current={theme} onTheme={onTheme} />
          <button type="button" className={cn(BUTTON, "size-9")} onClick={onToggleDark} aria-label="Toggle theme">
            <Sun
              className={cn(
                "h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90",
                appearance === "dark" && "hidden",
              )}
            />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function ThemePicker({ current, onTheme }: { current: string; onTheme: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(BUTTON, "size-9")}
        aria-expanded={open}
        aria-label="Pick theme"
        onClick={() => setOpen((v) => !v)}
      >
        <Palette />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Theme</p>
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onTheme(t.value);
                setOpen(false);
              }}
            >
              <span className="flex gap-0.5">
                {t.swatches.map((s, i) => (
                  <span key={i} className="size-2.5 rounded-full border border-border/50" style={{ background: s }} />
                ))}
              </span>
              <span className="flex-1 text-left">{t.label}</span>
              {current === t.value && <Check className="size-4 opacity-70" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Ctrl+K command palette (simplified but POC-styled). */
export function SearchDialog({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const q = query.trim().toLowerCase();
  const results = q
    ? categories
        .flatMap((c) => c.items.map((i) => ({ cat: c, item: i })))
        .filter(
          ({ cat, item }) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            cat.category.toLowerCase().includes(q),
        )
        .slice(0, 24)
    : [];

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center bg-background/80 p-4 pt-[12vh] backdrop-blur-xs" onMouseDown={onClose}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 opacity-50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search visuals..."
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                onNavigate(`/visuals/${results[0].cat.slug}/${results[0].item.file}`);
                onClose();
              }
            }}
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-1.5">
          {q === "" ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Type to search {categories.reduce((n, c) => n + c.items.length, 0)} visuals…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results for “{query}”.</p>
          ) : (
            results.map(({ cat, item }) => (
              <button
                key={`${cat.slug}/${item.file}`}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onNavigate(`/visuals/${cat.slug}/${item.file}`);
                  onClose();
                }}
              >
                <span className="text-sm font-medium">
                  {highlight(item.name, q)} <span className="opacity-50">· {cat.category}</span>
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q);
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-yellow-200 text-foreground dark:bg-yellow-400 dark:text-black">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}
