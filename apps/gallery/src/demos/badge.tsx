import { CheckIcon } from "lucide-react";
import { Badge } from "@cremona/ui/badge";

export default function Variants() {
  return (
    <>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </>
  );
}

/** Tinted with the status tokens. The text carries the meaning, never the colour alone. */
export function Status() {
  return (
    <>
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Overdue</Badge>
      <Badge variant="info">Draft</Badge>
    </>
  );
}

export function WithAnIcon() {
  return (
    <Badge variant="success">
      <CheckIcon aria-hidden="true" /> Verified
    </Badge>
  );
}

export function AsALink() {
  return (
    <Badge asChild variant="outline">
      <a href="/components/badge">Badge docs</a>
    </Badge>
  );
}
