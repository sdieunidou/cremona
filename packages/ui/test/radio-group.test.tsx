import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../src/field.js";
import { RadioGroup, RadioGroupItem } from "../src/radio-group.js";
import { a11yViolations } from "./axe.js";

/**
 * Radix chooses the item that an arrow key moves focus to, while the key is down: it moves focus in a
 * timeout, so a keydown and a keyup in the same tick would find the key already released.
 */
async function arrow(user: ReturnType<typeof userEvent.setup>, key: string) {
  await user.keyboard(`{${key}>}`);
  await user.keyboard(`{/${key}}`);
}

function Example(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  return (
    <FieldSet>
      <FieldLegend id="plan-legend">Plan</FieldLegend>
      <RadioGroup aria-labelledby="plan-legend" defaultValue="monthly" {...props}>
        <Field orientation="horizontal">
          <RadioGroupItem value="monthly" />
          <FieldLabel>Monthly</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="yearly" />
          <FieldLabel>Yearly</FieldLabel>
        </Field>
        <Field orientation="horizontal" disabled>
          <RadioGroupItem value="lifetime" />
          <FieldLabel>Lifetime</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  );
}

describe("RadioGroup", () => {
  it("is a radio group whose items are named by their field labels", () => {
    render(<Example />);
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-checked"))).toEqual(
      ["true", "false", "false"],
    );
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeInTheDocument();
  });

  it("chooses with a click on the radio or on its label", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Yearly" }));
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Monthly" })).not.toBeChecked();
    await user.click(screen.getByText("Monthly"));
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(["yearly", "monthly"]);
  });

  it("is one tab stop and moves the choice with the arrow keys, skipping a disabled item", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    await arrow(user, "ArrowDown");
    expect(screen.getByRole("radio", { name: "Yearly" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await arrow(user, "ArrowDown");
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await arrow(user, "ArrowUp");
    expect(screen.getByRole("radio", { name: "Yearly" })).toHaveFocus();
  });

  it("does not choose a disabled item", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("radio", { name: "Lifetime" }));
    expect(screen.getByRole("radio", { name: "Lifetime" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Lifetime" })).not.toBeChecked();
  });

  it("is described and marked invalid by the field of an item", () => {
    render(
      <RadioGroup aria-label="Terms">
        <Field orientation="horizontal" invalid>
          <RadioGroupItem value="agree" />
          <FieldLabel>I agree</FieldLabel>
          <FieldDescription>Required.</FieldDescription>
          <FieldError>Choose to continue</FieldError>
        </Field>
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "I agree" });
    expect(radio).toHaveAttribute("aria-invalid", "true");
    expect(radio).toHaveAccessibleDescription("Required. Choose to continue");
  });

  it("submits its value with a form", async () => {
    const user = userEvent.setup();
    const entries: [string, FormDataEntryValue][][] = [];
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          entries.push([...new FormData(event.currentTarget).entries()]);
        }}
      >
        <Example name="plan" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Yearly" }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(entries).toEqual([[["plan", "yearly"]]]);
  });

  it("surrounds each circle with a 24 px hit area", () => {
    render(<Example />);
    expect(screen.getByRole("radio", { name: "Monthly" })).toHaveClass("size-4", "after:-inset-1");
  });

  it("has no accessibility violation", async () => {
    const { container } = render(<Example />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
