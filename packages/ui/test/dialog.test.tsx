import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../src/button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/dialog.js";
import { a11yViolations } from "./axe.js";

function Example(props: Partial<React.ComponentProps<typeof DialogContent>> = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent {...props}>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("is closed until its trigger is used", () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens named by its title and described by its description, with focus inside", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog", { name: "Delete project" });
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("hides the page from assistive technology while it is open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.queryByRole("button", { name: "Open" })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("keeps focus inside: Tab cycles through its controls", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
  });

  it("closes from its close button, a DialogClose and the overlay", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const open = () => user.click(screen.getByRole("button", { name: "Open" }));
    await open();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await open();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await open();
    await user.click(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("names its close button in your language, or drops it", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Example closeLabel="Fermer" />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
    unmount();
    render(<Example showCloseButton={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("renders in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example container={host} />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(host).toContainElement(screen.getByRole("dialog"));
    expect(host).toContainElement(document.querySelector('[data-slot="dialog-overlay"]'));
    host.remove();
  });

  it("never outgrows the screen: a margin on the width, a scroll on the height", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toHaveClass(
      "max-w-[calc(100%-2rem)]",
      "max-h-[calc(100dvh-2rem)]",
      "overflow-y-auto",
      "sm:max-w-lg",
    );
  });

  it("only animates when the user does not ask for reduced motion", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const classes = screen.getByRole("dialog").className.split(/\s+/);
    const animated = classes.filter((c) => /animate-|fade-|zoom-/.test(c));
    expect(animated.length).toBeGreaterThan(0);
    expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("has no accessibility violation when open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
