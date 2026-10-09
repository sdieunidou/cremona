import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@cremona/ui/field";
import { RadioGroup, RadioGroupItem } from "@cremona/ui/radio-group";

/** Name the group with a `FieldSet` and its `FieldLegend`, or with `aria-label`. */
export default function InAFieldSet() {
  return (
    <FieldSet className="w-full max-w-sm">
      <FieldLegend id="radio-density">Density</FieldLegend>
      <RadioGroup aria-labelledby="radio-density" defaultValue="comfortable">
        {["compact", "comfortable", "spacious"].map((value) => (
          <Field key={value} orientation="horizontal">
            <RadioGroupItem value={value} />
            <FieldLabel className="capitalize">{value}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}

export function WithDescriptions() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="pro" className="w-full max-w-sm">
      {[
        ["free", "Free", "For trying things out."],
        ["pro", "Pro", "For teams that ship every week."],
      ].map(([value, title, description]) => (
        <Field key={value} orientation="horizontal">
          <RadioGroupItem value={value!} />
          <FieldContent>
            <FieldLabel>{title}</FieldLabel>
            <FieldDescription>{description}</FieldDescription>
          </FieldContent>
        </Field>
      ))}
    </RadioGroup>
  );
}

export function Disabled() {
  return (
    <RadioGroup aria-label="Billing" defaultValue="monthly" disabled>
      <Field orientation="horizontal" disabled>
        <RadioGroupItem value="monthly" />
        <FieldLabel>Monthly</FieldLabel>
      </Field>
      <Field orientation="horizontal" disabled>
        <RadioGroupItem value="yearly" />
        <FieldLabel>Yearly</FieldLabel>
      </Field>
    </RadioGroup>
  );
}
