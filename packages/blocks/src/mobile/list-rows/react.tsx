import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Bell,
  ChevronRight,
  Cloud,
  CreditCard,
  Globe,
  HardDrive,
  Lock,
  Settings,
  ShieldCheck,
  SunMoon,
  Type,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type ListRowIcon =
  | "bell"
  | "sun-moon"
  | "globe"
  | "hard-drive"
  | "cloud"
  | "credit-card"
  | "shield"
  | "type"
  | "user"
  | "lock"
  | "settings";

export type ListRowTone = "primary" | "info" | "success" | "warning" | "destructive";

export interface ListRow {
  label: string;
  icon?: ListRowIcon;
  /** Trailing value, e.g. the current setting. */
  value?: string;
  /** Color of the icon tile. */
  tone?: ListRowTone;
}

export interface ListRowGroup {
  title?: string;
  rows: ListRow[];
}

export interface ListRowsProps extends VisualProps {
  /** Preset: 1 = one card of settings, 2 = two titled groups. */
  groups?: number;
  /** Preset: colored icon tiles without values (with `groups` 1). */
  icons?: boolean;
  /** Custom content; replaces the presets. */
  sections?: ListRowGroup[];
}

const iconMap: Record<ListRowIcon, LucideIcon> = {
  bell: Bell,
  "sun-moon": SunMoon,
  globe: Globe,
  "hard-drive": HardDrive,
  cloud: Cloud,
  "credit-card": CreditCard,
  shield: ShieldCheck,
  type: Type,
  user: User,
  lock: Lock,
  settings: Settings,
};

const tones: Record<ListRowTone, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const settingsRows: ListRow[] = [
  { icon: "bell", label: "Notifications", value: "On" },
  { icon: "sun-moon", label: "Appearance", value: "Dark" },
  { icon: "globe", label: "Language", value: "English" },
  { icon: "hard-drive", label: "Storage", value: "24 GB" },
];

const iconRows: ListRow[] = [
  { icon: "cloud", label: "iCloud sync", tone: "info" },
  { icon: "credit-card", label: "Billing", tone: "primary" },
  { icon: "shield", label: "Security", tone: "success" },
  { icon: "bell", label: "Reminders", tone: "warning" },
];

const groupedGroups: ListRowGroup[] = [
  {
    title: "General",
    rows: [
      { icon: "bell", label: "Notifications", value: "On" },
      { icon: "globe", label: "Language", value: "English" },
    ],
  },
  {
    title: "Appearance",
    rows: [
      { icon: "sun-moon", label: "Theme", value: "Dark" },
      { icon: "type", label: "Text size", value: "Default" },
    ],
  },
];

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const cardIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const rowIn = (i: number): Variants => ({
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + i * 0.07, ease: "easeOut" },
  },
});

function ListCard({
  group,
  startIndex,
  animated,
  state,
}: {
  group: ListRowGroup;
  startIndex: number;
  animated: boolean;
  state: Record<string, unknown>;
}) {
  return (
    <section className="flex flex-col">
      {group.title && (
        <h2 className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {group.title}
        </h2>
      )}
      <motion.ul
        className="divide-y divide-border/50 overflow-hidden rounded-xl border bg-card"
        variants={animated ? cardIn : undefined}
        {...state}
      >
        {group.rows.map((row, i) => {
          const Icon = iconMap[row.icon ?? "settings"] ?? Settings;
          return (
            <li key={i}>
              <motion.button
                type="button"
                className="flex h-11 w-full items-center gap-3 px-3 text-left outline-none transition-colors duration-200 hover:bg-muted focus-visible:bg-muted"
                variants={animated ? rowIn(startIndex + i) : undefined}
                {...state}
                {...noFocus}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md",
                    tones[row.tone ?? "primary"] ?? tones.primary,
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{row.label}</span>
                {row.value && (
                  <span className="shrink-0 text-xs text-muted-foreground">{row.value}</span>
                )}
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground/50"
                  strokeWidth={2}
                />
              </motion.button>
            </li>
          );
        })}
      </motion.ul>
    </section>
  );
}

export function ListRows({
  groups = 1,
  icons = false,
  sections,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: ListRowsProps) {
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

  const list: ListRowGroup[] =
    sections ?? (groups >= 2 ? groupedGroups : [{ rows: icons ? iconRows : settingsRows }]);

  const starts = list.map((_, g) => list.slice(0, g).reduce((n, x) => n + x.rows.length, 0));
  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <div
        className={cn(
          "flex w-full",
          !fill && "max-w-72",
          "flex-col",
          list.length >= 2 ? "gap-3" : "gap-0",
        )}
      >
        {list.map((group, g) => (
          <ListCard
            key={g}
            group={group}
            startIndex={starts[g]!}
            animated={animated}
            state={state}
          />
        ))}
      </div>
    </div>
  );
}
