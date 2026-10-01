"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, ChevronDown } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SelectOption {
  value: string;
  label?: string;
}

export interface SelectProps extends VisualProps {
  value?: string;
  /** Show the option list. */
  open?: boolean;
  invalid?: boolean;
  /** Choices, as values or `{ value, label }` (default: three regions). */
  options?: (string | SelectOption)[];
  /** Visible label above the trigger. */
  label?: string;
  placeholder?: string;
  errorText?: string;
  disabled?: boolean;
  /** Full width, at the top of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const demoOptions = ["eu-west-1", "us-east-1", "ap-southeast-1"];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const menuIn = {
  hidden: { opacity: 0, y: -4, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
} as const;

export function Select({
  value = "eu-west-1",
  open = false,
  invalid = false,
  options = demoOptions,
  label,
  placeholder = "Select region",
  errorText = "Please choose a region.",
  disabled = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: SelectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const choices = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  const [selected, setSelected] = useState(value);
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      choices.findIndex((choice) => choice.value === value),
    ),
  );
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

  const current = choices.find((choice) => choice.value === selected);
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const optionId = (i: number) => `${id}-option-${i}`;
  const showError = invalid && !!errorText;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open || choices.length === 0) return;
    const last = choices.length - 1;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected(choices[active]!.value);
      return;
    }
    const next =
      event.key === "ArrowDown"
        ? Math.min(active + 1, last)
        : event.key === "ArrowUp"
          ? Math.max(active - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
  };

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("flex w-full", !fill && "max-w-64", "flex-col gap-1.5", fill && "self-start")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {label && (
          <span id={labelId} className="text-xs font-medium text-foreground">
            {label}
          </span>
        )}
        <div className="group/select relative w-full">
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : placeholder}
            aria-invalid={invalid || undefined}
            aria-describedby={showError ? errorId : undefined}
            aria-activedescendant={open ? optionId(active) : undefined}
            disabled={disabled}
            onKeyDown={onKeyDown}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              focusRing,
              invalid
                ? "border-destructive ring-3 ring-destructive/20 dark:ring-destructive/40"
                : "border-input hover:bg-muted/40",
            )}
          >
            <span className={cn("truncate", current ? "text-foreground" : "text-muted-foreground")}>
              {current ? (current.label ?? current.value) : placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
          {open && (
            <motion.div
              id={listId}
              role="listbox"
              aria-label={label ?? placeholder}
              className="absolute top-full z-10 mt-1.5 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
              variants={animated ? menuIn : undefined}
              {...state}
            >
              {choices.map((choice, i) => {
                const isSelected = choice.value === selected;
                return (
                  <div
                    key={choice.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseMove={() => setActive(i)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setSelected(choice.value);
                    }}
                    className={cn(
                      "flex h-8 w-full cursor-default items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors select-none hover:bg-muted",
                      i === active &&
                        "bg-muted text-foreground group-has-[button:focus-visible]/select:outline-2 group-has-[button:focus-visible]/select:-outline-offset-2 group-has-[button:focus-visible]/select:outline-ring",
                      isSelected && "font-medium text-foreground",
                    )}
                  >
                    {choice.label ?? choice.value}
                    {isSelected && <Check className="size-3.5" />}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
        {showError && (
          <p id={errorId} className="text-xs text-destructive">
            {errorText}
          </p>
        )}
      </motion.div>
    </div>
  );
}
