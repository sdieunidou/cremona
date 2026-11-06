import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Combobox, filterOption, type ComboboxOption } from "../src/combobox.js";
import { Field, FieldDescription, FieldError, FieldLabel } from "../src/field.js";
import { a11yViolations } from "./axe.js";

const people: ComboboxOption[] = [
  { value: "1", label: "Alice Martin" },
  { value: "2", label: "Bruno Lefèvre" },
  { value: "3", label: "Céline Dubois", disabled: true },
  { value: "4", label: "Élodie Bernard", keywords: ["EB"] },
  { value: "5", label: "Marc Durand" },
];

function Example(props: Partial<React.ComponentProps<typeof Combobox>>) {
  return <Combobox aria-label="Consultant" placeholder="Search" options={people} {...props} />;
}

const input = () => screen.getByRole("combobox", { name: "Consultant" });
const optionNames = () =>
  within(screen.getByRole("listbox"))
    .queryAllByRole("option")
    .map((o) => o.textContent);

describe("Combobox", () => {
  it("is a collapsed combobox that controls a listbox once open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(input()).toHaveAttribute("autocomplete", "off");
    expect(input()).not.toHaveAttribute("aria-controls");
    await user.click(input());
    const list = screen.getByRole("listbox", { name: "Consultant" });
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input()).toHaveAttribute("aria-controls", list.id);
    expect(optionNames()).toHaveLength(5);
    expect(input()).toHaveFocus();
  });

  it("filters the options as the user types, ignoring case and accents", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.type(input(), "ELO");
    expect(optionNames()).toEqual(["Élodie Bernard"]);
    await user.clear(input());
    await user.type(input(), "MAR");
    expect(optionNames()).toEqual(["Alice Martin", "Marc Durand"]);
    await user.type(input(), " d");
    expect(optionNames()).toEqual(["Marc Durand"]);
  });

  it("finds an option by its keywords", () => {
    expect(filterOption(people[3]!, "eb")).toBe(true);
    expect(filterOption(people[0]!, "eb")).toBe(false);
  });

  it("highlights the first match, moves with the arrow keys and chooses with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.type(input(), "r");
    const first = screen.getByRole("option", { name: "Alice Martin" });
    expect(input()).toHaveAttribute("aria-activedescendant", first.id);
    expect(first).toHaveAttribute("data-highlighted");
    await user.keyboard("{ArrowDown}");
    expect(input()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Bruno Lefèvre" }).id,
    );
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("2");
    expect(input()).toHaveValue("Bruno Lefèvre");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("skips disabled options and stops at both ends", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(input());
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Élodie Bernard" }).id,
    );
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(input()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Marc Durand" }).id,
    );
    expect(screen.getByRole("option", { name: "Céline Dubois" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("jumps to the first and the last option with Home and End while open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(input());
    await user.keyboard("{End}");
    expect(input()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Marc Durand" }).id,
    );
    await user.keyboard("{Home}");
    expect(input()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Alice Martin" }).id,
    );
  });

  it("opens from the keyboard on the chosen option", async () => {
    const user = userEvent.setup();
    render(<Example defaultValue="4" />);
    expect(input()).toHaveValue("Élodie Bernard");
    await user.tab();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    const chosen = screen.getByRole("option", { name: "Élodie Bernard" });
    expect(chosen).toHaveAttribute("aria-selected", "true");
    expect(input()).toHaveAttribute("aria-activedescendant", chosen.id);
    expect(optionNames()).toHaveLength(5);
  });

  it("closes on Escape and puts back the chosen label", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example defaultValue="1" onValueChange={onValueChange} />);
    await user.clear(input());
    await user.type(input(), "mar");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input()).toHaveValue("Alice Martin");
    expect(input()).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("chooses with a click and keeps focus in the input", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(input());
    await user.click(screen.getByRole("option", { name: "Marc Durand" }));
    expect(input()).toHaveValue("Marc Durand");
    expect(input()).toHaveFocus();
    await user.click(input());
    await user.click(screen.getByRole("option", { name: "Céline Dubois" }));
    expect(input()).toHaveValue("Marc Durand");
  });

  it("shows and announces a message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Example emptyText="Nobody found" />);
    await user.type(input(), "zz");
    expect(optionNames()).toEqual([]);
    expect(screen.getByRole("status")).toHaveTextContent("Nobody found");
    expect(input()).not.toHaveAttribute("aria-activedescendant");
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("on leaving, chooses a label typed in full, clears an emptied input, reverts the rest", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Example defaultValue="1" onValueChange={onValueChange} />
        <button type="button">Next</button>
      </>,
    );
    await user.clear(input());
    await user.type(input(), "marc durand");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith("5");
    expect(input()).toHaveValue("Marc Durand");

    await user.click(input());
    await user.keyboard("{Control>}a{/Control}{Backspace}");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(input()).toHaveValue("");

    await user.type(input(), "ali");
    await user.tab();
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(input()).toHaveValue("");
  });

  it("submits the chosen value with a form, and Enter on an open list does not submit", async () => {
    const user = userEvent.setup();
    const entries: [string, FormDataEntryValue][][] = [];
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          entries.push([...new FormData(event.currentTarget).entries()]);
        }}
      >
        <Example name="consultant" defaultValue="1" />
        <button type="submit">Filter</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.clear(input());
    await user.type(input(), "bru{Enter}");
    expect(entries).toHaveLength(1);
    await user.keyboard("{Enter}");
    expect(entries).toEqual([[["consultant", "1"]], [["consultant", "2"]]]);
  });

  it("can be controlled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example value="5" onValueChange={() => {}} />);
    expect(input()).toHaveValue("Marc Durand");
    await user.click(input());
    await user.click(screen.getByRole("option", { name: "Alice Martin" }));
    expect(input()).toHaveValue("Marc Durand");
    rerender(<Example value="1" onValueChange={() => {}} />);
    expect(input()).toHaveValue("Alice Martin");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Example disabled />);
    expect(input()).toBeDisabled();
    await user.click(input());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("is labelled, described and marked invalid by its field, and names its list after it", async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Consultant</FieldLabel>
        <Combobox options={people} />
        <FieldDescription>Type a name.</FieldDescription>
        <FieldError>Choose a consultant</FieldError>
      </Field>,
    );
    const box = screen.getByRole("combobox", { name: "Consultant" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Type a name. Choose a consultant");
    await user.click(screen.getByText("Consultant"));
    expect(box).toHaveFocus();
    expect(screen.getByRole("listbox", { name: "Consultant" })).toBeInTheDocument();
  });

  it("is 16 px on small screens and 14 px from md, and has two sizes", () => {
    render(<Example size="sm" />);
    expect(input()).toHaveClass("text-base", "md:text-sm");
    expect(input().parentElement).toHaveAttribute("data-size", "sm");
  });

  it("renders its list in the element it is given, for a page that styles only .cremona", async () => {
    const user = userEvent.setup();
    const host = document.body.appendChild(document.createElement("div"));
    host.className = "cremona";
    render(<Example container={host} />);
    await user.click(input());
    expect(host).toContainElement(screen.getByRole("listbox"));
    host.remove();
  });

  it("has no accessibility violation, closed, open or with nothing to show", async () => {
    const user = userEvent.setup();
    const { container } = render(<Example defaultValue="2" />);
    expect(await a11yViolations(container)).toEqual([]);
    await user.click(input());
    expect(await a11yViolations(document.body)).toEqual([]);
    await user.clear(input());
    await user.type(input(), "zz");
    expect(await a11yViolations(document.body)).toEqual([]);
  });
});
