import { Field, FieldDescription, FieldError, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";

export default function InAField() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Full name</FieldLabel>
      <Input autoComplete="name" placeholder="Ada Lovelace" />
      <FieldDescription>As it appears on your invoices.</FieldDescription>
    </Field>
  );
}

export function Types() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input type="email" aria-label="Email" placeholder="Email" autoComplete="email" />
      <Input
        type="password"
        aria-label="Password"
        placeholder="Password"
        autoComplete="current-password"
      />
      <Input type="search" aria-label="Search" placeholder="Search…" />
      <Input type="file" aria-label="Attachment" />
    </div>
  );
}

export function Invalid() {
  return (
    <Field invalid className="w-full max-w-sm">
      <FieldLabel>Username</FieldLabel>
      <Input defaultValue="ada lovelace" />
      <FieldError>Usernames have no spaces</FieldError>
    </Field>
  );
}

export function Disabled() {
  return (
    <Field disabled className="w-full max-w-sm">
      <FieldLabel>Organisation</FieldLabel>
      <Input defaultValue="Analytical Engines Ltd" />
    </Field>
  );
}
