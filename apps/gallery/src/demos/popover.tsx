import { Button } from "@cremona/ui/button";
import { Field, FieldGroup, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@cremona/ui/popover";

/** The panel is a dialog: name it with `aria-label` or `aria-labelledby`. */
export default function Dimensions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions" className="w-80">
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel>Width</FieldLabel>
            <Input defaultValue="100%" />
          </Field>
          <Field>
            <FieldLabel>Height</FieldLabel>
            <Input defaultValue="25px" />
          </Field>
          <PopoverClose asChild>
            <Button size="sm" className="w-fit">
              Done
            </Button>
          </PopoverClose>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

export function Placement() {
  return (
    <>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="capitalize">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={side} aria-label={`Opens on the ${side}`} className="w-48 text-sm">
            Opens on the {side}, and flips when there is no room.
          </PopoverContent>
        </Popover>
      ))}
    </>
  );
}
