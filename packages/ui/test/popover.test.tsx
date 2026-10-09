import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../src/button.js";
import { Input } from "../src/input.js";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../src/popover.js";
import { a11yViolations } from "./axe.js";

function Example(props: Partial<React.ComponentProps<typeof PopoverContent>> = {}) {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Dimensions</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Dimensions" {...props}>
          <Input aria-label="Width" defaultValue="100%" />
          <PopoverClose asChild>
            <Button variant="outline">Done</Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <button type="button">Elsewhere</button>
    </div>
  );
}

describe("Popover", () => {
  it("is closed until its trigger is used", () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dimensions" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens next to its trigger with focus inside, and says so on the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    const panel = screen.getByRole("dialog", { name: "Dimensions" });
    expect(panel).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByRole("button", { name: "Dimensions" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dimensions" })).toHaveFocus();
  });

  it("closes from a PopoverClose and from a click outside", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not hide the rest of the page", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    expect(screen.getByRole("button", { name: "Elsewhere" })).toBeInTheDocument();
  });

  it("never outgrows the screen: a margin on the width, a scroll on the height", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    expect(screen.getByRole("dialog")).toHaveClass(
      "max-w-[calc(100vw-2rem)]",
      "max-h-(--radix-popover-content-available-height)",
      "overflow-y-auto",
    );
  });

  it("renders in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example container={host} />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    expect(host).toContainElement(screen.getByRole("dialog"));
    host.remove();
  });

  it("only animates when the user does not ask for reduced motion", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    const classes = screen.getByRole("dialog").className.split(/\s+/);
    const animated = classes.filter((c) => /animate-|fade-|zoom-|slide-/.test(c));
    expect(animated.length).toBeGreaterThan(0);
    expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("has no accessibility violation when open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Dimensions" }));
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
