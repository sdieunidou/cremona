import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Rocket, Palette, BarChart3, Blocks, Check, ChevronDown } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface OnboardingWizardProps extends VisualProps {
  step?: 1 | 2 | 3;
  workspace?: string;
}

const invites = [
  { initials: "AK", email: "ada@acme.dev", role: "Admin" },
  { initials: "GH", email: "grace@acme.dev", role: "Editor" },
];

const checklist = [
  "Workspace “Acme Inc.” created",
  "2 teammates invited",
  "Notifications configured",
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const icons = [Rocket, Palette, BarChart3, Blocks];

export function OnboardingWizard({
  step = 1,
  workspace = "Acme Inc.",
  animated = false,
  trigger = "inView",
  className,
}: OnboardingWizardProps) {
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
        className="flex w-full max-w-72 flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex items-center justify-between"
          variants={animated ? item : undefined}
          {...state}
        >
          <span className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={cn(
                  "transition-all duration-200",
                  s === step ? "h-2 w-6 rounded-full bg-primary" : "size-2 rounded-full bg-muted",
                )}
              />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">Step {step} of 3</span>
        </motion.div>
        <motion.div
          className="flex flex-col gap-2.5"
          variants={animated ? content : undefined}
          {...state}
        >
          {step === 1 && (
            <>
              <motion.div
                className="flex flex-col gap-1.5"
                variants={animated ? item : undefined}
              >
                <label
                  htmlFor="cremona-onboarding-workspace"
                  className="text-xs font-medium text-foreground"
                >
                  Workspace name
                </label>
                <input
                  id="cremona-onboarding-workspace"
                  type="text"
                  value={workspace}
                  placeholder="Acme Inc."
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </motion.div>
              <motion.div
                className="grid grid-cols-4 gap-2"
                variants={animated ? item : undefined}
              >
                {icons.map((Icon, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-lg border p-2 transition-all duration-200",
                      i === 0
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
                        : "text-muted-foreground hover:border-ring/50",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2.25} />
                  </span>
                ))}
              </motion.div>
            </>
          )}
          {step === 2 && (
            <>
              <motion.p
                className="text-xs font-medium text-foreground"
                variants={animated ? item : undefined}
              >
                Invite your team
              </motion.p>
              {invites.map((inv) => (
                <motion.div
                  key={inv.email}
                  className="flex items-center gap-2"
                  variants={animated ? item : undefined}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {inv.initials}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {inv.email}
                  </span>
                  <span className="flex h-6 shrink-0 items-center gap-1 rounded-md border bg-background px-1.5 text-[10px] font-medium text-foreground">
                    {inv.role}
                    <ChevronDown className="size-2.5 text-muted-foreground" strokeWidth={2.5} />
                  </span>
                </motion.div>
              ))}
              <motion.p
                className="text-[10px] text-muted-foreground"
                variants={animated ? item : undefined}
              >
                You can add more teammates later.
              </motion.p>
            </>
          )}
          {step === 3 && (
            <>
              {checklist.map((c) => (
                <motion.div
                  key={c}
                  className="flex items-center gap-2 text-xs text-foreground"
                  variants={animated ? item : undefined}
                >
                  <Check className="size-3.5 shrink-0 text-emerald-500" strokeWidth={2.5} />
                  {c}
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
        <motion.div
          className="flex items-center justify-between border-t pt-3"
          variants={animated ? item : undefined}
          {...state}
        >
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            disabled={step === 1}
            className="flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}