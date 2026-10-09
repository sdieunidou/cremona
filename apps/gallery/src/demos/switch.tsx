import { Field, FieldContent, FieldDescription, FieldLabel } from "@cremona/ui/field";
import { Switch } from "@cremona/ui/switch";

export default function WithALabel() {
  return (
    <Field orientation="horizontal" className="w-full max-w-sm">
      <FieldContent>
        <FieldLabel>Airplane mode</FieldLabel>
        <FieldDescription>Turns off every connection.</FieldDescription>
      </FieldContent>
      <Switch />
    </Field>
  );
}

export function Checked() {
  return (
    <Field orientation="horizontal" className="w-full max-w-sm">
      <FieldLabel>Notifications</FieldLabel>
      <Switch defaultChecked />
    </Field>
  );
}

export function Disabled() {
  return (
    <Field disabled orientation="horizontal" className="w-full max-w-sm">
      <FieldLabel>Managed by your admin</FieldLabel>
      <Switch defaultChecked />
    </Field>
  );
}
