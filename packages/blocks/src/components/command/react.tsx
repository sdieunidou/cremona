"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Search,
  SearchX,
  FilePlus,
  Rocket,
  LayoutDashboard,
  Settings,
  CloudUpload,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CommandItem {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  /** Extra words the search matches. */
  keywords?: string;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandLabels {
  /** Accessible name of the search input. */
  search: string;
  /** Key cap that closes the menu. */
  escape: string;
  /** Accessible name of the list of commands. */
  commands: string;
  /** Footer hints. */
  navigate: string;
  select: string;
}

export const commandDefaultLabels: CommandLabels = {
  search: "Search commands",
  escape: "esc",
  commands: "Commands",
  navigate: "Navigate",
  select: "Select",
};

export interface CommandProps extends VisualProps {
  /** Initial search query; only matching items are rendered. */
  query?: string;
  /** Force the empty state. */
  empty?: boolean;
  /** Headings of the groups shown while the query is empty (default: every group, or the first two of the demo catalog). */
  groups?: string[];
  /** The commands, by group; replaces the demo catalog. */
  catalog?: CommandGroup[];
  placeholder?: string;
  /** Empty-state title. */
  emptyText?: string;
  /** Empty-state hint (default: a hint for the demo catalog). */
  emptyHint?: string;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<CommandLabels>;
  /** Full width and height of the box; the list scrolls. */
  fill?: boolean;
}

const NO_REF = { current: null };

const demoCatalog: CommandGroup[] = [
  {
    heading: "Actions",
    items: [
      { label: "New file", icon: FilePlus, shortcut: "⌘N", keywords: "new file create" },
      {
        label: "Deploy to production",
        icon: Rocket,
        shortcut: "⇧⌘D",
        keywords: "deploy ship production release",
      },
    ],
  },
  {
    heading: "Navigation",
    items: [
      {
        label: "Go to dashboard",
        icon: LayoutDashboard,
        shortcut: "G D",
        keywords: "dashboard home overview",
      },
      { label: "Open settings", icon: Settings, shortcut: "G S", keywords: "settings preferences" },
    ],
  },
  {
    heading: "Deploy",
    items: [
      {
        label: "Promote build",
        icon: CloudUpload,
        shortcut: "⇧⌘P",
        keywords: "promote build deploy stage",
      },
      {
        label: "Rollback release",
        icon: Undo2,
        shortcut: "⇧⌘R",
        keywords: "rollback revert deploy undo",
      },
    ],
  },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Command({
  query = "",
  empty = false,
  groups,
  catalog,
  placeholder = "Type a command or search…",
  emptyText = "No results found",
  emptyHint,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CommandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [value, setValue] = useState(query);
  const [active, setActive] = useState(0);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const text = { ...commandDefaultLabels, ...labels };
  const source = catalog ?? demoCatalog;
  const shownGroups = groups ?? (catalog ? undefined : ["Actions", "Navigation"]);
  const needle = (empty ? "\u0000no-match" : value).trim().toLowerCase();
  // A query searches the whole catalog; without one, only the selected groups show.
  const rendered = source
    .filter((group) => needle || !shownGroups || shownGroups.includes(group.heading))
    .map((group) => ({
      heading: group.heading,
      items: group.items.filter((item) =>
        `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0);
  const flat = rendered.flatMap((group) => group.items);
  const offsets = rendered.map((_, g) =>
    rendered.slice(0, g).reduce((n, group) => n + group.items.length, 0),
  );
  const current = Math.min(active, flat.length - 1);
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-option-${i}`;
  const hint = emptyHint ?? (catalog ? undefined : "Try “deploy”, “settings” or “rollback”.");

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = flat.length - 1;
    if (last < 0) return;
    const next =
      event.key === "ArrowDown"
        ? current === last
          ? 0
          : current + 1
        : event.key === "ArrowUp"
          ? current <= 0
            ? last
            : current - 1
          : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    listRef.current
      ?.querySelector(`[id="${optionId(next)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  const hintKbd =
    "inline-flex h-4 min-w-4 items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground";

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        variants={animated ? entrance : undefined}
        {...state}
        className={cn(
          "group/command overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg",
          fill ? "flex w-full flex-col" : "w-72",
        )}
      >
        <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-label={text.search}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={current >= 0 ? optionId(current) : undefined}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {text.escape}
          </kbd>
        </div>
        <div ref={listRef} className={cn("p-1", fill && "min-h-0 flex-1 overflow-y-auto")}>
          <div id={listId} role="listbox" aria-label={text.commands}>
            {rendered.map((group, g) => {
              const headingId = `${id}-group-${g}`;
              return (
                <div key={group.heading}>
                  <div
                    id={headingId}
                    aria-hidden="true"
                    className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {group.heading}
                  </div>
                  <div role="group" aria-labelledby={headingId}>
                    {group.items.map((item, j) => {
                      const i = offsets[g]! + j;
                      const selected = i === current;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          id={optionId(i)}
                          role="option"
                          aria-selected={selected}
                          tabIndex={-1}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseMove={() => setActive(i)}
                          className={cn(
                            "flex h-8 w-full cursor-default items-center gap-2 rounded-md px-2 text-sm transition-colors select-none hover:bg-muted hover:text-foreground",
                            selected &&
                              "bg-muted text-foreground group-has-[input:focus-visible]/command:outline-2 group-has-[input:focus-visible]/command:-outline-offset-2 group-has-[input:focus-visible]/command:outline-ring",
                          )}
                        >
                          {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
                          {item.label}
                          {item.shortcut && (
                            <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {flat.length === 0 && (
            <div role="status" className="flex flex-col items-center gap-1 px-3 py-6 text-center">
              <SearchX className="size-4 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">{emptyText}</p>
              {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4 border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className={hintKbd}>↑</kbd>
            <kbd className={hintKbd}>↓</kbd>
            {text.navigate}
          </span>
          <span className="flex items-center gap-1">
            <kbd className={hintKbd}>↵</kbd>
            {text.select}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
