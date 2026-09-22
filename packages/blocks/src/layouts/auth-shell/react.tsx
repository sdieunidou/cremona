import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { EyeOff, Globe, KeyRound } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface AuthShellProps extends VisualProps {
  /** "signin" shows email + password, "signup" adds a name field and strength bar. */
  mode?: "signin" | "signup";
}

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

function Field({
  label,
  value,
  trailing,
}: {
  label: string;
  value: string;
  trailing?: boolean;
}) {
  return (
    <motion.label className="flex flex-col gap-1" variants={region}>
      <span className="text-[8px] leading-none font-medium text-foreground">{label}</span>
      <span className="flex h-6 items-center gap-1 rounded-md border border-input bg-background px-2">
        <span className="flex-1 truncate text-[9px] text-muted-foreground">{value}</span>
        {trailing && <EyeOff className="size-2.5 shrink-0 text-muted-foreground" strokeWidth={2} />}
      </span>
    </motion.label>
  );
}

function StrengthBar() {
  return (
    <motion.div className="flex flex-col gap-1" variants={region}>
      <div className="flex gap-0.5">
        <div className="h-0.75 flex-1 rounded-full bg-primary" />
        <div className="h-0.75 flex-1 rounded-full bg-primary" />
        <div className="h-0.75 flex-1 rounded-full bg-muted" />
      </div>
      <span className="text-[7px] leading-none text-muted-foreground">Strength: good</span>
    </motion.div>
  );
}

export function AuthShell({
  mode = "signin",
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: AuthShellProps) {
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
  const signup = mode === "signup";

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
        className={cn("flex h-72 w-full", !fill && "max-w-80", "overflow-hidden rounded-xl border bg-background shadow-xs")}
        variants={animated ? shell : undefined}
        {...state}
      >
        <motion.div
          className="flex w-[42%] shrink-0 flex-col gap-2 bg-linear-to-b from-primary/10 via-primary/5 to-transparent p-2.5"
          variants={regions}
          {...state}
        >
          <motion.div className="flex items-center gap-1.5" variants={region}>
            <div className="size-4 rounded-md bg-primary" />
            <span className="text-[10px] leading-none font-semibold tracking-tight text-foreground">
              Acme
            </span>
          </motion.div>
          <motion.div
            className="mt-auto flex flex-col gap-1.5 rounded-lg border bg-card p-2 shadow-xs"
            variants={region}
          >
            <p className="text-[8px] leading-snug font-medium text-foreground">
              “Acme cut our design-to-ship time in half.”
            </p>
            <div className="flex items-center gap-1.5">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[7px] font-semibold text-primary">
                MO
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] leading-none font-medium text-foreground">
                  Maya Ortiz
                </span>
                <span className="text-[7px] leading-none text-muted-foreground">
                  Head of Design, Nova
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="flex min-w-0 flex-1 flex-col gap-1.5 border-l p-2.5"
          variants={regions}
          {...state}
        >
          <motion.div className="flex flex-col gap-1" variants={region}>
            <span className="text-[11px] leading-tight font-semibold tracking-tight text-foreground">
              {signup ? "Create account" : "Sign in"}
            </span>
            <span className="text-[8px] leading-tight text-muted-foreground">
              {signup
                ? "Start your 14-day free trial."
                : "Welcome back — pick up where you left off."}
            </span>
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={subRegions}>
            {signup && <Field label="Name" value="Maya Ortiz" />}
            <Field label="Email" value="maya@acme.com" />
            <Field label="Password" value="••••••••" trailing />
            {signup && <StrengthBar />}
          </motion.div>
          <motion.div className="flex items-center justify-between" variants={region}>
            <div className="flex items-center gap-1.5">
              <span className="flex h-3.5 w-6 items-center rounded-full bg-primary px-0.5">
                <span className="ml-auto size-2.5 rounded-full bg-primary-foreground" />
              </span>
              <span className="text-[8px] font-medium text-foreground">Remember me</span>
            </div>
            <span className="text-[8px] font-medium text-primary">Forgot?</span>
          </motion.div>
          <motion.span
            className="flex h-6 items-center justify-center rounded-md bg-primary text-[9px] font-medium text-primary-foreground"
            variants={region}
          >
            {signup ? "Create account" : "Sign in"}
          </motion.span>
          <motion.div className="flex items-center gap-1.5" variants={region}>
            <div className="h-px flex-1 bg-border" />
            <span className="text-[8px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>
          <motion.div className="mt-auto flex items-center gap-1.5" variants={region}>
            <span className="flex h-6 flex-1 items-center justify-center gap-1 rounded-md border border-input bg-background text-[8px] font-medium text-foreground">
              <Globe className="size-2.5 text-muted-foreground" strokeWidth={2} />
              Google
            </span>
            <span className="flex h-6 flex-1 items-center justify-center gap-1 rounded-md border border-input bg-background text-[8px] font-medium text-foreground">
              <KeyRound className="size-2.5 text-muted-foreground" strokeWidth={2} />
              SSO
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
