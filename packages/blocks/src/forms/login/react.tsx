"use client";

import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { Sparkles, Apple, Check, Eye, OctagonX, LoaderCircle } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface LoginLabels {
  title: string;
  description: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: string;
  remember: string;
  forgot: string;
  submit: string;
  submitting: string;
  error: string;
  divider: string;
}

export interface LoginProps extends VisualProps {
  /** Prefilled email address. */
  email?: string;
  /** Initial state of the "remember me" checkbox. */
  remember?: boolean;
  /** Show the credentials error and mark both fields invalid. */
  error?: boolean;
  /** Submission in progress: the submit button is disabled and shows a spinner. */
  loading?: boolean;
  /** Social sign-in buttons, in order; `[]` hides them and the divider. */
  providers?: ("google" | "apple")[];
  /** Target of the "forgot password" link. */
  forgotHref?: string;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<LoginLabels>;
}

const defaultLabels: LoginLabels = {
  title: "Welcome back",
  description: "Sign in to continue to Acme Inc.",
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "••••••••",
  showPassword: "Show password",
  remember: "Remember me",
  forgot: "Forgot password?",
  submit: "Sign in",
  submitting: "Signing in…",
  error: "Invalid email or password.",
  divider: "or",
};

const providerNames = { google: "Google", apple: "Apple" } as const;

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
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const field = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Login({
  email = "",
  remember = false,
  error = false,
  loading = false,
  providers = ["google", "apple"],
  forgotHref = "#",
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: LoginProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  // the spinner is the loading state itself, not decoration: it turns while visible
  const spin = useLoopActive(ref, true);
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
  const invalid = error || undefined;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.form
        noValidate
        onSubmit={prevent}
        aria-labelledby={`${id}-title`}
        className={cn(
          "flex w-full",
          !fill && "max-w-72",
          "flex-col gap-2.5 rounded-xl border bg-card p-4 text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </span>
          <h2 id={`${id}-title`} className="text-lg font-semibold text-foreground">
            {t.title}
          </h2>
          <p className="text-xs text-muted-foreground">{t.description}</p>
        </motion.div>
        <motion.div
          className="flex flex-col gap-3"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor={`${id}-email`} className="text-xs font-medium text-foreground">
              {t.email}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="username"
              required
              defaultValue={email}
              placeholder={t.emailPlaceholder}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...noFocus}
            />
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor={`${id}-password`} className="text-xs font-medium text-foreground">
              {t.password}
            </label>
            <div className="relative">
              <input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t.passwordPlaceholder}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={cn(inputClass, "pr-9")}
                {...noFocus}
              />
              <button
                type="button"
                aria-label={t.showPassword}
                aria-pressed={false}
                aria-controls={`${id}-password`}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                {...noFocus}
              >
                <Eye className="size-3.5" strokeWidth={2.25} />
              </button>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="flex items-center justify-between gap-2"
          variants={animated ? field : undefined}
        >
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              name="remember"
              defaultChecked={remember}
              className="peer sr-only"
              {...noFocus}
            />
            <span
              aria-hidden="true"
              className="flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-transparent shadow-xs transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
            >
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            <span className="text-xs text-muted-foreground">{t.remember}</span>
          </label>
          <a
            href={forgotHref}
            className={cn(
              "rounded-sm text-xs font-medium text-primary underline-offset-2 transition-colors duration-200 hover:underline",
              focusRing,
            )}
            {...noFocus}
            onClick={prevent}
          >
            {t.forgot}
          </a>
        </motion.div>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-foreground"
            variants={animated ? field : undefined}
            {...state}
          >
            <OctagonX className="size-3.5 shrink-0 text-destructive" strokeWidth={2.25} />
            <span>{t.error}</span>
          </motion.p>
        )}
        <motion.button
          type="submit"
          disabled={loading}
          className={cn(
            "flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
            focusRing,
            loading && "opacity-70",
          )}
          variants={animated ? field : undefined}
          {...noFocus}
        >
          {loading && (
            <LoaderCircle className={cn("size-3.5", spin && "animate-spin")} strokeWidth={2.5} />
          )}
          {loading ? t.submitting : t.submit}
        </motion.button>
        {providers.length > 0 && (
          <>
            <motion.div className="flex items-center gap-3" variants={animated ? field : undefined}>
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground">{t.divider}</span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
            <motion.div className="flex gap-2" variants={animated ? field : undefined}>
              {providers.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className={cn(
                    "flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border bg-background text-xs font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-accent",
                    focusRing,
                  )}
                  {...noFocus}
                >
                  {provider === "apple" ? (
                    <Apple className="size-3.5 text-muted-foreground" strokeWidth={2.25} />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">G</span>
                  )}
                  {providerNames[provider]}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </motion.form>
    </div>
  );
}
