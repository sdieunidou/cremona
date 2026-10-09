import { ArrowRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@cremona/ui/button";

export default function Variants() {
  return (
    <>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </>
  );
}

export function Sizes() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </>
  );
}

/** An icon-only button needs an accessible name. */
export function IconOnly() {
  return (
    <>
      <Button size="icon" variant="outline" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button size="icon-sm" variant="destructive" aria-label="Delete">
        <TrashIcon />
      </Button>
    </>
  );
}

export function WithAnIcon() {
  return (
    <Button>
      Continue <ArrowRightIcon />
    </Button>
  );
}

/** `asChild` gives a link the look and the behaviour of a button. */
export function AsALink() {
  return (
    <Button asChild variant="outline">
      <a href="/components">All components</a>
    </Button>
  );
}

export function Disabled() {
  return <Button disabled>Disabled</Button>;
}
