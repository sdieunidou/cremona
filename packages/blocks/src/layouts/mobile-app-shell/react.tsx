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
import { cn, type VisualProps } from "@cremona/core";

export interface MobileAppShellProps extends VisualProps {
  /** Render an explicit dark, zinc-based mock regardless of the ambient theme. */
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

function StatusBar({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center justify-between px-2 pt-1.5">
      <span
        className={cn(
          "text-[8px] leading-none font-semibold",
          dark ? "text-zinc-50" : "text-foreground",
        )}
      >
        9:41
      </span>
      <div
        className={cn(
          "flex items-center gap-0.75",
          dark ? "text-zinc-300" : "text-foreground",
        )}
      >
        <Signal className="size-2.5" strokeWidth={2} />
        <Wifi className="size-2.5" strokeWidth={2} />
        <BatteryFull className="size-2.5" strokeWidth={2} />
      </div>
    </div>
  );
}

function AppBar({ dark }: { dark: boolean }) {
  return (
    <motion.div
      className="flex items-center justify-between px-2 pt-2"
      variants={region}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-[7px] leading-none",
            dark ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          Good morning
        </span>
        <span
          className={cn(
            "text-[10px] leading-tight font-semibold tracking-tight",
            dark ? "text-zinc-50" : "text-foreground",
          )}
        >
          Maya Ortiz
        </span>
      </div>
      <div
        className={cn(
          "flex size-4 items-center justify-center rounded-md",
          dark ? "bg-zinc-800" : "bg-primary/15",
        )}
      >
        <span
          className={cn(
            "text-[6px] font-semibold",
            dark ? "text-zinc-300" : "text-primary",
          )}
        >
          MO
        </span>
      </div>
    </motion.div>
  );
}

function BalanceCard({ dark }: { dark: boolean }) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-between rounded-lg border p-1.5",
        dark ? "border-white/10 bg-white/5" : "border-border/75 bg-card shadow-xs",
      )}
      variants={region}
    >
      <div className="flex flex-col gap-0.5">
        <span
          className={cn("text-[7px] leading-none", dark ? "text-zinc-400" : "text-muted-foreground")}
        >
          Balance
        </span>
        <span
          className={cn(
            "text-[10px] leading-tight font-semibold tabular-nums",
            dark ? "text-zinc-50" : "text-foreground",
          )}
        >
          $8,420.50
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1 py-px text-[7px] font-semibold tabular-nums",
          dark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-500/10 text-emerald-600",
        )}
      >
        <ArrowUpRight className="size-1.5" strokeWidth={2.5} />
        4.2%
      </span>
    </motion.div>
  );
}

function TransferCard({ dark }: { dark: boolean }) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border p-1.5",
        dark ? "border-white/10 bg-white/5" : "border-border/75 bg-card shadow-xs",
      )}
      variants={region}
    >
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full text-[6px] font-semibold",
          dark ? "bg-zinc-800 text-zinc-300" : "bg-muted text-muted-foreground",
        )}
      >
        JW
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-[8px] leading-none font-medium",
            dark ? "text-zinc-100" : "text-foreground",
          )}
        >
          Jonas Weiss
        </span>
        <span
          className={cn("text-[7px] leading-none", dark ? "text-zinc-500" : "text-muted-foreground")}
        >
          Transfer · today, 9:12
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[8px] leading-none font-semibold tabular-nums",
          dark ? "text-zinc-50" : "text-foreground",
        )}
      >
        <ArrowDownRight className="size-1.5" strokeWidth={2.5} />
        $36.00
      </span>
    </motion.div>
  );
}

function ActivityCard({ dark }: { dark: boolean }) {
  return (
    <motion.div
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-1.5",
        dark ? "border-white/10 bg-white/5" : "border-border/75 bg-card shadow-xs",
      )}
      variants={region}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-[7px] leading-none",
            dark ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          This week
        </span>
        <span
          className={cn(
            "text-[7px] leading-none font-medium",
            dark ? "text-zinc-300" : "text-primary",
          )}
        >
          32 runs
        </span>
      </div>
      <div className="flex h-7 items-end justify-between gap-0.5">
        {activityBars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-sm",
              dark ? "bg-zinc-600" : "bg-primary/50",
              i === 3 && (dark ? "bg-zinc-300" : "bg-primary"),
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TabBar({ dark }: { dark: boolean }) {
  return (
    <motion.div
      className={cn(
        "mx-1.5 mb-1.5 mt-auto flex items-center justify-between rounded-full border px-1.5 py-1",
        dark ? "border-white/10 bg-zinc-800" : "border-border/75 bg-card shadow-sm",
      )}
      variants={region}
    >
      {tabs.map(({ icon: Icon, label, active }) => (
        <span
          key={label}
          className={cn(
            "flex h-4.5 items-center justify-center gap-1 rounded-full px-1.5",
            active
              ? dark
                ? "bg-zinc-100 text-zinc-900"
                : "bg-primary/10 text-primary"
              : dark
                ? "text-zinc-500"
                : "text-muted-foreground",
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
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={cn(
          "w-full max-w-44 rounded-3xl border-8 shadow-xs",
          dark ? "border-zinc-800 bg-zinc-950" : "border-foreground/10 bg-background",
        )}
        variants={animated ? shell : undefined}
        {...state}
      >
        <div className={cn("aspect-9/19 w-full overflow-hidden", dark ? "bg-zinc-900" : "bg-background")}>
          <motion.div
            className={cn("flex h-full flex-col", dark ? "text-zinc-50" : "text-foreground")}
            variants={animated ? regions : undefined}
            {...state}
          >
            <StatusBar dark={dark} />
            <motion.div
              className="flex min-h-0 flex-1 flex-col gap-1.5 px-2 pt-1"
              variants={content}
            >
              <AppBar dark={dark} />
              <BalanceCard dark={dark} />
              <TransferCard dark={dark} />
              <ActivityCard dark={dark} />
            </motion.div>
            <TabBar dark={dark} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
