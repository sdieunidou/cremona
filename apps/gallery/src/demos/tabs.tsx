import { Field, FieldLabel } from "@cremona/ui/field";
import { Input } from "@cremona/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cremona/ui/tabs";

export default function Settings() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="grid gap-3 rounded-lg border p-4">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Ada Lovelace" autoComplete="name" />
        </Field>
      </TabsContent>
      <TabsContent value="password" className="rounded-lg border p-4 text-sm">
        Change your password here.
      </TabsContent>
    </Tabs>
  );
}

export function Vertical() {
  return (
    <Tabs defaultValue="profile" orientation="vertical" className="w-full max-w-md">
      <TabsList aria-label="Sections">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="rounded-lg border p-4 text-sm">
        Your public profile.
      </TabsContent>
      <TabsContent value="security" className="rounded-lg border p-4 text-sm">
        Two-factor authentication and sessions.
      </TabsContent>
      <TabsContent value="notifications" className="rounded-lg border p-4 text-sm">
        What we email you about.
      </TabsContent>
    </Tabs>
  );
}

/** More tabs than the width holds: the list scrolls instead of overflowing the page. */
export function Narrow() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-xs">
      <TabsList aria-label="Report">
        {["Overview", "Analytics", "Reports", "Notifications", "Settings"].map((name) => (
          <TabsTrigger key={name} value={name.toLowerCase()}>
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="overview" className="rounded-lg border p-4 text-sm">
        The list above scrolls sideways.
      </TabsContent>
    </Tabs>
  );
}
