import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Eye,
  Pencil,
  Copy,
  Trash2,
  KeyRound,
  ChevronDown,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type DropdownMenuEntry =
  | {
      type?: "item";
      label: string;
      icon?: LucideIcon;
      shortcut?: string;
      variant?: "default" | "destructive";
      disabled?: boolean;
    }
  | { type: "checkbox"; label: string; /** Checked on first render. */ checked?: boolean }
  | { type: "label"; label: string }
  | { type: "separator" };

export interface DropdownMenuProps extends VisualProps {
  /** Trigger label. */
  label?: string;
  /** Demo menu: show kbd shortcuts on the items. */
  shortcuts?: boolean;
  /** Demo menu: emphasize the destructive zone with two red items. */
  danger?: boolean;
  /** Demo menu: render checkbox items. */
  checks?: boolean;
  /** Menu entries; replaces the demo menu. */
  items?: DropdownMenuEntry[];
  /** Full-width trigger and menu, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const focusRingInset =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const itemBase = cn(
  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors select-none disabled:pointer-events-none disabled:opacity-50",
  focusRingInset,
);
const itemTone = {
  default:
    "hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground",
  destructive:
    "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 dark:hover:bg-destructive/20 dark:focus-visible:bg-destructive/20",
};

const kbdClasses =
  "ml-auto rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground";

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const menuIn = {
  hidden: { opacity: 0, y: -4, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
} as const;

function demoMenu(shortcuts: boolean, danger: boolean, checks: boolean): DropdownMenuEntry[] {
  const key = (k: string) => (shortcuts ? k : undefined);
  const main: DropdownMenuEntry[] = danger
    ? [
        { label: "View details", icon: Eye },
        { label: "Edit", icon: Pencil },
      ]
    : checks
      ? [
          { type: "checkbox", label: "Show grid", checked: true },
          { type: "checkbox", label: "Snap to guides", checked: true },
          { type: "checkbox", label: "Rulers", checked: false },
        ]
      : [
          { label: "View details", icon: Eye, shortcut: key("⌘O") },
          { label: "Edit", icon: Pencil, shortcut: key("⌘E") },
          { label: "Duplicate", icon: Copy, shortcut: key("⌘D") },
        ];
  const dangerous: DropdownMenuEntry[] = danger
    ? [
        { label: "Delete project", icon: Trash2, variant: "destructive" },
        { label: "Disable API key", icon: KeyRound, variant: "destructive" },
      ]
    : [{ label: "Delete", icon: Trash2, variant: "destructive", shortcut: key("⌘⌫") }];
  return [...main, { type: "separator" }, ...dangerous];
}

export function DropdownMenu({
  label = "Project options",
  shortcuts = false,
  danger = false,
  checks = false,
  items,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const entries = items ?? demoMenu(shortcuts, danger, checks);
  const [checked, setChecked] = useState(() =>
    entries.map((entry) => entry.type === "checkbox" && !!entry.checked),
  );
  const focusable = entries
    .map((entry, i) =>
      entry.type === "separator" ||
      entry.type === "label" ||
      ("disabled" in entry && entry.disabled)
        ? -1
        : i,
    )
    .filter((i) => i >= 0);
  const [focused, setFocused] = useState(focusable[0] ?? -1);
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

  const menuId = `${id}-menu`;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = focusable.indexOf(focused);
    const last = focusable.length - 1;
    const step =
      event.key === "ArrowDown"
        ? at === last
          ? 0
          : at + 1
        : event.key === "ArrowUp"
          ? at <= 0
            ? last
            : at - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (step < 0 || last < 0) return;
    event.preventDefault();
    const next = focusable[step]!;
    setFocused(next);
    itemRefs.current[next]?.focus();
  };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("relative", fill && "w-full self-start")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded="true"
          aria-controls={menuId}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            focusRing,
            fill && "w-full justify-between",
          )}
        >
          {label}
          <ChevronDown className="size-4 opacity-60" />
        </button>
        <motion.div
          variants={animated ? menuIn : undefined}
          {...state}
          role="menu"
          aria-label={label}
          id={menuId}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute top-full left-0 z-10 mt-1.5 origin-top rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
            fill ? "w-full" : "w-56",
          )}
        >
          {entries.map((entry, i) => {
            if (entry.type === "separator")
              return <div key={i} role="separator" className="-mx-1 my-1 h-px bg-border" />;
            if (entry.type === "label")
              return (
                <div key={i} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {entry.label}
                </div>
              );
            const common = {
              ref: (el: HTMLButtonElement | null) => {
                itemRefs.current[i] = el;
              },
              type: "button" as const,
              tabIndex: i === focused ? 0 : -1,
              onFocus: () => setFocused(i),
            };
            if (entry.type === "checkbox") {
              const on = checked[i] ?? false;
              return (
                <button
                  key={i}
                  {...common}
                  role="menuitemcheckbox"
                  aria-checked={on}
                  onClick={() => setChecked((all) => all.map((c, j) => (j === i ? !c : c)))}
                  className={cn(itemBase, itemTone.default)}
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/80 bg-transparent dark:bg-input/30",
                    )}
                  >
                    {on && <Check className="size-3" />}
                  </span>
                  {entry.label}
                </button>
              );
            }
            const destructive = entry.variant === "destructive";
            const Icon = entry.icon;
            return (
              <button
                key={i}
                {...common}
                role="menuitem"
                disabled={entry.disabled}
                className={cn(itemBase, destructive ? itemTone.destructive : itemTone.default)}
              >
                {Icon && (
                  <Icon
                    className={cn("size-4 shrink-0", !destructive && "text-muted-foreground")}
                  />
                )}
                {entry.label}
                {entry.shortcut && <kbd className={kbdClasses}>{entry.shortcut}</kbd>}
              </button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
