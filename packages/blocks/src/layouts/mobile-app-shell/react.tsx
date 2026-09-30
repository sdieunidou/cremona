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

export interface MobileAppShellProps extends VisualProps {
  /** Render the phone in the dark palette, whatever the page mode. */
  dark?: boolean;
}

const tabs: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: House, label: "Home", active: true },
  { icon: Search, label: "Explore" },
  { icon: Heart, label: "Saved" },
  { icon: User, label: "Profile" },
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

function AppBar() {
  return (
    <motion.div className="flex items-center justify-between px-2 pt-2" variants={region}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[7px] leading-none text-muted-foreground">Good morning</span>
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

function BalanceCard() {
  return (
    <motion.div className={cn("flex items-center justify-between", card)} variants={region}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[7px] leading-none text-muted-foreground">Balance</span>
        <span className="text-[10px] leading-tight font-semibold text-foreground tabular-nums">
          $8,420.50
        </span>
      </div>
      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1 py-px text-[7px] font-semibold text-foreground tabular-nums">
        <ArrowUpRight className="size-1.5 text-success" strokeWidth={2.5} />
        4.2%
      </span>
    </motion.div>
  );
}

function TransferCard() {
  return (
    <motion.div className={cn("flex items-center gap-1.5", card)} variants={region}>
      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[6px] font-semibold text-muted-foreground">
        JW
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[8px] leading-none font-medium text-foreground">Jonas Weiss</span>
        <span className="text-[7px] leading-none text-muted-foreground">
          Transfer · today, 9:12
        </span>
      </div>
      <span className="inline-flex items-center gap-0.5 text-[8px] leading-none font-semibold text-foreground tabular-nums">
        <ArrowDownRight className="size-1.5" strokeWidth={2.5} />
        $36.00
      </span>
    </motion.div>
  );
}

function ActivityCard() {
  return (
    <motion.div className={cn("flex flex-col gap-1", card)} variants={region}>
      <div className="flex items-center justify-between">
        <span className="text-[7px] leading-none text-muted-foreground">This week</span>
        <span className="text-[7px] leading-none font-medium text-primary">32 runs</span>
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

function TabBar() {
  return (
    <motion.div
      className="mx-1.5 mt-auto mb-1.5 flex items-center justify-between rounded-full border border-border/75 bg-card px-1.5 py-1 shadow-sm"
      variants={region}
    >
      {tabs.map(({ icon: Icon, label, active }) => (
        <span
          key={label}
          className={cn(
            "flex h-4.5 items-center justify-center gap-1 rounded-full px-1.5",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-2.5" strokeWidth={2} />
          {active && <span className="text-[7px] leading-none font-medium">{label}</span>}
        </span>
      ))}
    </motion.div>
  );
}

export function MobileAppShell({
  dark = false,
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

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(frameClasses(fill), fill && "@container-size", className)}
    >
      {/* a 9:19 phone: with `fill` it keeps its cap and shrinks to the box height */}
      <motion.div
        className={cn(
          "rounded-3xl border-8 shadow-xs",
          fill
            ? "w-[min(11rem,calc((100cqh-1rem)*9/19+1rem))] max-w-full self-center"
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
              <AppBar />
              <BalanceCard />
              <TransferCard />
              <ActivityCard />
            </motion.div>
            <TabBar />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
