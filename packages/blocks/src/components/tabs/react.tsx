import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { LayoutGrid, Activity, Settings, type LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface TabRow {
  title: string;
  meta: string;
}

export interface TabStat {
  value: string;
  label: string;
}

export interface TabItem {
  label: string;
  icon?: LucideIcon;
  /** Panel text. */
  body?: string;
  /** Panel list: a title and a meta per row. */
  rows?: TabRow[];
  /** Panel stat tiles. */
  stats?: TabStat[];
}

export interface TabsProps extends VisualProps {
  /** Trigger labels (demo panels). */
  tabs?: string[];
  /** Tabs with their panel content; overrides `tabs`. */
  items?: TabItem[];
  /** Index of the tab selected on first render. */
  active?: number;
  /** Render the panel as a grid of stat panels. */
  panels?: boolean;
  /** Show an icon inside each trigger. */
  icons?: boolean;
  /** Accessible name of the tab list. */
  label?: string;
  /** Full width and height of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const iconPool = [LayoutGrid, Activity, Settings];

const demoPanels: Omit<TabItem, "label">[] = [
  {
    body: "Your workspace at a glance — 12 deployments shipped this week and every check is green.",
  },
  {
    rows: [
      { title: "prod-api deployed to production", meta: "2m ago" },
      { title: "#184 merged · docs refresh", meta: "1h ago" },
      { title: "CI flake retried on main", meta: "3h ago" },
    ],
  },
  {
    rows: [
      { title: "Profile", meta: "Name, avatar and email" },
      { title: "Notifications", meta: "Mentions and weekly digests" },
      { title: "Danger zone", meta: "Transfer or delete workspace" },
    ],
  },
];

const demoStats: TabStat[] = [
  { value: "12", label: "Deployments" },
  { value: "3", label: "Open reviews" },
  { value: "98.9%", label: "Uptime" },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Tabs({
  tabs = ["Overview", "Activity", "Settings"],
  items,
  active = 0,
  panels = false,
  icons = false,
  label = "Workspace",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: TabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const list: TabItem[] =
    items ??
    tabs.map((tabLabel, i) => ({
      label: tabLabel,
      ...demoPanels[i % demoPanels.length],
      ...(panels ? { body: undefined, rows: undefined, stats: demoStats } : {}),
    }));
  const [current, setCurrent] = useState(() =>
    Math.min(Math.max(active, 0), Math.max(list.length - 1, 0)),
  );
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

  const selectedIndex = Math.min(current, list.length - 1);
  const tab = list[selectedIndex];
  const tabId = (i: number) => `${id}-tab-${i}`;
  const panelId = (i: number) => `${id}-panel-${i}`;

  const select = (i: number) => {
    setCurrent(i);
    tabRefs.current[i]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = list.length - 1;
    const next =
      event.key === "ArrowRight"
        ? selectedIndex === last
          ? 0
          : selectedIndex + 1
        : event.key === "ArrowLeft"
          ? selectedIndex === 0
            ? last
            : selectedIndex - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    select(next);
  };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("w-full", !fill && "max-w-sm")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div
          role="tablist"
          aria-label={label}
          className="flex items-center gap-1 border-b border-border"
        >
          {list.map((item, i) => {
            const selected = i === selectedIndex;
            const Icon = item.icon ?? (icons ? iconPool[i % iconPool.length] : undefined);
            return (
              <button
                key={i}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={tabId(i)}
                aria-selected={selected}
                aria-controls={selected ? panelId(i) : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => setCurrent(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors hover:text-foreground",
                  focusRing,
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {Icon && <Icon className="size-4" />}
                {item.label}
                {selected && (
                  <motion.span
                    layoutId={`${id}-indicator`}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
        {tab && (
          <motion.div
            key={selectedIndex}
            role="tabpanel"
            id={panelId(selectedIndex)}
            aria-labelledby={tabId(selectedIndex)}
            tabIndex={0}
            initial={animated ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("rounded-md pt-3", focusRing)}
          >
            {tab.stats ? (
              <div className="grid grid-cols-3 gap-2">
                {tab.stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border bg-card px-3 py-2.5">
                    <p className="text-base font-semibold tabular-nums text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : tab.rows && tab.rows.length > 0 ? (
              <ul className="flex flex-col">
                {tab.rows.map((row) => (
                  <li
                    key={row.title}
                    className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-xs last:border-0"
                  >
                    <span className="font-medium text-foreground">{row.title}</span>
                    <span className="text-muted-foreground">{row.meta}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-5 text-muted-foreground">{tab.body}</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
