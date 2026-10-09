import { Button } from "@cremona/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cremona/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";

export default function EditProfile() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue="Ada Lovelace" autoComplete="name" />
          </Field>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input defaultValue="@ada" autoComplete="username" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Confirmation() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            This removes its files and its history. It cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep it</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Taller than the screen: the dialog keeps a margin and scrolls. */
export function LongContent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Terms of service</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Read them to the end.</DialogDescription>
        </DialogHeader>
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
        <DialogFooter>
          <DialogClose asChild>
            <Button>I agree</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
