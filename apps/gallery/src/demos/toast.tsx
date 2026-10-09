import { Button } from "@cremona/ui/button";
import { Toaster, toast } from "@cremona/ui/toast";

/** Mount `<Toaster />` once, near the root of the app, and call `toast()` from anywhere. */
export default function Variants() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() => toast({ title: "Saved", description: "Your draft is up to date." })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: "Published", variant: "success", description: "It is live." })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() => toast({ title: "Storage almost full", variant: "warning" })}
      >
        Warning
      </Button>
      <Toaster />
    </>
  );
}

/** An error stays until it is closed: it is announced at once and not on a timer. */
export function WithAnAction() {
  return (
    <>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            title: "Message deleted",
            variant: "destructive",
            action: { label: "Undo", onClick: () => toast({ title: "Restored" }) },
          })
        }
      >
        Delete message
      </Button>
      <Button variant="outline" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
    </>
  );
}
