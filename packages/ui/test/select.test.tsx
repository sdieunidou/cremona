import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Field, FieldDescription, FieldError, FieldLabel } from "../src/field.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../src/select.js";
import { a11yViolations } from "./axe.js";

function Example({
  content,
  ...root
}: React.ComponentProps<typeof Select> & {
  content?: Partial<React.ComponentProps<typeof SelectContent>>;
}) {
  return (
    <Select {...root}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent {...content}>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry" disabled>
            Blueberry
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("is a combobox that shows its placeholder, then its choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger).toHaveTextContent("Pick a fruit");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("option", { name: "Banana" }));
    expect(trigger).toHaveTextContent("Banana");
    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("lists its options in a labelled listbox, with groups", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("combobox"));
    const list = screen.getByRole("listbox");
    expect(
      within(list)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["Apple", "Banana", "Blueberry", "Carrot"]);
    expect(
      within(list)
        .getAllByRole("group")
        .map((g) => g.getAttribute("aria-labelledby")),
    ).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Blueberry" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("opens from the keyboard, moves with the arrow keys and chooses with Enter", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("combobox")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("closes on Escape without choosing, and gives focus back", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick a fruit");
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("does not choose a disabled option", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Blueberry" }));
    // the list stays open and nothing is chosen (the page behind an open list is hidden)
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { hidden: true })).toHaveTextContent("Pick a fruit");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Example disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("can be controlled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example value="carrot" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Carrot");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Apple" }));
    expect(screen.getByRole("combobox")).toHaveTextContent("Carrot");
    rerender(<Example value="apple" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
  });

  it("is labelled, described and marked invalid by its field", async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Favourite fruit</FieldLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>One only.</FieldDescription>
        <FieldError>Pick a fruit to continue</FieldError>
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Favourite fruit" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("One only. Pick a fruit to continue");
    // a click on the label opens the list, as a click on the trigger does
    await user.click(screen.getByText("Favourite fruit"));
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("submits its value with a form, like a native select", async () => {
    const user = userEvent.setup();
    const entries: [string, FormDataEntryValue][][] = [];
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          entries.push([...new FormData(event.currentTarget).entries()]);
        }}
      >
        <Example name="fruit" defaultValue="apple" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Carrot" }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(entries).toEqual([[["fruit", "apple"]], [["fruit", "carrot"]]]);
  });

  it("is 16 px on small screens and 14 px from md, like an input", () => {
    render(<Example />);
    expect(screen.getByRole("combobox")).toHaveClass("text-base", "md:text-sm");
  });

  it("has two sizes", () => {
    render(
      <Select>
        <SelectTrigger size="sm" aria-label="Small">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
    expect(screen.getByRole("combobox")).toHaveClass("data-[size=sm]:h-8");
  });

  it("renders its list in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example content={{ container: host }} />);
    await user.click(screen.getByRole("combobox"));
    expect(host).toContainElement(screen.getByRole("listbox"));
    host.remove();
  });

  it("has no accessibility violation, closed or open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Example />);
    expect(await a11yViolations(container)).toEqual([]);
    await user.click(screen.getByRole("combobox"));
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
