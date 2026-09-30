import { useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Search, Eye, EyeOff } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface InputProps extends VisualProps {
  type?: "text" | "email" | "password" | "search";
  label?: string;
  placeholder?: string;
  hint?: string;
  invalid?: boolean;
  errorText?: string;
  disabled?: boolean;
  defaultValue?: string;
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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
  fill = false,
  className,
}: InputProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [show, setShow] = useState(false);
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
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
  const inputId = `${id}-input`;
  const messageId = `${id}-message`;
  const message = invalid && errorText ? errorText : hint;

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("flex w-full", !fill && "max-w-64", "flex-col gap-1.5", fill && "self-start")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {label && (
          <label className="text-xs font-medium text-foreground" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm",
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
            invalid
              ? "border-destructive ring-3 ring-destructive/20 dark:ring-destructive/40"
              : "border-input",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {type === "search" && <Search className="size-4 shrink-0 text-muted-foreground" />}
          <input
            id={inputId}
            type={effectiveType}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={message ? messageId : undefined}
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
              aria-label="Show password"
              aria-pressed={show}
              disabled={disabled}
              onClick={() => setShow((v) => !v)}
              className={cn(
                "-mr-1 flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground",
                focusRing,
              )}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
        {message && (
          <p
            id={messageId}
            className={cn(
              "text-xs",
              invalid && errorText ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
