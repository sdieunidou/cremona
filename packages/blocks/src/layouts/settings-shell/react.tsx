import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Bell, ChevronDown, CreditCard, Settings, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface SettingsShellProps extends VisualProps {
  /** Append a destructive "Delete account" card above the save bar. */
  danger?: boolean;
}

const sections: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: Settings, label: "General", active: true },
  { icon: ShieldCheck, label: "Security" },
  { icon: CreditCard, label: "Billing" },
  { icon: Bell, label: "Notifications" },
];

type FormRow =
  | { label: string; hint: string; control: "input"; value: string }
  | { label: string; hint: string; control: "select"; value: string }
  | { label: string; hint: string; control: "switch"; on: boolean };

const rows: FormRow[] = [
  { label: "Workspace name", hint: "Shown across your workspace.", control: "input", value: "Acme Inc." },
  { label: "Time zone", hint: "Used for digests and reports.", control: "select", value: "(GMT+01:00) Berlin" },
  { label: "Email digests", hint: "A weekly summary every Monday.", control: "switch", on: true },
  { label: "Public profile", hint: "Let anyone see your workspace.", control: "switch", on: false },
];
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

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex h-3.5 w-6 shrink-0 items-center rounded-full px-0.5",
        on ? "bg-primary" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "size-2.5 rounded-full bg-primary-foreground shadow-xs",
          on ? "ml-auto" : "mr-auto",
        )}
      />
    </span>
  );
}

function Control({ row }: { row: (typeof rows)[number] }) {
  if (row.control === "switch") return <Switch on={row.on} />;
  if (row.control === "select")
    return (
      <span className="flex h-5 shrink-0 items-center gap-1 rounded-md border border-input bg-background px-1.5">
        <span className="text-[8px] leading-none text-foreground">{row.value}</span>
        <ChevronDown className="size-2 shrink-0 text-muted-foreground" strokeWidth={2} />
      </span>
    );
  return (
    <span className="flex h-5 w-20 shrink-0 items-center rounded-md border border-input bg-background px-1.5">
      <span className="truncate text-[8px] leading-none text-foreground">{row.value}</span>
    </span>
  );
}

function SettingsNav() {
  return (
    <motion.aside
      className="flex w-[5.5rem] shrink-0 flex-col gap-0.5 border-r p-2"
      aria-label="Settings sections"
      variants={region}
    >
      <span className="px-1 pb-1 text-[10px] leading-none font-semibold tracking-tight text-foreground">
        Settings
      </span>
      {sections.map(({ icon: Icon, label, active }) => (
        <span
          key={label}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-1.5 py-1",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="size-3 shrink-0" strokeWidth={2} />
          <span className="text-[9px] leading-none font-medium">{label}</span>
        </span>
      ))}
    </motion.aside>
  );
}

function FormRows() {
  return (
    <motion.div className="flex flex-col rounded-lg border bg-card" variants={subRegions}>
      {rows.map((row) => (
        <motion.div
          key={row.label}
          className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-1.75 first:border-t-0"
          variants={region}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[9px] leading-none font-medium text-foreground">
              {row.label}
            </span>
            <span className="truncate text-[7px] leading-tight text-muted-foreground">
              {row.hint}
            </span>
          </div>
          <Control row={row} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function DangerCard() {
  return (
    <motion.div
      className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2"
      variants={region}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[9px] leading-none font-semibold text-destructive">
          Delete account
        </span>
        <span className="text-[7px] leading-tight text-muted-foreground">
          Permanently removes your workspace and data.
        </span>
      </div>
      <span className="shrink-0 rounded-md bg-destructive px-1.5 py-1 text-[8px] leading-none font-medium text-white">
        Delete
      </span>
    </motion.div>
  );
}

export function SettingsShell({
  danger = false,
  animated = false,
  trigger = "inView",
  className,
}: SettingsShellProps) {
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
        className="flex h-72 w-full max-w-90 overflow-hidden rounded-xl border bg-background shadow-xs"
        variants={animated ? shell : undefined}
        {...state}
      >
        <SettingsNav />
        <motion.div
          className="flex min-w-0 flex-1 flex-col p-2.5"
          variants={regions}
          {...state}
        >
          <motion.div className="flex flex-col gap-1" variants={region}>
            <span className="text-[11px] leading-tight font-semibold tracking-tight text-foreground">
              General
            </span>
            <span className="text-[8px] leading-tight text-muted-foreground">
              How your workspace looks and behaves.
            </span>
          </motion.div>
          <motion.div className="mt-2 flex flex-col gap-2" variants={subRegions}>
            <FormRows />
            {danger && <DangerCard />}
          </motion.div>
          <motion.div
            className="mt-auto flex items-center justify-end gap-1.5 border-t pt-2"
            variants={region}
          >
            <span className="rounded-md px-2 py-1 text-[9px] font-medium text-muted-foreground">
              Cancel
            </span>
            <span className="rounded-md bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground">
              Save changes
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
