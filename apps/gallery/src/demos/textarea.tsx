import { Field, FieldDescription, FieldError, FieldLabel } from "@cremona/ui/field";
import { Textarea } from "@cremona/ui/textarea";

/** It grows with what is typed, where the browser supports `field-sizing`. */
export default function InAField() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Message</FieldLabel>
      <Textarea placeholder="How can we help?" />
      <FieldDescription>Plain text, up to 500 characters.</FieldDescription>
    </Field>
  );
}

export function Invalid() {
  return (
    <Field invalid className="w-full max-w-sm">
      <FieldLabel>Bio</FieldLabel>
      <Textarea defaultValue="Hi" />
      <FieldError>Write at least ten characters</FieldError>
    </Field>
  );
}

export function Disabled() {
  return (
    <Textarea aria-label="Notes" disabled defaultValue="Read only for now." className="max-w-sm" />
  );
}
