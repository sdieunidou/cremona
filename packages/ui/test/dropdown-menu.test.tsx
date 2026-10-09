import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserIcon } from "lucide-react";

import { Button } from "../src/button.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/dropdown-menu.js";
import { a11yViolations } from "./axe.js";

interface Spies {
  onProfile?: () => void;
  onDelete?: () => void;
  onBilling?: () => void;
  onChecked?: (checked: boolean) => void;
  onTheme?: (value: string) => void;
}

function Example({
  onProfile,
  onDelete,
  onBilling,
  onChecked,
  onTheme,
  container,
}: Spies & { container?: HTMLElement | null }) {
  const [theme, setTheme] = React.useState("light");
  const [status, setStatus] = React.useState(true);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent container={container}>
          <DropdownMenuLabel>Signed in as Ada</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onProfile}>
              <UserIcon aria-hidden="true" />
              Profile
              <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled onSelect={onBilling}>
              Billing
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={status}
            onCheckedChange={(checked) => {
              setStatus(checked);
              onChecked?.(checked);
            }}
          >
            Show status
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => {
              setTheme(value);
              onTheme?.(value);
            }}
          >
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button type="button">Elsewhere</button>
    </div>
  );
}

describe("DropdownMenu", () => {
  it("is closed until its trigger is used", () => {
    render(<Example />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens with a click, as a menu of items, a checkbox and radios", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    // Radix names the menu by its trigger
    expect(screen.getByRole("menu", { name: "Account" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Profile⇧P",
      "Billing",
      "Share",
      "Delete account",
    ]);
    expect(screen.getByRole("menuitemcheckbox", { name: "Show status" })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Light" })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).not.toBeChecked();
  });

  it("opens from the keyboard with focus on its first item", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Profile/ })).toHaveFocus();
  });

  it("moves with the arrow keys, Home and End, skipping a disabled item", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitemcheckbox", { name: "Show status" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete account" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: /Profile/ })).toHaveFocus();
  });

  it("runs an item and closes, giving focus back to the trigger", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn();
    render(<Example onProfile={onProfile} />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitem", { name: /Profile/ }));
    expect(onProfile).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account" })).toHaveFocus();
  });

  it("runs an item with Enter", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn();
    render(<Example onProfile={onProfile} />);
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard("{Enter}");
    expect(onProfile).toHaveBeenCalledTimes(1);
  });

  it("does not run a disabled item", async () => {
    const user = userEvent.setup();
    const onBilling = vi.fn();
    render(<Example onBilling={onBilling} />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.getByRole("menuitem", { name: "Billing" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.click(screen.getByRole("menuitem", { name: "Billing" }));
    expect(onBilling).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item and chooses a radio item", async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    const onTheme = vi.fn();
    render(<Example onChecked={onChecked} onTheme={onTheme} />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Show status" }));
    expect(onChecked).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(onTheme).toHaveBeenCalledWith("dark");
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toBeChecked();
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account" })).toHaveFocus();
  });

  it("opens a submenu with the right arrow and closes it with the left", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    const share = screen.getByRole("menuitem", { name: "Share" });
    expect(share).toHaveAttribute("aria-haspopup", "menu");
    share.focus();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Email" })).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByRole("menuitem", { name: "Email" })).not.toBeInTheDocument();
    expect(share).toHaveFocus();
  });

  it("marks a destructive item with the destructive token", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(screen.getByRole("menuitem", { name: "Delete account" })).toHaveClass(
      "data-[variant=destructive]:text-destructive",
    );
  });

  it("renders in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example container={host} />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(host).toContainElement(screen.getByRole("menu"));
    host.remove();
  });

  it("has no accessibility violation when open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Account" }));
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
