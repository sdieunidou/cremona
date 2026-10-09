"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils.js";
import { Label } from "./label.js";

type FieldPart = "description" | "error";

interface FieldContextValue {
  controlId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  disabled: boolean;
  hasDescription: boolean;
  hasError: boolean;
  setPart: (part: FieldPart, present: boolean) => void;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useField() {
  return React.useContext(FieldContext);
}

/** Tells the field that a description or an error is on screen, for as long as the caller is. */
function usePresent(part: FieldPart, present = true) {
  const setPart = useField()?.setPart;
  React.useEffect(() => {
    if (!present || !setPart) return;
    setPart(part, true);
    return () => setPart(part, false);
  }, [part, present, setPart]);
}

interface ControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  disabled?: boolean;
}

/**
 * What a control inside a `Field` takes from it: the `id` its label points at, the `aria-describedby`
 * of the description and the error that are on screen, `aria-invalid` and `disabled`. A prop the control
 * received itself wins. Outside a `Field`, the four come back as the control passed them. Spread the
 * result after the control's own props.
 */
function useFieldControl(own: ControlProps): ControlProps {
  const field = useField();
  if (!field)
    return {
      id: own.id,
      "aria-describedby": own["aria-describedby"],
      "aria-invalid": own["aria-invalid"],
      disabled: own.disabled,
    };
  const describedBy =
    [
      own["aria-describedby"],
      field.hasDescription ? field.descriptionId : undefined,
      field.hasError ? field.errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return {
    id: own.id ?? field.controlId,
    "aria-describedby": describedBy,
    "aria-invalid": own["aria-invalid"] ?? (field.invalid || undefined),
    disabled: own.disabled ?? (field.disabled || undefined),
  };
}

const fieldVariants = cva("group/field flex w-full gap-3 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start",
      /** vertical in a narrow field group, horizontal once the group is wide enough */
      responsive:
        "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start",
    },
  },
  defaultVariants: { orientation: "vertical" },
});

type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /** The control is in error: the text turns destructive and the control gets `aria-invalid`. */
    invalid?: boolean;
    /** Disable the control and dim the label. */
    disabled?: boolean;
  };

/**
 * A label, a control, a description and an error, wired for assistive technology: the label points
 * at the control, the control is described by the description and the error that are shown, and
 * `invalid` / `disabled` reach it. `Input`, `Checkbox` and `Switch` read all of it from here.
 */
function Field({
  className,
  orientation = "vertical",
  invalid = false,
  disabled = false,
  children,
  ...props
}: FieldProps) {
  const id = React.useId();
  const [parts, setParts] = React.useState({ description: false, error: false });
  const setPart = React.useCallback(
    (part: FieldPart, present: boolean) =>
      setParts((current) =>
        current[part] === present ? current : { ...current, [part]: present },
      ),
    [],
  );
  const value = React.useMemo<FieldContextValue>(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      disabled,
      hasDescription: parts.description,
      hasError: parts.error,
      setPart,
    }),
    [id, invalid, disabled, parts, setPart],
  );
  return (
    <FieldContext.Provider value={value}>
      <div
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

/** Stacks fields. It is also the container the `responsive` orientation of its fields measures. */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("@container/field-group flex w-full flex-col gap-7", className)}
      {...props}
    />
  );
}

/** A `<fieldset>` for related fields; its `FieldLegend` names the group. */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset data-slot="field-set" className={cn("flex flex-col gap-6", className)} {...props} />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

/** Groups the label and the description of a horizontal field next to its control. */
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)}
      {...props}
    />
  );
}

/** The label of the control of the enclosing `Field`. */
function FieldLabel({ className, htmlFor, ...props }: React.ComponentProps<typeof Label>) {
  const field = useField();
  return (
    <Label
      data-slot="field-label"
      htmlFor={htmlFor ?? field?.controlId}
      className={cn("w-fit leading-snug group-data-[disabled=true]/field:opacity-50", className)}
      {...props}
    />
  );
}

/** Help text for the control. The control is described by it while it is on screen. */
function FieldDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const field = useField();
  usePresent("description");
  return (
    <p
      id={id ?? field?.descriptionId}
      data-slot="field-description"
      className={cn("text-sm leading-normal font-normal text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * The error of the control: pass its text as `children`, or the `errors` of a form library (their
 * messages, once each). It renders nothing without text, and is announced when it appears.
 */
function FieldError({
  className,
  children,
  errors,
  id,
  ...props
}: React.ComponentProps<"div"> & { errors?: Array<{ message?: string } | undefined> }) {
  const field = useField();
  const messages = [...new Set((errors ?? []).map((e) => e?.message).filter(Boolean))] as string[];
  const content =
    children ??
    (messages.length > 1 ? (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ) : (
      messages[0]
    ));
  usePresent("error", !!content);
  if (!content) return null;
  return (
    <div
      role="alert"
      id={id ?? field?.errorId}
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  useFieldControl,
  type FieldProps,
};
