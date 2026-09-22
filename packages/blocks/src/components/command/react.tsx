import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Search, SearchX, FilePlus, Rocket, LayoutDashboard, Settings, CloudUpload, Undo2 } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface CommandProps extends VisualProps {
  /** Initial search query; only matching items are rendered. */
  query?: string;
  /** Force the empty state. */
  empty?: boolean;
  /** Group labels to render. */
  groups?: string[];
}

interface CommandItem {
  label: string;
  icon: typeof Search;
  kbd?: string;
  terms: string;
}

const catalog: Record<string, CommandItem[]> = {
  Actions: [
    { label: "New file", icon: FilePlus, kbd: "⌘N", terms: "new file create" },
    {
      label: "Deploy to production",
      icon: Rocket,
      kbd: "⇧⌘D",
      terms: "deploy ship production release",
    },
  ],
  Navigation: [
    {
      label: "Go to dashboard",
      icon: LayoutDashboard,
      kbd: "G D",
      terms: "dashboard home overview",
    },
    {
      label: "Open settings",
      icon: Settings,
      kbd: "G S",
      terms: "settings preferences",
    },
  ],
  Deploy: [
    {
      label: "Promote build",
      icon: CloudUpload,
      kbd: "⇧⌘P",
      terms: "promote build deploy stage",
    },
    {
      label: "Rollback release",
      icon: Undo2,
      kbd: "⇧⌘R",
      terms: "rollback revert deploy undo",
    },
  ],
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Command({
  query = "",
  empty = false,
  groups = ["Actions", "Navigation"],
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: CommandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(query);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const needle = (empty ? "\u0000no-match" : value).trim().toLowerCase();
  // A query searches the whole catalog; without one, only the selected groups show.
  const groupPool = needle
    ? Object.keys(catalog)
    : groups.filter((g) => catalog[g]);
  const rendered = groupPool
    .map((label) => ({
      label,
      items: catalog[label]!.filter((item) =>
        `${item.label} ${item.terms}`.toLowerCase().includes(needle),
      ),
    }))
    .filter((g) => g.items.length > 0);
  const noResults = rendered.length === 0;
  let first = true;

  const itemClasses =
    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors hover:bg-muted hover:text-foreground";
  const kbdClasses =
    "ml-auto rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground";
  const hintKbd =
    "inline-flex h-4 min-w-4 items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        variants={animated ? entrance : undefined}
        {...state}
        className="w-72 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="flex h-11 items-center gap-2 border-b px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type a command or search…"
            aria-label="Search commands"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            esc
          </kbd>
        </div>
        <div className="p-1" role="listbox" aria-label="Commands">
          {rendered.map((group) => (
            <div key={group.label}>
              <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const selected = first;
                first = false;
                return (
                  <button
                    key={item.label}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cn(itemClasses, selected && "bg-muted")}
                  >
                    <item.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    {item.label}
                    {item.kbd && <kbd className={kbdClasses}>{item.kbd}</kbd>}
                  </button>
                );
              })}
            </div>
          ))}
          {noResults && (
            <div className="flex flex-col items-center gap-1 px-3 py-6 text-center">
              <SearchX className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-medium text-foreground">No results found</p>
              <p className="text-[11px] text-muted-foreground">
                Try “deploy”, “settings” or “rollback”.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className={hintKbd}>↑</kbd>
            <kbd className={hintKbd}>↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className={hintKbd}>↵</kbd>
            Select
          </span>
        </div>
      </motion.div>
    </div>
  );
}
