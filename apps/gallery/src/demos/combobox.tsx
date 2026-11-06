import * as React from "react";
import { Button } from "@cremona/ui/button";
import { Combobox, type ComboboxOption } from "@cremona/ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@cremona/ui/field";

const consultants: ComboboxOption[] = [
  { value: "amartin", label: "Alice Martin" },
  { value: "blefevre", label: "Bruno Lefèvre" },
  { value: "cdubois", label: "Céline Dubois", disabled: true },
  { value: "ebernard", label: "Élodie Bernard" },
  { value: "mdurand", label: "Marc Durand" },
  { value: "nroux", label: "Nicolas Roux" },
];

export default function InAField() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Consultant</FieldLabel>
      <Combobox options={consultants} placeholder="Type a name" />
      <FieldDescription>Case and accents do not matter: “elo” finds Élodie.</FieldDescription>
    </Field>
  );
}

/** The value is submitted under `name`, like a native select. */
export function InAForm() {
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <form
      className="flex w-full max-w-xs flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const entries = [...new FormData(event.currentTarget).entries()];
        setSent(entries.map(([key, value]) => `${key}=${String(value)}`).join("&"));
      }}
    >
      <Field>
        <FieldLabel>Client</FieldLabel>
        <Combobox
          name="client"
          defaultValue="acme"
          options={[
            { value: "acme", label: "Acme Corporation", keywords: ["ACME"] },
            { value: "globex", label: "Globex" },
            { value: "initech", label: "Initech" },
            { value: "umbrella", label: "Umbrella Health" },
          ]}
        />
      </Field>
      <Button type="submit" className="w-fit">
        Filter
      </Button>
      <output className="text-sm text-muted-foreground">{sent ?? "Not sent yet"}</output>
    </form>
  );
}

/** A long list scrolls inside the room that is left on screen. */
export function LongList() {
  const projects = React.useMemo(
    () =>
      Array.from({ length: 400 }, (_, i) => ({
        value: String(i + 1),
        label: `Project ${String(i + 1).padStart(3, "0")}`,
      })),
    [],
  );
  return (
    <Combobox
      aria-label="Project"
      placeholder="Project"
      options={projects}
      emptyText="No project"
      className="w-56"
    />
  );
}

export function Invalid() {
  return (
    <Field invalid className="w-full max-w-xs">
      <FieldLabel>Manager</FieldLabel>
      <Combobox options={consultants} />
      <FieldError>Choose a manager to continue</FieldError>
    </Field>
  );
}

export function SmallAndDisabled() {
  return (
    <Combobox
      size="sm"
      disabled
      aria-label="Locked"
      defaultValue="amartin"
      options={consultants}
      className="w-48"
    />
  );
}
