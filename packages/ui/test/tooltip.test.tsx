import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../src/button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../src/tooltip.js";
import { a11yViolations } from "./axe.js";

function Example(props: Partial<React.ComponentProps<typeof TooltipContent>> = {}) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button variant="outline">Save</Button>
      </TooltipTrigger>
      <TooltipContent {...props}>Save the draft</TooltipContent>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("is hidden until its trigger is hovered, then describes the trigger", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.hover(screen.getByRole("button", { name: "Save" }));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Save the draft");
    expect(screen.getByRole("button", { name: "Save" })).toHaveAccessibleDescription(
      "Save the draft",
    );
  });

  it("shows on keyboard focus too, and Escape hides it", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("hides when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger asChild>
          <Button variant="outline">Save</Button>
        </TooltipTrigger>
        <TooltipContent>Save the draft</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    await user.unhover(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("waits a moment before it shows on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Later</Button>
        </TooltipTrigger>
        <TooltipContent>Hint</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Later" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Hint");
  });

  it("can share its delays through a provider", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Example />
      </TooltipProvider>,
    );
    await user.hover(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("renders in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example container={host} />);
    await user.hover(screen.getByRole("button", { name: "Save" }));
    await screen.findByRole("tooltip");
    expect(host.querySelector('[data-slot="tooltip-content"]')).not.toBeNull();
    host.remove();
  });

  it("only animates when the user does not ask for reduced motion", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.hover(screen.getByRole("button", { name: "Save" }));
    await screen.findByRole("tooltip");
    const content = document.querySelector('[data-slot="tooltip-content"]') as HTMLElement;
    const animated = content.className
      .split(/\s+/)
      .filter((c) => /animate-|fade-|zoom-|slide-/.test(c));
    expect(animated.length).toBeGreaterThan(0);
    expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("has no accessibility violation while shown", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.hover(screen.getByRole("button", { name: "Save" }));
    await screen.findByRole("tooltip");
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
