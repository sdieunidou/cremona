"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BatteryFull,
  Heart,
  House,
  Search,
  Signal,
  User,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface MobileAppShellLabels {
  greeting: string;
  /** Caption of the balance card. */
  balance: string;
  /** Caption of the weekly activity card. */
  thisWeek: string;
  /** Tab bar items; the active one shows its label. */
  home: string;
  explore: string;
  saved: string;
  profile: string;
}

export const mobileAppShellDefaultLabels: MobileAppShellLabels = {
  greeting: "Good morning",
  balance: "Balance",
  thisWeek: "This week",
  home: "Home",
  explore: "Explore",
  saved: "Saved",
  profile: "Profile",
};

export interface MobileAppShellBalance {
  /** Pre-formatted balance. */
  value: string;
  /** Pre-formatted change. */
  change: string;
  /** Direction of `change` (default: "down" when `change` starts with a minus sign). */
  trend?: "up" | "down";
}

export interface MobileAppShellTransaction {
  name: string;
  initials: string;
  /** Line under the name. */
  detail: string;
  /** Pre-formatted amount. */
  amount: string;
}

export const mobileAppShellDefaultBalance: MobileAppShellBalance = {
  value: "$8,420.50",
  change: "4.2%",
  trend: "up",
};

export const mobileAppShellDefaultTransaction: MobileAppShellTransaction = {
  name: "Jonas Weiss",
  initials: "JW",
  detail: "Transfer · today, 9:12",
  amount: "$36.00",
};

export interface MobileAppShellProps extends VisualProps {
  /** Render the phone in the dark palette, whatever the page mode. */
  dark?: boolean;
  /** Balance card. */
  balance?: MobileAppShellBalance;
  /** Latest transaction row. */
  transaction?: MobileAppShellTransaction;
  /** Pre-formatted total of the weekly activity card. */
  weekTotal?: string;
  /** UI text; every key is optional and falls back to the English default. */
  labels?: Partial<MobileAppShellLabels>;
}

const tabs: { icon: LucideIcon; id: keyof MobileAppShellLabels; active?: boolean }[] = [
  { icon: House, id: "home", active: true },
  { icon: Search, id: "explore" },
  { icon: Heart, id: "saved" },
  { icon: User, id: "profile" },
];

const activityBars = [35, 60, 45, 80, 55, 70, 40] as const;

const shell = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const regions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
} as const;

const region = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
} as const;

const card = "rounded-lg border border-border/75 bg-card p-1.5 shadow-xs";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-2 pt-1.5 text-foreground">
      <span className="text-[8px] leading-none font-semibold">9:41</span>
      <div className="flex items-center gap-0.75">
        <Signal className="size-2.5" strokeWidth={2} />
        <Wifi className="size-2.5" strokeWidth={2} />
        <BatteryFull className="size-2.5" strokeWidth={2} />
      </div>
    </div>
  );
}

function AppBar({ text }: { text: MobileAppShellLabels }) {
  return (
    <motion.div className="flex items-center justify-between px-2 pt-2" variants={region}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[7px] leading-none text-muted-foreground">{text.greeting}</span>
        <span className="text-[10px] leading-tight font-semibold tracking-tight text-foreground">
          Maya Ortiz
        </span>
      </div>
      <div className="flex size-4 items-center justify-center rounded-md bg-primary/15">
        <span className="text-[6px] font-semibold text-primary">MO</span>
      </div>
    </motion.div>
  );
}

function BalanceCard({
  balance,
  text,
}: {
  balance: MobileAppShellBalance;
  text: MobileAppShellLabels;
}) {
  const down =
    balance.trend === "up" || balance.trend === "down"
      ? balance.trend === "down"
      : /^\s*[-−]/.test(balance.change);
  const Arrow = down ? ArrowDownRight : ArrowUpRight;
  return (
    <motion.div className={cn("flex items-center justify-between", card)} variants={region}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[7px] leading-none text-muted-foreground">{text.balance}</span>
        <span className="text-[10px] leading-tight font-semibold text-foreground tabular-nums">
          {balance.value}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full",
          down ? "bg-destructive/10" : "bg-success/10",
          "px-1 py-px text-[7px] font-semibold text-foreground tabular-nums",
        )}
      >
        <Arrow
          className={cn("size-1.5", down ? "text-destructive" : "text-success")}
          strokeWidth={2.5}
        />
        {balance.change}
      </span>
    </motion.div>
  );
}

function TransferCard({ transaction }: { transaction: MobileAppShellTransaction }) {
  return (
    <motion.div className={cn("flex items-center gap-1.5", card)} variants={region}>
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[6px] font-semibold text-muted-foreground">
        {transaction.initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[8px] leading-none font-medium text-foreground">
          {transaction.name}
        </span>
        <span className="text-[7px] leading-none text-muted-foreground">{transaction.detail}</span>
      </div>
      <span className="inline-flex items-center gap-0.5 text-[8px] leading-none font-semibold text-foreground tabular-nums">
        <ArrowDownRight className="size-1.5" strokeWidth={2.5} />
        {transaction.amount}
      </span>
    </motion.div>
  );
}

function ActivityCard({ total, text }: { total: string; text: MobileAppShellLabels }) {
  return (
    <motion.div className={cn("flex flex-col gap-1", card)} variants={region}>
      <div className="flex items-center justify-between">
        <span className="text-[7px] leading-none text-muted-foreground">{text.thisWeek}</span>
        <span className="text-[7px] leading-none font-medium text-primary">{total}</span>
      </div>
      <div className="flex h-7 items-end justify-between gap-0.5">
        {activityBars.map((h, i) => (
          <div
            key={i}
            className={cn("w-1 rounded-sm", i === 3 ? "bg-primary" : "bg-primary/50")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TabBar({ text }: { text: MobileAppShellLabels }) {
  return (
    <motion.div
      className="mx-1.5 mt-auto mb-1.5 flex items-center justify-between rounded-full border border-border/75 bg-card px-1.5 py-1 shadow-sm"
      variants={region}
    >
      {tabs.map(({ icon: Icon, id, active }) => (
        <span
          key={id}
          className={cn(
            "flex h-4.5 items-center justify-center gap-1 rounded-full px-1.5",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-2.5" strokeWidth={2} />
          {active && <span className="text-[7px] leading-none font-medium">{text[id]}</span>}
        </span>
      ))}
    </motion.div>
  );
}

export function MobileAppShell({
  dark = false,
  balance = mobileAppShellDefaultBalance,
  transaction = mobileAppShellDefaultTransaction,
  weekTotal = "32 runs",
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: MobileAppShellProps) {
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
  const text = { ...mobileAppShellDefaultLabels, ...labels };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), fill && "@container-size min-h-48", className)}
    >
      {/* a 9:19 phone: with `fill` it keeps its cap and shrinks to the box height; the 12rem box and
          6rem phone minimums keep it visible in a box without a height of its own */}
      <motion.div
        className={cn(
          "rounded-3xl border-8 shadow-xs",
          fill
            ? "w-[min(11rem,max(6rem,calc((100cqh-1rem)*9/19+1rem)))] max-w-full self-center"
            : "w-full max-w-44",
          dark ? "dark border-muted bg-background" : "border-foreground/10 bg-background",
        )}
        variants={animated ? shell : undefined}
        {...state}
      >
        <div className="aspect-9/19 w-full overflow-hidden bg-background">
          <motion.div
            className="flex h-full flex-col text-foreground"
            variants={animated ? regions : undefined}
            {...state}
          >
            <StatusBar />
            <motion.div
              className="flex min-h-0 flex-1 flex-col gap-1.5 px-2 pt-1"
              variants={content}
            >
              <AppBar text={text} />
              <BalanceCard balance={balance} text={text} />
              <TransferCard transaction={transaction} />
              <ActivityCard total={weekTotal} text={text} />
            </motion.div>
            <TabBar text={text} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
