import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/tabs.js";
import { a11yViolations } from "./axe.js";

function Example(props: React.ComponentProps<typeof Tabs> = {}) {
  return (
    <Tabs defaultValue="account" {...props}>
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
      <TabsContent value="billing">Billing settings</TabsContent>
      <TabsContent value="team">Team settings</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("is a tab list whose selected tab shows its panel, named by the tab", () => {
    render(<Example />);
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "Account" });
    expect(panel).toHaveTextContent("Account settings");
    expect(screen.queryByText("Password settings")).not.toBeInTheDocument();
  });

  it("selects a tab with a click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Password" }));
    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Password settings");
    expect(onValueChange).toHaveBeenCalledWith("password");
  });

  it("moves with the arrow keys, Home and End, skipping a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Team" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
  });

  it("is one tab stop, then the panel is the next", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("does not select a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("tab", { name: "Billing" }));
    expect(screen.getByRole("tab", { name: "Billing" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
  });

  it("can be vertical, answering the up and down arrows", async () => {
    const user = userEvent.setup();
    render(<Example orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByRole("tablist")).toHaveClass("data-[orientation=vertical]:flex-col");
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
  });

  it("can be controlled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example value="team" defaultValue={undefined} />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Team settings");
    await user.click(screen.getByRole("tab", { name: "Account" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Team settings");
    rerender(<Example value="account" defaultValue={undefined} />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Account settings");
  });

  it("scrolls its list on a narrow screen instead of overflowing, and keeps focus inside the triggers", () => {
    render(<Example />);
    expect(screen.getByRole("tablist")).toHaveClass("max-w-full", "overflow-x-auto");
    expect(screen.getByRole("tab", { name: "Account" })).toHaveClass(
      "focus-visible:-outline-offset-2",
    );
  });

  it("has no accessibility violation", async () => {
    const { container } = render(<Example />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
