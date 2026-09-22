import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { LayoutGrid, Activity, Settings } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface TabsProps extends VisualProps {
  /** Trigger labels. */
  tabs?: string[];
  /** Index of the tab selected on first render. */
  active?: number;
  /** Render the panel as a grid of stat panels. */
  panels?: boolean;
  /** Show an icon inside each trigger. */
  icons?: boolean;
}

const iconPool = [LayoutGrid, Activity, Settings];

const copy = [
  {
    body: "Your workspace at a glance — 12 deployments shipped this week and every check is green.",
    rows: [] as [string, string][],
  },
  {
    body: "",
    rows: [
      ["prod-api deployed to production", "2m ago"],
      ["#184 merged · docs refresh", "1h ago"],
      ["CI flake retried on main", "3h ago"],
    ] as [string, string][],
  },
  {
    body: "",
    rows: [
      ["Profile", "Name, avatar and email"],
      ["Notifications", "Mentions and weekly digests"],
      ["Danger zone", "Transfer or delete workspace"],
    ] as [string, string][],
  },
];

const stats: [string, string][] = [
  ["12", "Deployments"],
  ["3", "Open reviews"],
  ["98.9%", "Uptime"],
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Tabs({
  tabs = ["Overview", "Activity", "Settings"],
  active = 0,
  panels = false,
  icons = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: TabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(() =>
    Math.min(Math.max(active, 0), tabs.length - 1),
  );
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
  const indicatorId = useId();

  const tab = copy[Math.min(current, copy.length - 1)]!;
  const panelId = `cremona-tab-panel-${current}`;

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
        className={cn("w-full", !fill && "max-w-sm")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <div
          role="tablist"
          aria-label="Workspace"
          className="flex items-center gap-1 border-b border-border"
        >
          {tabs.map((label, i) => {
            const selected = i === current;
            const Icon = iconPool[i % iconPool.length]!;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                id={`cremona-tab-${i}`}
                aria-selected={selected}
                aria-controls={`cremona-tab-panel-${i}`}
                onClick={() => setCurrent(i)}
                className={cn(
                  "relative flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {icons && <Icon className="size-4" aria-hidden="true" />}
                {label}
                {selected && (
                  <motion.span
                    layoutId={indicatorId}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
        <motion.div
          key={current}
          role="tabpanel"
          id={panelId}
          aria-labelledby={`cremona-tab-${current}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pt-3"
        >
          {panels ? (
            <div className="grid grid-cols-3 gap-2">
              {stats.map(([value, label]) => (
                <div key={label} className="rounded-lg border bg-card px-3 py-2.5">
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          ) : tab.rows.length > 0 ? (
            <ul className="flex flex-col">
              {tab.rows.map(([title, meta]) => (
                <li
                  key={title}
                  className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-xs last:border-0"
                >
                  <span className="font-medium text-foreground">{title}</span>
                  <span className="text-muted-foreground">{meta}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs leading-5 text-muted-foreground">{tab.body}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
