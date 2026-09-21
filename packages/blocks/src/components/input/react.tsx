import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Search, Eye, EyeOff } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface InputProps extends VisualProps {
  type?: "text" | "email" | "password" | "search";
  label?: string;
  placeholder?: string;
  hint?: string;
  invalid?: boolean;
  errorText?: string;
  disabled?: boolean;
  defaultValue?: string;
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

export function Input({
  type = "text",
  label = "Project name",
  placeholder = "Acme Inc.",
  hint,
  invalid = false,
  errorText = "This name is already taken.",
  disabled = false,
  defaultValue = "",
  animated = false,
  trigger = "inView",
  className,
}: InputProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [show, setShow] = useState(false);
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

  const isPassword = type === "password";
  const effectiveType = isPassword && show ? "text" : type;

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
        className="flex w-full max-w-64 flex-col gap-1.5"
        variants={animated ? entrance : undefined}
        {...state}
      >
        {label && (
          <label className="text-xs font-medium text-foreground" htmlFor="cremona-input-demo">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            invalid && "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {type === "search" && (
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <input
            id="cremona-input-demo"
            type={effectiveType}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              "w-full min-w-0 flex-1 bg-transparent text-foreground outline-none",
              "placeholder:text-muted-foreground",
              disabled && "cursor-not-allowed",
            )}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((v) => !v)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
          )}
        </div>
        {invalid && errorText ? (
          <p className="text-xs text-destructive">{errorText}</p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </motion.div>
    </div>
  );
}
