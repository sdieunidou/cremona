import { Button } from "@cremona/ui/button";
import { Checkbox } from "@cremona/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";
import { Switch } from "@cremona/ui/switch";

/** The label, the description and the error are wired to the control. */
export default function Vertical() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" autoComplete="email" placeholder="ada@example.com" />
      <FieldDescription>We never share it.</FieldDescription>
    </Field>
  );
}

export function WithAnError() {
  return (
    <Field invalid className="w-full max-w-sm">
      <FieldLabel>Password</FieldLabel>
      <Input type="password" autoComplete="new-password" defaultValue="short" />
      <FieldDescription>At least 12 characters.</FieldDescription>
      <FieldError>The password is too short</FieldError>
    </Field>
  );
}

export function Horizontal() {
  return (
    <Field orientation="horizontal" className="w-full max-w-sm">
      <FieldContent>
        <FieldLabel>Marketing emails</FieldLabel>
        <FieldDescription>News and offers, once a month.</FieldDescription>
      </FieldContent>
      <Switch />
    </Field>
  );
}

/** Vertical in a narrow group, horizontal once the group is wide: resize the window to see it. */
export function Responsive() {
  return (
    <FieldGroup className="w-full max-w-2xl">
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel>Display name</FieldLabel>
          <FieldDescription>Shown next to your comments.</FieldDescription>
        </FieldContent>
        <Input className="md:w-64" />
      </Field>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel>Job title</FieldLabel>
          <FieldDescription>Optional.</FieldDescription>
        </FieldContent>
        <Input className="md:w-64" />
      </Field>
      <Button className="w-fit">Save</Button>
    </FieldGroup>
  );
}

export function AFieldSet() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend>Notifications</FieldLegend>
      <FieldGroup className="gap-4">
        <Field orientation="horizontal">
          <Checkbox defaultChecked />
          <FieldLabel>Comments</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox />
          <FieldLabel>Mentions</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
