"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CreditCard,
  LayoutDashboard,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface DashboardShellLabels {
  /** Navigation items; `overview` is also the mobile page title. */
  overview: string;
  analytics: string;
  customers: string;
  billing: string;
  settings: string;
  /** Role under the user's name. */
  role: string;
  /** Search field placeholder. */
  search: string;
  chartTitle: string;
  chartRange: string;
  invoicesTitle: string;
  viewAll: string;
  /** Plan of an invoice row; `{plan}` is replaced by the plan name. */
  plan: string;
  /** Invoice statuses. */
  paid: string;
  sent: string;
  overdue: string;
}

export const dashboardShellDefaultLabels: DashboardShellLabels = {
  overview: "Overview",
  analytics: "Analytics",
  customers: "Customers",
  billing: "Billing",
  settings: "Settings",
  role: "Admin",
  search: "Search…",
  chartTitle: "Revenue overview",
  chartRange: "Last 30 days",
  invoicesTitle: "Recent invoices",
  viewAll: "View all",
  plan: "{plan} plan",
  paid: "Paid",
  sent: "Sent",
  overdue: "Overdue",
};

export interface DashboardShellStat {
  label: string;
  /** Pre-formatted value. */
  value: string;
  /** Pre-formatted change. */
  change: string;
  /** Direction of `change` (default: "down" when `change` starts with a minus sign). */
  trend?: "up" | "down";
}

export type DashboardShellInvoiceStatus = "paid" | "sent" | "overdue";

export interface DashboardShellInvoice {
  name: string;
  /** Plan name, shown through `labels.plan`. */
  plan: string;
  /** `paid`, `sent` or `overdue` take their label and tint; another value shows as is, in a neutral pill. */
  status: DashboardShellInvoiceStatus | (string & {});
  /** Pre-formatted amount. */
  amount: string;
}

export const dashboardShellDefaultStats: DashboardShellStat[] = [
  { label: "Revenue", value: "$48.2k", change: "+12.4%", trend: "up" },
  { label: "Active users", value: "8,102", change: "+3.1%", trend: "up" },
  { label: "Conversion", value: "4.7%", change: "-0.8%", trend: "down" },
];

export const dashboardShellDefaultInvoices: DashboardShellInvoice[] = [
  { name: "Nova Labs", plan: "Pro", status: "paid", amount: "$120.00" },
  { name: "Hopper Co.", plan: "Team", status: "sent", amount: "$84.00" },
  { name: "Orbit AI", plan: "Pro", status: "overdue", amount: "$220.00" },
];

export interface DashboardShellProps extends VisualProps {
  /** Collapse the sidebar rail to icon-only width. */
  collapsed?: boolean;
  /** Render the mobile chrome: stacked KPI cards and a bottom tab bar. */
  viewport?: "desktop" | "mobile";
  /** KPI tiles (three in the demo). */
  stats?: readonly DashboardShellStat[];
  /** Rows of the recent invoices card (desktop). */
  invoices?: readonly DashboardShellInvoice[];
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<DashboardShellLabels>;
}

/** Replaces each `{key}` of a label with its value. */
function interpolate(label: string, values: Record<string, string>): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key]! : match,
  );
}

const navItems: { icon: LucideIcon; id: keyof DashboardShellLabels; active?: boolean }[] = [
  { icon: LayoutDashboard, id: "overview", active: true },
  { icon: TrendingUp, id: "analytics" },
  { icon: Users, id: "customers" },
  { icon: CreditCard, id: "billing" },
  { icon: Settings, id: "settings" },
];

const tabItems: { icon: LucideIcon; active?: boolean }[] = [
  { icon: LayoutDashboard, active: true },
  { icon: TrendingUp },
  { icon: Users },
  { icon: Settings },
];

const sparkPath = "M0 22 L10 18 L20 20 L30 14 L40 16 L50 10 L60 12 L70 7 L80 9 L90 5 L100 6";

/* Staged entrance: the shell fades in, regions follow in .07s steps. */
const shell = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const regions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
} as const;

const subRegions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
} as const;

const region = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const tiles = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
} as const;

const tile = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

/* status tints and marks; the text stays foreground so it reads in every theme */
const statusTones: Record<DashboardShellInvoiceStatus, { pill: string; mark: string }> = {
  paid: { pill: "bg-success/10", mark: "bg-success" },
  sent: { pill: "bg-warning/10", mark: "bg-warning" },
  overdue: { pill: "bg-destructive/10", mark: "bg-destructive" },
};
const neutralTone = { pill: "bg-muted", mark: "bg-muted-foreground" };

function DeltaPill({ delta, up }: { delta: string; up: boolean }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1 py-px text-[7px] font-semibold text-foreground tabular-nums",
        up ? "bg-success/10" : "bg-destructive/10",
      )}
    >
      <Icon
        className={cn("size-1.5", up ? "text-success" : "text-destructive")}
        strokeWidth={2.5}
      />
      {delta}
    </span>
  );
}

function Rail({ collapsed, text }: { collapsed: boolean; text: DashboardShellLabels }) {
  return (
    <motion.aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-sidebar p-1.5 text-sidebar-foreground",
        collapsed ? "w-8 items-center" : "w-24",
      )}
      variants={region}
    >
      <motion.div
        className={cn("flex h-full flex-col", collapsed ? "items-center" : "px-1")}
        variants={tiles}
      >
        <motion.div
          className={cn("flex items-center gap-1.5 pt-0.5", collapsed && "flex-col")}
          variants={tile}
        >
          <div className="size-4 shrink-0 rounded-md bg-sidebar-primary" />
          {!collapsed && (
            <span className="text-[10px] leading-none font-semibold tracking-tight">Pulse</span>
          )}
        </motion.div>
        {!collapsed && <div className="mt-1.5 mb-1.5 h-px w-full bg-sidebar-border" />}
        <motion.div
          className={cn("flex flex-col", collapsed ? "mt-1 gap-2.5" : "mt-0.5 gap-0.5")}
          variants={tiles}
        >
          {navItems.map(({ icon: Icon, id, active }) => (
            <motion.div
              key={id}
              className={cn(
                "flex items-center rounded-md",
                collapsed ? "size-5 justify-center" : "gap-1.5 px-1.5 py-1",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground",
              )}
              variants={tile}
            >
              <Icon className={cn("shrink-0", collapsed ? "size-2.5" : "size-3")} strokeWidth={2} />
              {!collapsed && (
                <span className="text-[9px] leading-none font-medium">{text[id]}</span>
              )}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className={cn(
            "mt-auto flex items-center",
            collapsed ? "justify-center pb-0.5" : "gap-1.5 pb-1 pt-2",
          )}
          variants={tile}
        >
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[8px] font-semibold text-primary">
            AK
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-[9px] leading-tight font-medium">Ana Kova</span>
              <span className="truncate text-[8px] leading-tight text-muted-foreground">
                {text.role}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}

function Topbar({ mobile, text }: { mobile: boolean; text: DashboardShellLabels }) {
  return (
    <motion.div className="flex h-9 shrink-0 items-center gap-2 border-b px-2.5" variants={region}>
      {mobile ? (
        <>
          <span className="text-[11px] font-semibold tracking-tight text-foreground">
            {text.overview}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Bell className="size-3 text-muted-foreground" strokeWidth={2} />
            <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-semibold text-primary">
              AK
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-1 items-center gap-1.5 rounded-full bg-muted px-2 py-1">
            <Search className="size-2.5 text-muted-foreground" strokeWidth={2} />
            <span className="text-[9px] text-muted-foreground">{text.search}</span>
          </div>
          <Bell className="size-3 text-muted-foreground" strokeWidth={2} />
          <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-semibold text-primary">
            AK
          </div>
        </>
      )}
    </motion.div>
  );
}

function ChartCard({ className, text }: { className?: string; text: DashboardShellLabels }) {
  return (
    <motion.div
      className={cn("flex flex-col rounded-lg border bg-card p-2", className)}
      variants={region}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-foreground">{text.chartTitle}</span>
        <span className="text-[8px] text-muted-foreground">{text.chartRange}</span>
      </div>
      <div className="mt-1.5 min-h-0 flex-1">
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d={sparkPath}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
        </svg>
      </div>
    </motion.div>
  );
}

function TableCard({
  invoices,
  text,
}: {
  invoices: readonly DashboardShellInvoice[];
  text: DashboardShellLabels;
}) {
  return (
    <motion.div className="rounded-lg border bg-card p-2" variants={region}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-foreground">{text.invoicesTitle}</span>
        <span className="text-[8px] font-medium text-primary">{text.viewAll}</span>
      </div>
      <div className="mt-1 flex flex-col">
        {invoices.map((row, i) => {
          const known = Object.hasOwn(statusTones, row.status)
            ? (row.status as DashboardShellInvoiceStatus)
            : undefined;
          const tone = known ? statusTones[known] : neutralTone;
          return (
            <div
              key={i}
              className="flex items-center gap-2 border-t border-border/60 py-1.25 first:border-t-0"
            >
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[7px] font-semibold text-muted-foreground">
                {row.name.charAt(0)}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[9px] leading-tight font-medium text-foreground">
                  {row.name}
                </span>
                <span className="text-[7px] leading-tight text-muted-foreground">
                  {interpolate(text.plan, { plan: row.plan })}
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1 py-px text-[7px] font-semibold text-foreground",
                  tone.pill,
                )}
              >
                <span className={cn("size-1 rounded-full", tone.mark)} />
                {known ? text[known] : row.status}
              </span>
              <span className="w-10 text-right text-[9px] font-semibold text-foreground tabular-nums">
                {row.amount}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function KpiRow({ stacked, stats }: { stacked: boolean; stats: readonly DashboardShellStat[] }) {
  return (
    <motion.div className={cn("flex gap-1.5", stacked && "flex-col")} variants={tiles}>
      {stats.map((kpi, i) => (
        <motion.div
          key={i}
          className={cn(
            "flex rounded-lg border bg-card",
            stacked
              ? "items-center justify-between px-2 py-1.5"
              : "flex-1 flex-col items-start gap-1 p-1.5",
          )}
          variants={tile}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] leading-none text-muted-foreground">{kpi.label}</span>
            <span className="text-[11px] leading-tight font-semibold text-foreground tabular-nums">
              {kpi.value}
            </span>
          </div>
          <DeltaPill
            delta={kpi.change}
            up={
              kpi.trend === "up" || kpi.trend === "down"
                ? kpi.trend === "up"
                : !/^\s*[-−]/.test(kpi.change)
            }
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function TabBar() {
  return (
    <motion.div
      className="flex h-10 shrink-0 items-center justify-around border-t bg-card px-3"
      variants={region}
    >
      {tabItems.map(({ icon: Icon, active }, i) => (
        <div
          key={i}
          className={cn(
            "flex h-6 items-center justify-center rounded-full px-2.5",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" strokeWidth={2} />
        </div>
      ))}
    </motion.div>
  );
}

export function DashboardShell({
  collapsed = false,
  viewport = "desktop",
  stats = dashboardShellDefaultStats,
  invoices = dashboardShellDefaultInvoices,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: DashboardShellProps) {
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
  const mobile = viewport === "mobile";
  const text = { ...dashboardShellDefaultLabels, ...labels };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "w-full",
          !fill && "max-w-96",
          "overflow-hidden rounded-xl border bg-background shadow-xs",
        )}
        variants={animated ? shell : undefined}
        {...state}
      >
        <motion.div
          className={cn("flex", fill ? "h-full" : "h-80", mobile && "flex-col")}
          variants={animated ? regions : undefined}
          {...state}
        >
          {!mobile && <Rail collapsed={collapsed} text={text} />}
          <motion.div className="flex min-h-0 min-w-0 flex-1 flex-col" variants={subRegions}>
            <Topbar mobile={mobile} text={text} />
            <motion.div className="flex min-h-0 flex-1 flex-col gap-2 p-2" variants={subRegions}>
              <KpiRow stacked={mobile} stats={stats} />
              <ChartCard className="min-h-0 flex-1" text={text} />
              {!mobile && <TableCard invoices={invoices} text={text} />}
            </motion.div>
            {mobile && <TabBar />}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
