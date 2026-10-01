"use client";

import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Rocket, Palette, BarChart3, Blocks, Check, ChevronDown } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface OnboardingInvite {
  email: string;
  role: string;
  /** Avatar initials; derived from the email when omitted. */
  initials?: string;
}

export interface OnboardingWizardLabels {
  /** `{step}` and `{total}` are replaced by the current step and the step count. */
  progress: string;
  workspace: string;
  workspacePlaceholder: string;
  icon: string;
  /** Accessible names of the four workspace icons. */
  icons: [string, string, string, string];
  invite: string;
  /** `{email}` is replaced by the invitee's address. */
  roleFor: string;
  inviteHint: string;
  back: string;
  next: string;
  finish: string;
}

export interface OnboardingWizardProps extends VisualProps {
  step?: 1 | 2 | 3;
  /** Workspace name, prefilled on step 1 and recapped on step 3. */
  workspace?: string;
  /** Teammates listed on step 2. */
  invites?: OnboardingInvite[];
  /** Role choices of the step-2 selects. */
  roles?: string[];
  /** Step-3 recap; derived from `workspace` and `invites` when omitted. */
  checklist?: string[];
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<OnboardingWizardLabels>;
}

const defaultLabels: OnboardingWizardLabels = {
  progress: "Step {step} of {total}",
  workspace: "Workspace name",
  workspacePlaceholder: "Acme Inc.",
  icon: "Workspace icon",
  icons: ["Rocket", "Palette", "Chart", "Blocks"],
  invite: "Invite your team",
  roleFor: "Role for {email}",
  inviteHint: "You can add more teammates later.",
  back: "Back",
  next: "Continue",
  finish: "Finish",
};

const defaultInvites: OnboardingInvite[] = [
  { initials: "AK", email: "ada@acme.dev", role: "Admin" },
  { initials: "GH", email: "grace@acme.dev", role: "Editor" },
];

const TOTAL = 3;

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
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const icons = [Rocket, Palette, BarChart3, Blocks];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function initialsOf(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function OnboardingWizard({
  step = 1,
  workspace = "Acme Inc.",
  invites = defaultInvites,
  roles = ["Admin", "Editor", "Viewer"],
  checklist,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: OnboardingWizardProps) {
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

  const recap = checklist ?? [
    `Workspace “${workspace}” created`,
    `${invites.length} ${invites.length === 1 ? "teammate" : "teammates"} invited`,
    "Notifications configured",
  ];
  const last = step === TOTAL;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.form
        noValidate
        onSubmit={prevent}
        className={cn(
          "flex w-full",
          !fill && "max-w-72",
          "flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex items-center justify-between"
          variants={animated ? item : undefined}
          {...state}
        >
          <span className="flex items-center gap-1" aria-hidden="true">
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
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {t.progress.replace("{step}", String(step)).replace("{total}", String(TOTAL))}
          </span>
        </motion.div>
        {/* keyed by step: a step change remounts the content and replays its entrance */}
        <motion.div
          key={step}
          className="flex flex-col gap-2.5"
          variants={animated ? content : undefined}
          {...state}
        >
          {step === 1 && (
            <>
              <motion.div className="flex flex-col gap-1.5" variants={animated ? item : undefined}>
                <label htmlFor={`${id}-workspace`} className="text-xs font-medium text-foreground">
                  {t.workspace}
                </label>
                <input
                  id={`${id}-workspace`}
                  name="workspace"
                  type="text"
                  autoComplete="organization"
                  required
                  defaultValue={workspace}
                  placeholder={t.workspacePlaceholder}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  {...noFocus}
                />
              </motion.div>
              <motion.fieldset variants={animated ? item : undefined}>
                <legend className="sr-only">{t.icon}</legend>
                <div className="grid grid-cols-4 gap-2">
                  {icons.map((Icon, i) => (
                    <label key={i} className="relative">
                      <input
                        type="radio"
                        name="icon"
                        value={i}
                        defaultChecked={i === 0}
                        aria-label={t.icons[i]}
                        className="peer sr-only"
                        {...noFocus}
                      />
                      <span className="flex h-12 items-center justify-center rounded-lg border p-2 text-muted-foreground transition-all duration-200 hover:border-ring/50 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                        <Icon className="size-4" strokeWidth={2.25} />
                      </span>
                    </label>
                  ))}
                </div>
              </motion.fieldset>
            </>
          )}
          {step === 2 && (
            <>
              <motion.p
                className="text-xs font-medium text-foreground"
                variants={animated ? item : undefined}
              >
                {t.invite}
              </motion.p>
              {invites.map((inv, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  variants={animated ? item : undefined}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {inv.initials ?? initialsOf(inv.email)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {inv.email}
                  </span>
                  <span className="relative shrink-0">
                    <select
                      name={`role-${i}`}
                      defaultValue={inv.role}
                      aria-label={t.roleFor.replace("{email}", inv.email)}
                      className={cn(
                        "flex h-6 appearance-none items-center rounded-md border bg-background pr-5 pl-1.5 text-[10px] font-medium text-foreground",
                        focusRing,
                      )}
                      {...noFocus}
                    >
                      {(roles.includes(inv.role) ? roles : [inv.role, ...roles]).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 right-1.5 size-2.5 -translate-y-1/2 text-muted-foreground"
                      strokeWidth={2.5}
                    />
                  </span>
                </motion.div>
              ))}
              <motion.p
                className="text-[10px] text-muted-foreground"
                variants={animated ? item : undefined}
              >
                {t.inviteHint}
              </motion.p>
            </>
          )}
          {step === 3 && (
            <ul className="flex flex-col gap-2.5">
              {recap.map((c, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground"
                  variants={animated ? item : undefined}
                >
                  <Check className="size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                  {c}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
        <motion.div
          className="flex items-center justify-between border-t pt-3"
          variants={animated ? item : undefined}
          {...state}
        >
          <button
            type="button"
            disabled={step === 1}
            className={cn(
              "flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground disabled:opacity-50",
              focusRing,
            )}
            {...noFocus}
          >
            {t.back}
          </button>
          <button
            type="submit"
            className={cn(
              "flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
              focusRing,
            )}
            {...noFocus}
          >
            {last ? t.finish : t.next}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}
