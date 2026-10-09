import { Checkbox } from "@cremona/ui/checkbox";
import { Label } from "@cremona/ui/label";

export default function WithACheckbox() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="label-terms" />
      <Label htmlFor="label-terms">Accept the terms and conditions</Label>
    </div>
  );
}
