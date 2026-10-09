import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@cremona/ui/alert";

/** An error or a warning is announced at once, the other variants politely. */
export default function Variants() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert>
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>You can add components with the shadcn CLI.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon aria-hidden="true" />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are live.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <InfoIcon aria-hidden="true" />
        <AlertTitle>New version</AlertTitle>
        <AlertDescription>Reload to get it.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You have used 95% of your space.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Check your card details and try again.</AlertDescription>
      </Alert>
    </div>
  );
}

export function WithoutAnIcon() {
  return (
    <Alert className="w-full max-w-xl">
      <AlertTitle>No icon needed</AlertTitle>
      <AlertDescription>The text lines up on its own.</AlertDescription>
    </Alert>
  );
}
