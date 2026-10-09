import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Checkbox } from "../src/checkbox.js";
import { Field, FieldDescription, FieldError, FieldLabel } from "../src/field.js";
import { a11yViolations } from "./axe.js";

describe("Checkbox", () => {
  it("is a checkbox named by its field label, toggled by a click on either", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Field orientation="horizontal">
        <Checkbox onCheckedChange={onCheckedChange} />
        <FieldLabel>Accept the terms</FieldLabel>
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: "Accept the terms" });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    await user.click(screen.getByText("Accept the terms"));
    expect(box).not.toBeChecked();
    expect(onCheckedChange.mock.calls.map(([value]) => value)).toEqual([true, false]);
  });

  it("toggles with Space and leaves Enter alone", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Subscribe" />);
    await user.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("can be indeterminate", () => {
    render(<Checkbox aria-label="Select all" checked="indeterminate" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
  });

  it("is not toggled when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Subscribe" disabled />);
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("is described and marked invalid by its field", () => {
    render(
      <Field invalid>
        <Checkbox />
        <FieldLabel>Accept the terms</FieldLabel>
        <FieldDescription>Required to continue.</FieldDescription>
        <FieldError>Accept the terms to continue</FieldError>
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: "Accept the terms" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Required to continue. Accept the terms to continue");
  });

  it("submits its value with a form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return [...new FormData(event.currentTarget).entries()];
    });
    render(
      <form onSubmit={onSubmit}>
        <Checkbox name="newsletter" value="yes" aria-label="Newsletter" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.results[0]?.value).toEqual([["newsletter", "yes"]]);
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        <Checkbox aria-label="One" />
        <Checkbox aria-label="Two" defaultChecked />
        <Checkbox aria-label="Three" checked="indeterminate" />
        <Checkbox aria-label="Four" disabled />
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
