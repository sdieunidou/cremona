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
  ShieldCheck,
  SunMoon,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface ListRowsProps extends VisualProps {
  groups?: number;
  icons?: boolean;
}

interface RowData {
  icon: LucideIcon;
  label: string;
  value?: string;
  tile?: string;
}

interface GroupData {
  title?: string;
  rows: RowData[];
}

const settingsRows: RowData[] = [
  { icon: Bell, label: "Notifications", value: "On" },
  { icon: SunMoon, label: "Appearance", value: "Dark" },
  { icon: Globe, label: "Language", value: "English" },
  { icon: HardDrive, label: "Storage", value: "24 GB" },
];

const iconRows: RowData[] = [
  {
    icon: Cloud,
    label: "iCloud sync",
    tile: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    icon: CreditCard,
    label: "Billing",
    tile: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: ShieldCheck,
    label: "Security",
    tile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Bell,
    label: "Reminders",
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const groupedGroups: GroupData[] = [
  {
    title: "General",
    rows: [
      { icon: Bell, label: "Notifications", value: "On" },
      { icon: Globe, label: "Language", value: "English" },
    ],
  },
  {
    title: "Appearance",
    rows: [
      { icon: SunMoon, label: "Theme", value: "Dark" },
      { icon: Type, label: "Text size", value: "Default" },
    ],
  },
];

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
  group: GroupData;
  startIndex: number;
  animated: boolean;
  state: Record<string, unknown>;
}) {
  return (
    <section className="flex flex-col">
      {group.title && (
        <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {group.title}
        </p>
      )}
      <motion.div
        className="divide-y divide-border/50 overflow-hidden rounded-xl border bg-card"
        variants={animated ? cardIn : undefined}
        {...state}
      >
        {group.rows.map((row, i) => (
          <motion.button
            key={row.label}
            type="button"
            className="flex h-11 w-full items-center gap-3 px-3 text-left transition-colors duration-200 hover:bg-muted"
            variants={animated ? rowIn(startIndex + i) : undefined}
            {...state}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                row.tile ?? "bg-primary/10 text-primary",
              )}
            >
              <row.icon className="size-3.5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {row.label}
            </span>
            {row.value && (
              <span className="shrink-0 text-xs text-muted-foreground">{row.value}</span>
            )}
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground/50"
              strokeWidth={2}
            />
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}

export function ListRows({
  groups = 1,
  icons = false,
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

  const sections: GroupData[] =
    groups >= 2
      ? groupedGroups
      : [{ rows: icons ? iconRows : settingsRows }];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full", !fill && "max-w-72", "flex-col",
          groups >= 2 ? "gap-3" : "gap-0",
        )}
      >
        {sections.map((group, g) => (
          <ListCard
            key={g}
            group={group}
            startIndex={g * 2}
            animated={animated}
            state={state}
          />
        ))}
      </div>
    </div>
  );
}
