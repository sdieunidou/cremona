"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "./utils.js";
import { useFieldControl } from "./field.js";

interface ComboboxOption {
  /** What the form submits when this option is chosen. */
  value: string;
  /** What the input shows and what typing is matched against. */
  label: string;
  /** Listed, but cannot be chosen. */
  disabled?: boolean;
  /** More words that find the option, such as an abbreviation or a former name. */
  keywords?: string[];
}

/** Lower case, without accents: "Élodie" is found by "elo". */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * The default filter: every word typed appears in the label or the keywords of the option, whatever
 * its case and accents.
 */
function filterOption(option: ComboboxOption, query: string) {
  const haystack = normalize([option.label, ...(option.keywords ?? [])].join(" "));
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

type ComboboxProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "children"
> & {
  /** Every option, in the order of the list. */
  options: ComboboxOption[];
  /** The value of the chosen option, `""` for none. Controlled: pair it with `onValueChange`. */
  value?: string;
  /** The value chosen at first, uncontrolled. Default `""`. */
  defaultValue?: string;
  /** Called with the value of the option the user chooses, or `""` when they clear the input. */
  onValueChange?: (value: string) => void;
  /** The name the value is submitted under, in a hidden input next to the text input. */
  name?: string;
  /** Shown in the list when nothing matches what was typed, and read out. Default "No results". */
  emptyText?: React.ReactNode;
  /** Whether an option matches what was typed. Default: every word in its label or keywords. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Height of the input: `default` 36 px, `sm` 32 px. */
  size?: "sm" | "default";
  /**
   * The element the list is rendered in. Default `document.body`. With `cremona.scoped.css`, which
   * styles only what is inside a `.cremona` element, pass an element inside it.
   */
  container?: HTMLElement | null;
  /** Classes of the list. */
  contentClassName?: string;
};

/**
 * A text input that filters a list of options as the user types: the WAI-ARIA combobox with a listbox.
 * The arrow keys move through the matches, Home and End jump to the first and the last while the list is
 * open, Enter chooses, Escape closes and puts back the chosen label. Leaving the input chooses an option
 * whose label was typed in full, clears the value when the input was emptied, and otherwise puts back the
 * chosen label. Inside a form it submits its `name` and the chosen value, like a native select. Inside a
 * `Field` it is labelled, described and marked invalid by the field.
 */
function Combobox({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  name,
  emptyText = "No results",
  filter = filterOption,
  size = "default",
  container,
  className,
  contentClassName,
  form,
  onKeyDown,
  onBlur,
  onClick,
  ...props
}: ComboboxProps) {
  const control = useFieldControl(props);
  const id = React.useId();
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const anchor = React.useRef<HTMLDivElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  /** The listbox is named like the input: by its `aria-labelledby`, its `aria-label` or its labels. */
  const [listName, setListName] = React.useState<string | undefined>();

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const [open, setOpen] = React.useState(false);
  /** What the user typed since the list opened; `null` while they have not typed: every option shows. */
  const [query, setQuery] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<number | null>(null);

  const selected = options.find((option) => option.value === value);
  const matches = React.useMemo(
    () =>
      options
        .map((option, index) => ({ option, index }))
        .filter(({ option }) => query === null || filter(option, query)),
    [options, query, filter],
  );
  const enabled = matches.filter(({ option }) => !option.disabled);
  const activeMatch = matches.find(({ index }) => index === active);

  React.useEffect(() => {
    if (open && active !== null)
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const choose = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next);
    if (next !== value) onValueChange?.(next);
  };
  const dismiss = () => {
    setOpen(false);
    setQuery(null);
    setActive(null);
  };
  const select = (option: ComboboxOption) => {
    if (option.disabled) return;
    choose(option.value);
    dismiss();
  };
  /** Leaving the input: a label typed in full chooses its option, an empty input clears the value. */
  const commit = () => {
    if (query !== null) {
      const typed = normalize(query.trim());
      if (!typed) choose("");
      else {
        const exact = options.find((o) => !o.disabled && normalize(o.label) === typed);
        if (exact) choose(exact.value);
      }
    }
    dismiss();
  };
  const openList = () => {
    const labels = [...(input.current?.labels ?? [])].map((label) => label.textContent?.trim());
    setListName(props["aria-label"] ?? (labels.filter(Boolean).join(" ") || undefined));
    setOpen(true);
  };
  const show = (at: "selected" | "first" | "last") => {
    if (control.disabled || props.readOnly) return;
    openList();
    const chosen = enabled.find(({ option }) => option.value === value);
    const target =
      at === "last" ? enabled.at(-1) : at === "first" ? enabled[0] : (chosen ?? enabled[0]);
    setActive(target?.index ?? null);
  };
  const move = (step: 1 | -1) => {
    const position = enabled.findIndex(({ index }) => index === active);
    const next =
      position === -1
        ? step === 1
          ? enabled[0]
          : enabled.at(-1)
        : enabled[Math.min(Math.max(position + step, 0), enabled.length - 1)];
    setActive(next?.index ?? null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) show("selected");
        else if (!event.altKey) move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) show(selected ? "selected" : "last");
        else if (event.altKey) dismiss();
        else move(-1);
        break;
      case "Home":
      case "End":
        if (!open || event.shiftKey) return;
        event.preventDefault();
        setActive((event.key === "Home" ? enabled[0] : enabled.at(-1))?.index ?? null);
        break;
      case "Enter":
        if (!open) return;
        event.preventDefault();
        if (activeMatch) select(activeMatch.option);
        else dismiss();
        break;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setQuery(text);
    openList();
    const first = text.trim()
      ? options.findIndex((option) => !option.disabled && filter(option, text))
      : -1;
    setActive(first === -1 ? null : first);
  };

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) commit();
      }}
    >
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={anchor}
          data-slot="combobox"
          data-size={size}
          className={cn("group/combobox relative w-full", className)}
        >
          <input
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={open && activeMatch ? optionId(activeMatch.index) : undefined}
            data-slot="combobox-input"
            form={form}
            {...props}
            {...control}
            ref={input}
            value={query ?? selected?.label ?? ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={(event) => {
              onClick?.(event);
              if (!open && !event.defaultPrevented) show("selected");
            }}
            onBlur={(event) => {
              onBlur?.(event);
              commit();
            }}
            className={cn(
              "w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-8 pl-2.5 text-base shadow-xs transition-[color,box-shadow] md:text-sm dark:bg-input/30",
              "group-data-[size=default]/combobox:h-9 group-data-[size=sm]/combobox:h-8",
              "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            )}
          />
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          {name !== undefined && <input type="hidden" name={name} value={value} form={form} />}
          <span role="status" className="sr-only">
            {open && matches.length === 0 ? emptyText : null}
          </span>
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal container={container}>
        <PopoverPrimitive.Content
          role="listbox"
          id={listboxId}
          aria-labelledby={props["aria-labelledby"]}
          aria-label={props["aria-labelledby"] ? undefined : listName}
          data-slot="combobox-content"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (anchor.current?.contains(event.target as Node)) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            dismiss();
          }}
          className={cn(
            "z-50 max-h-[min(--spacing(72),var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] origin-(--radix-popover-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95",
            "motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=top]:slide-in-from-bottom-2",
            contentClassName,
          )}
        >
          {matches.map(({ option, index }) => (
            // keyboard selection goes through the combobox input (aria-activedescendant)
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              key={index}
              id={optionId(index)}
              role="option"
              tabIndex={-1}
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              data-slot="combobox-item"
              data-highlighted={index === active ? "" : undefined}
              data-disabled={option.disabled ? "" : undefined}
              onPointerDown={(event) => event.preventDefault()}
              onPointerMove={() => {
                if (!option.disabled && index !== active) setActive(index);
              }}
              onClick={() => select(option)}
              className={cn(
                "relative flex min-h-8 w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
                "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              )}
            >
              {option.label}
              {option.value === value && (
                <CheckIcon
                  aria-hidden="true"
                  className="absolute right-2 size-4 text-muted-foreground"
                />
              )}
            </div>
          ))}
          {matches.length === 0 && (
            <div
              aria-hidden="true"
              data-slot="combobox-empty"
              className="py-6 text-center text-sm text-muted-foreground"
            >
              {emptyText}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { Combobox, filterOption, type ComboboxOption, type ComboboxProps };
