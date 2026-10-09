import { Button } from "@cremona/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cremona/ui/card";
import { Field, FieldGroup, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";

/** The action sits beside the text while the card is wide enough for both. */
export default function Login() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle asChild>
          <h3>Sign in</h3>
        </CardTitle>
        <CardDescription>Use your work email.</CardDescription>
        <CardAction>
          <Button variant="link" size="sm">
            Sign up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" autoComplete="email" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" autoComplete="current-password" />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  );
}

export function Simple() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle asChild>
          <h3>Storage</h3>
        </CardTitle>
        <CardDescription>64% of 15 GB used.</CardDescription>
      </CardHeader>
    </Card>
  );
}

/** Render the card as the element that fits the page. */
export function AsAnArticle() {
  return (
    <Card asChild className="w-full max-w-sm gap-2">
      <article aria-labelledby="card-release">
        <CardHeader>
          <CardTitle asChild>
            <h3 id="card-release">Release 2.0</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Faster and quieter.</CardContent>
      </article>
    </Card>
  );
}
