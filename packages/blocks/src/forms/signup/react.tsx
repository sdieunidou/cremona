import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SignupLabels {
  title: string;
  description: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  strength: string;
  /** Strength words for levels 1 to 4. */
  levels: [string, string, string, string];
  terms: string;
  submit: string;
}

export interface SignupProps extends VisualProps {
  /** Prefilled full name. */
  name?: string;
  /** Prefilled email address. */
  email?: string;
  /** Password strength, 1 (too weak) to 4 (strong): fills that many meter segments. */
  strength?: 1 | 2 | 3 | 4;
  /** Error shown under the email field, which is then marked invalid. */
  emailError?: string;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<SignupLabels>;
}

const defaultLabels: SignupLabels = {
  title: "Create your account",
  description: "Start your 14-day free trial.",
  name: "Name",
  namePlaceholder: "Ada Lovelace",
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "••••••••",
  strength: "Password strength",
  levels: ["Too weak", "Weak", "Medium", "Strong"],
  terms: "I agree to the Terms and Privacy Policy.",
  submit: "Create account",
};

const strengthTones: Record<number, { bar: string; text: string }> = {
  1: { bar: "bg-destructive", text: "text-destructive" },
  2: { bar: "bg-destructive", text: "text-destructive" },
  3: { bar: "bg-warning", text: "text-warning" },
  4: { bar: "bg-success", text: "text-success" },
};

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
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export function Signup({
  name = "",
  email = "",
  strength = 3,
  emailError,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SignupProps) {
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

  const level = Math.min(4, Math.max(1, Math.round(strength))) as 1 | 2 | 3 | 4;
  const tone = strengthTones[level]!;

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
        <motion.div className="flex flex-col gap-1" variants={animated ? field : undefined}>
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
            <label htmlFor={`${id}-name`} className="text-xs font-medium text-foreground">
              {t.name}
            </label>
            <input
              id={`${id}-name`}
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={name}
              placeholder={t.namePlaceholder}
              className={inputClass}
              {...noFocus}
            />
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor={`${id}-email`} className="text-xs font-medium text-foreground">
              {t.email}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={email}
              placeholder={t.emailPlaceholder}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? `${id}-email-error` : undefined}
              className={inputClass}
              {...noFocus}
            />
            {emailError && (
              <p id={`${id}-email-error`} className="text-[10px] font-medium text-destructive">
                {emailError}
              </p>
            )}
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor={`${id}-password`} className="text-xs font-medium text-foreground">
              {t.password}
            </label>
            <input
              id={`${id}-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder={t.passwordPlaceholder}
              aria-describedby={`${id}-strength`}
              className={inputClass}
              {...noFocus}
            />
            <div className="mt-0.5 flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-200",
                    i <= level ? tone.bar : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p id={`${id}-strength`} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">{t.strength}</span>
              <span className={cn("text-[10px] font-medium", tone.text)}>
                {t.levels[level - 1]}
              </span>
            </p>
          </motion.div>
        </motion.div>
        <motion.label className="flex items-center gap-1.5" variants={animated ? field : undefined}>
          <input type="checkbox" name="terms" required className="peer sr-only" {...noFocus} />
          <span
            aria-hidden="true"
            className="flex size-3 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-transparent shadow-xs transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
          >
            <Check className="size-2" strokeWidth={3} />
          </span>
          <span className="text-[10px] text-muted-foreground">{t.terms}</span>
        </motion.label>
        <motion.button
          type="submit"
          className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm outline-none transition-all duration-200 hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
          variants={animated ? field : undefined}
          {...noFocus}
        >
          {t.submit}
        </motion.button>
      </motion.form>
    </div>
  );
}
