import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ChevronDown, Check } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SettingsFormProps extends VisualProps {
  dirty?: boolean;
  saved?: boolean;
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

export function SettingsForm({
  dirty = false,
  saved = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SettingsFormProps) {
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
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={cn("w-full", !fill && "max-w-80", "rounded-xl border bg-card p-4 text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex flex-col gap-0.5"
          variants={animated ? row : undefined}
          {...state}
        >
          <p className="text-sm font-semibold text-foreground">Workspace settings</p>
          <p className="text-xs text-muted-foreground">Manage how your team collaborates.</p>
        </motion.div>
        <motion.div
          className="mt-3 divide-y rounded-lg border"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div
            className="flex items-center justify-between gap-3 px-3 py-2.5"
            variants={animated ? row : undefined}
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">Workspace name</span>
              <span className="text-[10px] text-muted-foreground">Visible to all members</span>
            </span>
            <input
              type="text"
              value="Acme Inc."
              className="h-8 w-40 rounded-md border border-input bg-transparent px-2.5 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </motion.div>
          <motion.div
            className="flex items-center justify-between gap-3 px-3 py-2.5"
            variants={animated ? row : undefined}
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">Timezone</span>
              <span className="text-[10px] text-muted-foreground">Used for schedules</span>
            </span>
            <span className="flex h-8 w-40 items-center justify-between gap-1.5 rounded-md border bg-background px-2.5 text-xs text-foreground shadow-xs">
              <span className="truncate">(GMT+01:00) Paris</span>
              <ChevronDown className="size-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
            </span>
          </motion.div>
          <motion.div
            className="flex items-center justify-between gap-3 px-3 py-2.5"
            variants={animated ? row : undefined}
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground">Email notifications</span>
              <span className="text-[10px] text-muted-foreground">Product updates and digests</span>
            </span>
            <span
              role="switch"
              aria-checked="true"
              className="flex h-4.5 w-8 items-center justify-end rounded-full bg-primary p-0.5"
            >
              <span className="size-3.5 rounded-full bg-primary-foreground shadow-sm" />
            </span>
          </motion.div>
        </motion.div>
        {dirty && (
          <motion.div
            className="mt-3 flex items-center justify-between rounded-lg border bg-muted/50 p-2"
            variants={animated ? row : undefined}
            {...state}
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">Unsaved changes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className="flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className="flex h-7 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              >
                Save
              </button>
            </span>
          </motion.div>
        )}
        {saved && (
          <motion.div
            className="mt-3 flex items-center justify-end gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
            variants={animated ? row : undefined}
            {...state}
          >
            <Check className="size-3.5" strokeWidth={2.5} />
            All changes saved
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}