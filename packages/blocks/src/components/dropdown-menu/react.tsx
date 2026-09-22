import { useRef } from "react";
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
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface DropdownMenuProps extends VisualProps {
  /** Trigger label. */
  label?: string;
  /** Show kbd shortcuts on the items. */
  shortcuts?: boolean;
  /** Emphasize the destructive zone with two red items. */
  danger?: boolean;
  /** Render checkbox items. */
  checks?: boolean;
}

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

interface ItemDef {
  label: string;
  icon: typeof Eye;
  kbd?: string;
  danger?: boolean;
}

interface CheckDef {
  label: string;
  checked: boolean;
}

export function DropdownMenu({
  label = "Project options",
  shortcuts = false,
  danger = false,
  checks = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
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

  const itemClasses =
    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm outline-none transition-colors hover:bg-muted hover:text-foreground";
  const iconClasses = "size-4 shrink-0 text-muted-foreground";

  const mainItems: ItemDef[] = danger
    ? [
        { label: "View details", icon: Eye },
        { label: "Edit", icon: Pencil },
      ]
    : checks
      ? []
      : [
          { label: "View details", icon: Eye },
          { label: "Edit", icon: Pencil, kbd: "⌘E" },
          { label: "Duplicate", icon: Copy, kbd: "⌘D" },
        ];
  if (shortcuts && !danger) mainItems[0]!.kbd = "⌘O";

  const dangerItems: ItemDef[] = danger
    ? [
        { label: "Delete project", icon: Trash2, danger: true },
        { label: "Disable API key", icon: KeyRound, danger: true },
      ]
    : [{ label: "Delete", icon: Trash2, danger: true, kbd: shortcuts ? "⌘⌫" : undefined }];

  const checkItems: CheckDef[] = [
    { label: "Show grid", checked: true },
    { label: "Snap to guides", checked: true },
    { label: "Rulers", checked: false },
  ];

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
        className="relative"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded="true"
          aria-controls="cremona-dropdown-menu"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium shadow-xs transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        >
          {label}
          <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
        </button>
        <motion.div
          variants={animated ? menuIn : undefined}
          {...state}
          role="menu"
          aria-label={label}
          id="cremona-dropdown-menu"
          className="absolute left-0 top-full z-10 mt-1.5 w-56 origin-top rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {checks &&
            checkItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitemcheckbox"
                aria-checked={item.checked}
                className={itemClasses}
              >
                <span
                  className={cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                    item.checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-transparent dark:bg-input/30",
                  )}
                >
                  {item.checked && <Check className="size-3" aria-hidden="true" />}
                </span>
                {item.label}
              </button>
            ))}
          {mainItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={itemClasses}
            >
              <item.icon className={iconClasses} aria-hidden="true" />
              {item.label}
              {shortcuts && item.kbd && <kbd className={kbdClasses}>{item.kbd}</kbd>}
            </button>
          ))}
          <div role="separator" className="-mx-1 my-1 h-px bg-border" />
          {dangerItems.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn(itemClasses, "text-destructive hover:bg-destructive/10 hover:text-destructive")}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
              {shortcuts && item.kbd && <kbd className={kbdClasses}>{item.kbd}</kbd>}
            </button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
