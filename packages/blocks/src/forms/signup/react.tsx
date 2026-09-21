import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export interface SignupProps extends VisualProps {
  name?: string;
  email?: string;
  strength?: 1 | 2 | 3 | 4;
}

const strengthMeta: Record<number, { filled: number; bar: string; word: string; text: string }> = {
  1: { filled: 1, bar: "bg-rose-500", word: "Too weak", text: "text-rose-600 dark:text-rose-400" },
  2: { filled: 2, bar: "bg-rose-500", word: "Weak", text: "text-rose-600 dark:text-rose-400" },
  3: { filled: 3, bar: "bg-amber-500", word: "Medium", text: "text-amber-600 dark:text-amber-400" },
  4: {
    filled: 3,
    bar: "bg-emerald-500",
    word: "Strong",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

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
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50";

export function Signup({
  name = "",
  email = "",
  strength = 3,
  animated = false,
  trigger = "inView",
  className,
}: SignupProps) {
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

  const meta = strengthMeta[strength] ?? strengthMeta[3]!;

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
        className="flex w-full max-w-72 flex-col gap-2.5 rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex flex-col gap-1"
          variants={animated ? field : undefined}
        >
          <p className="text-lg font-semibold text-foreground">Create your account</p>
          <p className="text-xs text-muted-foreground">Start your 14-day free trial.</p>
        </motion.div>
        <motion.div
          className="flex flex-col gap-3"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor="cremona-signup-name" className="text-xs font-medium text-foreground">
              Name
            </label>
            <input
              id="cremona-signup-name"
              type="text"
              value={name}
              placeholder="Ada Lovelace"
              className={inputClass}
            />
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor="cremona-signup-email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="cremona-signup-email"
              type="email"
              value={email}
              placeholder="you@example.com"
              className={inputClass}
            />
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label
              htmlFor="cremona-signup-password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="cremona-signup-password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
            />
            <div className="mt-0.5 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-200",
                    i < meta.filled ? meta.bar : "bg-muted",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Password strength</span>
              <span className={cn("text-[10px] font-medium", meta.text)}>{meta.word}</span>
            </div>
          </motion.div>
        </motion.div>
        <motion.span
          className="flex items-center gap-1.5"
          variants={animated ? field : undefined}
        >
          <span className="size-3 rounded-[4px] border border-input bg-background shadow-xs" />
          <span className="text-[10px] text-muted-foreground">
            I agree to the Terms and Privacy Policy.
          </span>
        </motion.span>
        <motion.button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          variants={animated ? field : undefined}
        >
          Create account
        </motion.button>
      </motion.div>
    </div>
  );
}