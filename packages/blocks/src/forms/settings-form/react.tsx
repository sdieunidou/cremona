import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronDown, Check } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SettingsFormLabels {
  title: string;
  description: string;
  workspace: string;
  workspaceHint: string;
  timezone: string;
  timezoneHint: string;
  notifications: string;
  notificationsHint: string;
  unsaved: string;
  cancel: string;
  save: string;
  saved: string;
}

export interface SettingsFormProps extends VisualProps {
  /** Show the unsaved-changes bar with Cancel and Save. */
  dirty?: boolean;
  /** Show the "all changes saved" confirmation. */
  saved?: boolean;
  /** Workspace name field value. */
  workspace?: string;
  /** Selected time zone (an option `value`). */
  timezone?: string;
  /** Time zone choices. */
  timezones?: { value: string; label: string }[];
  /** Email notifications switch state. */
  notifications?: boolean;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<SettingsFormLabels>;
}

const defaultLabels: SettingsFormLabels = {
  title: "Workspace settings",
  description: "Manage how your team collaborates.",
  workspace: "Workspace name",
  workspaceHint: "Visible to all members",
  timezone: "Timezone",
  timezoneHint: "Used for schedules",
  notifications: "Email notifications",
  notificationsHint: "Product updates and digests",
  unsaved: "Unsaved changes",
  cancel: "Cancel",
  save: "Save",
  saved: "All changes saved",
};

const defaultTimezones = [
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris" },
  { value: "America/New_York", label: "(GMT-05:00) New York" },
];

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const row = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const controlClass =
  "h-8 w-full min-w-0 rounded-md border border-input px-2.5 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
/* stacked below 20rem of card width, label | control side by side above */
const rowClass =
  "flex flex-col gap-2 px-3 py-2.5 @xs:flex-row @xs:items-center @xs:justify-between @xs:gap-3";

export function SettingsForm({
  dirty = false,
  saved = false,
  workspace = "Acme Inc.",
  timezone = "Europe/Paris",
  timezones = defaultTimezones,
  notifications = true,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SettingsFormProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const id = useId();
  const t = { ...defaultLabels, ...labels };
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
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.form
        noValidate
        onSubmit={prevent}
        aria-labelledby={`${id}-title`}
        className={cn(
          "@container w-full",
          !fill && "max-w-96",
          "rounded-xl border bg-card p-4 text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex flex-col gap-0.5"
          variants={animated ? row : undefined}
          {...state}
        >
          <h2 id={`${id}-title`} className="text-sm font-semibold text-foreground">
            {t.title}
          </h2>
          <p className="text-xs text-muted-foreground">{t.description}</p>
        </motion.div>
        <motion.div
          className="mt-3 divide-y rounded-lg border"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div className={rowClass} variants={animated ? row : undefined}>
            <span className="flex min-w-0 flex-col gap-0.5">
              <label htmlFor={`${id}-workspace`} className="text-xs font-medium text-foreground">
                {t.workspace}
              </label>
              <span id={`${id}-workspace-hint`} className="text-[10px] text-muted-foreground">
                {t.workspaceHint}
              </span>
            </span>
            <input
              id={`${id}-workspace`}
              name="workspace"
              type="text"
              autoComplete="organization"
              defaultValue={workspace}
              aria-describedby={`${id}-workspace-hint`}
              className={cn(controlClass, "shrink-0 bg-transparent @xs:w-40")}
              {...noFocus}
            />
          </motion.div>
          <motion.div className={rowClass} variants={animated ? row : undefined}>
            <span className="flex min-w-0 flex-col gap-0.5">
              <label htmlFor={`${id}-timezone`} className="text-xs font-medium text-foreground">
                {t.timezone}
              </label>
              <span id={`${id}-timezone-hint`} className="text-[10px] text-muted-foreground">
                {t.timezoneHint}
              </span>
            </span>
            <span className="relative shrink-0 @xs:w-40">
              <select
                id={`${id}-timezone`}
                name="timezone"
                defaultValue={timezone}
                aria-describedby={`${id}-timezone-hint`}
                className={cn(controlClass, "appearance-none truncate bg-background pr-7")}
                {...noFocus}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.5}
              />
            </span>
          </motion.div>
          <motion.div
            className="flex items-center justify-between gap-3 px-3 py-2.5"
            variants={animated ? row : undefined}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <label
                htmlFor={`${id}-notifications`}
                className="text-xs font-medium text-foreground"
              >
                {t.notifications}
              </label>
              <span id={`${id}-notifications-hint`} className="text-[10px] text-muted-foreground">
                {t.notificationsHint}
              </span>
            </span>
            <button
              id={`${id}-notifications`}
              type="button"
              role="switch"
              aria-checked={notifications}
              aria-describedby={`${id}-notifications-hint`}
              className={cn(
                "flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
                notifications ? "bg-primary" : "bg-input",
                focusRing,
              )}
              {...noFocus}
            >
              <span
                className={cn(
                  "size-3.5 rounded-full bg-background shadow-sm transition-transform duration-200",
                  notifications && "translate-x-3.5",
                )}
              />
            </button>
          </motion.div>
        </motion.div>
        {dirty && (
          <motion.div
            className="mt-3 flex items-center justify-between gap-2 rounded-lg border bg-muted/50 p-2"
            variants={animated ? row : undefined}
            {...state}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-warning" />
              <span className="truncate text-xs text-muted-foreground" role="status">
                {t.unsaved}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <button
                type="reset"
                className={cn(
                  "flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground",
                  focusRing,
                )}
                {...noFocus}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className={cn(
                  "flex h-7 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
                  focusRing,
                )}
                {...noFocus}
              >
                {t.save}
              </button>
            </span>
          </motion.div>
        )}
        {saved && (
          <motion.p
            role="status"
            className="mt-3 flex items-center justify-end gap-1.5 text-xs text-success"
            variants={animated ? row : undefined}
            {...state}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
            {t.saved}
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
