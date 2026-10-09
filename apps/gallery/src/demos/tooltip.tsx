import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { Button } from "@cremona/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@cremona/ui/tooltip";

const formats = [
  { Icon: BoldIcon, label: "Bold", shortcut: "⌘B" },
  { Icon: ItalicIcon, label: "Italic", shortcut: "⌘I" },
  { Icon: UnderlineIcon, label: "Underline", shortcut: "⌘U" },
];

/** A tooltip hints at a control, on hover and on keyboard focus. It never holds what a user must know. */
export default function IconButtons() {
  return (
    <TooltipProvider>
      {formats.map(({ Icon, label, shortcut }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label={label}>
              <Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {label} ({shortcut})
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}

export function Sides() {
  return (
    <>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="capitalize">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>On the {side}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}
