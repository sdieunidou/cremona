import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../src/accordion.js";
import { a11yViolations } from "./axe.js";

function Example({
  type = "single",
  defaultValue,
}: {
  type?: "single" | "multiple";
  defaultValue?: string;
}) {
  const items = (
    <>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>We ship worldwide.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Thirty days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="support" disabled>
        <AccordionTrigger>Support</AccordionTrigger>
        <AccordionContent>Always.</AccordionContent>
      </AccordionItem>
    </>
  );
  return type === "multiple" ? (
    <Accordion type="multiple">{items}</Accordion>
  ) : (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      {items}
    </Accordion>
  );
}

describe("Accordion", () => {
  it("is a list of buttons that say whether their section is open", () => {
    render(<Example defaultValue="shipping" />);
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Returns" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("We ship worldwide.")).toBeVisible();
    expect(screen.queryByText("Thirty days.")).not.toBeInTheDocument();
  });

  it("puts each button in a heading, level 3 unless told otherwise", () => {
    const { unmount } = render(<Example />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Shipping",
      "Returns",
      "Support",
    ]);
    unmount();
    render(
      <Accordion type="single">
        <AccordionItem value="a">
          <AccordionTrigger headingLevel={2}>Section</AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
  });

  it("opens and closes with the mouse, Enter and Space", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const shipping = screen.getByRole("button", { name: "Shipping" });
    await user.click(shipping);
    expect(shipping).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Enter}");
    expect(shipping).toHaveAttribute("aria-expanded", "false");
    await user.keyboard(" ");
    expect(shipping).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps one section open in single mode, and any number in multiple mode", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Example />);
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    await user.click(screen.getByRole("button", { name: "Returns" }));
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    unmount();
    render(<Example type="multiple" />);
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    await user.click(screen.getByRole("button", { name: "Returns" }));
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Returns" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("moves between its triggers with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Returns" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "Shipping" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Returns" })).toHaveFocus();
  });

  it("does not open a disabled section", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Support" }));
    expect(screen.getByRole("button", { name: "Support" })).toBeDisabled();
    expect(screen.queryByText("Always.")).not.toBeInTheDocument();
  });

  it("hides the chevron from assistive technology", () => {
    render(<Example />);
    expect(screen.getByRole("button", { name: "Shipping" }).querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("only animates when the user does not ask for reduced motion", () => {
    render(<Example defaultValue="shipping" />);
    const classes = screen.getByText("We ship worldwide.").parentElement!.className.split(/\s+/);
    const animated = classes.filter((c) => /animate-/.test(c));
    expect(animated.length).toBeGreaterThan(0);
    expect(animated.every((c) => c.startsWith("motion-safe:"))).toBe(true);
  });

  it("has no accessibility violation", async () => {
    const { container } = render(<Example defaultValue="shipping" />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
