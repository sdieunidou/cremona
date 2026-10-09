import { Field, FieldDescription, FieldError, FieldLabel } from "@cremona/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@cremona/ui/select";

export default function InAField() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel>Fruit</FieldLabel>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes" disabled>
            Grapes
          </SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Disabled options cannot be chosen.</FieldDescription>
    </Field>
  );
}

export function Groups() {
  return (
    <Select defaultValue="utc">
      <SelectTrigger aria-label="Time zone" className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="cet">Central European Time</SelectItem>
          <SelectItem value="gmt">Greenwich Mean Time</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="utc">Coordinated Universal Time</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

/** A long list scrolls inside the room that is left on screen. */
export function LongList() {
  return (
    <Select>
      <SelectTrigger aria-label="Year" className="w-40">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 60 }, (_, i) => 2025 - i).map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Invalid() {
  return (
    <Field invalid className="w-full max-w-xs">
      <FieldLabel>Country</FieldLabel>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fr">France</SelectItem>
          <SelectItem value="de">Germany</SelectItem>
        </SelectContent>
      </Select>
      <FieldError>Choose a country to continue</FieldError>
    </Field>
  );
}

export function SmallAndDisabled() {
  return (
    <Select disabled>
      <SelectTrigger size="sm" aria-label="Locked" className="w-40">
        <SelectValue placeholder="Locked" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">One</SelectItem>
      </SelectContent>
    </Select>
  );
}
