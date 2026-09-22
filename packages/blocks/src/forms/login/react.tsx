import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Sparkles, Apple, OctagonX, LoaderCircle } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface LoginProps extends VisualProps {
  email?: string;
  error?: boolean;
  loading?: boolean;
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
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50";

export function Login({
  email = "",
  error = false,
  loading = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: LoginProps) {
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

  const ring = error
    ? "border-destructive ring-3 ring-destructive/20"
    : "border-input focus:border-ring focus:ring-3 focus:ring-ring/50";

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
        className={cn("flex w-full", !fill && "max-w-72", "flex-col gap-2.5 rounded-xl border bg-card p-4 text-card-foreground shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <motion.div
          className="flex flex-col gap-1.5"
          variants={animated ? field : undefined}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </span>
          <p className="text-lg font-semibold text-foreground">Welcome back</p>
          <p className="text-xs text-muted-foreground">Sign in to continue to Acme Inc.</p>
        </motion.div>
        <motion.div
          className="flex flex-col gap-3"
          variants={animated ? content : undefined}
          {...state}
        >
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label htmlFor="cremona-login-email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="cremona-login-email"
              type="email"
              value={email}
              placeholder="you@example.com"
              className={cn(inputClass, ring)}
            />
          </motion.div>
          <motion.div className="flex flex-col gap-1.5" variants={animated ? field : undefined}>
            <label
              htmlFor="cremona-login-password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="cremona-login-password"
              type="password"
              placeholder="••••••••"
              className={cn(inputClass, ring)}
            />
          </motion.div>
        </motion.div>
        <motion.div
          className="flex items-center justify-between"
          variants={animated ? field : undefined}
        >
          <span className="flex items-center gap-1.5">
            <span className="size-3.5 rounded-[4px] border border-input bg-background shadow-xs" />
            <span className="text-xs text-muted-foreground">Remember me</span>
          </span>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className="text-xs font-medium text-primary underline-offset-2 transition-colors duration-200 hover:underline"
          >
            Forgot password?
          </button>
        </motion.div>
        {error && (
          <motion.div
            className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive"
            variants={animated ? field : undefined}
            {...state}
          >
            <OctagonX className="size-3.5 shrink-0" strokeWidth={2.25} />
            <span>Invalid email or password.</span>
          </motion.div>
        )}
        <motion.button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          disabled={loading}
          className={cn(
            "flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
            loading && "opacity-70",
          )}
          variants={animated ? field : undefined}
        >
          {loading && <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2.5} />}
          {loading ? "Signing in…" : "Sign in"}
        </motion.button>
        <motion.div
          className="flex items-center gap-3"
          variants={animated ? field : undefined}
        >
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </motion.div>
        <motion.div className="flex gap-2" variants={animated ? field : undefined}>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border bg-background text-xs font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-accent"
          >
            <span className="text-xs font-bold text-muted-foreground">G</span>
            Google
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border bg-background text-xs font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-accent"
          >
            <Apple className="size-3.5 text-muted-foreground" strokeWidth={2.25} />
            Apple
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}