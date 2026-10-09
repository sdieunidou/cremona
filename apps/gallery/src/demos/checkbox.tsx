import { useState } from "react";
import { Checkbox } from "@cremona/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@cremona/ui/field";

export default function WithALabel() {
  return (
    <Field orientation="horizontal" className="w-full max-w-sm">
      <Checkbox defaultChecked />
      <FieldContent>
        <FieldLabel>Remember me</FieldLabel>
        <FieldDescription>Stay signed in on this device.</FieldDescription>
      </FieldContent>
    </Field>
  );
}

/** A parent checkbox that is indeterminate while only some of its children are checked. */
export function Indeterminate() {
  const [checked, setChecked] = useState([true, false]);
  const all = checked.every(Boolean) ? true : checked.some(Boolean) ? "indeterminate" : false;
  return (
    <div className="grid gap-3">
      <Field orientation="horizontal">
        <Checkbox
          checked={all}
          onCheckedChange={(value) => setChecked([value === true, value === true])}
        />
        <FieldLabel>Select all</FieldLabel>
      </Field>
      {["Ada", "Grace"].map((name, i) => (
        <Field key={name} orientation="horizontal" className="ml-6">
          <Checkbox
            checked={checked[i]}
            onCheckedChange={(value) =>
              setChecked((current) => current.map((c, j) => (j === i ? value === true : c)))
            }
          />
          <FieldLabel>{name}</FieldLabel>
        </Field>
      ))}
    </div>
  );
}

export function Invalid() {
  return (
    <Field invalid orientation="horizontal" className="w-full max-w-sm">
      <Checkbox />
      <FieldContent>
        <FieldLabel>I accept the terms</FieldLabel>
        <FieldError>Accept the terms to continue</FieldError>
      </FieldContent>
    </Field>
  );
}

export function Disabled() {
  return (
    <Field disabled orientation="horizontal">
      <Checkbox defaultChecked />
      <FieldLabel>Included in your plan</FieldLabel>
    </Field>
  );
}
