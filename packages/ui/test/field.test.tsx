import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../src/field.js";
import { Input } from "../src/input.js";
import { a11yViolations } from "./axe.js";

describe("Field", () => {
  it("points the label at the control: a click on the label focuses it", async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("type", "email");
    await user.click(screen.getByText("Email"));
    expect(input).toHaveFocus();
  });

  it("describes the control by the description and the error that are on screen", () => {
    const { rerender } = render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError>That is not an email.</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("We never share it. That is not an email.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("That is not an email.");

    // no dangling reference once they are gone
    rerender(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldDescription>We never share it.</FieldDescription>
      </Field>,
    );
    expect(input).toHaveAccessibleDescription("We never share it.");
    expect(input).not.toHaveAttribute("aria-invalid");
    rerender(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input />
      </Field>,
    );
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("disables the control and dims the label", () => {
    render(
      <Field disabled>
        <FieldLabel>Email</FieldLabel>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(document.querySelector('[data-slot="field"]')).toHaveAttribute("data-disabled", "true");
  });

  it("keeps what the control sets itself", () => {
    render(
      <Field invalid>
        <FieldLabel htmlFor="mine">Email</FieldLabel>
        <Input id="mine" aria-describedby="hint" aria-invalid={false} />
        <p id="hint">Hint</p>
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "mine");
    expect(input).toHaveAccessibleDescription("Hint");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("has an error that renders nothing without text, and lists distinct messages once", () => {
    const { rerender } = render(
      <Field>
        <FieldError errors={[undefined, {}]} />
      </Field>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(
      <Field>
        <FieldError errors={[{ message: "Too short" }, { message: "Too short" }]} />
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    rerender(
      <Field>
        <FieldError errors={[{ message: "Too short" }, { message: "No digit" }]} />
      </Field>,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Too short",
      "No digit",
    ]);
  });

  it("has three orientations, the responsive one measured on its field group", () => {
    render(
      <FieldGroup>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Name</FieldLabel>
          </FieldContent>
          <Input />
        </Field>
        <Field orientation="horizontal">
          <Input />
        </Field>
        <Field>
          <Input />
        </Field>
      </FieldGroup>,
    );
    const fields = [...document.querySelectorAll('[data-slot="field"]')];
    expect(fields.map((f) => f.getAttribute("data-orientation"))).toEqual([
      "responsive",
      "horizontal",
      "vertical",
    ]);
    expect(document.querySelector('[data-slot="field-group"]')).toHaveClass(
      "@container/field-group",
    );
    expect(fields[0]).toHaveClass("@md/field-group:flex-row");
    expect(fields[0]).toHaveClass("flex-col");
  });

  it("names a fieldset by its legend", () => {
    render(
      <FieldSet>
        <FieldLegend>Billing address</FieldLegend>
        <Field>
          <FieldLabel>City</FieldLabel>
          <Input />
        </Field>
      </FieldSet>,
    );
    expect(screen.getByRole("group", { name: "Billing address" })).toContainElement(
      screen.getByLabelText("City"),
    );
  });

  it("has no accessibility violation in a form", async () => {
    const { container } = render(
      <form>
        <FieldSet>
          <FieldLegend>Account</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" required />
              <FieldDescription>We never share it.</FieldDescription>
            </Field>
            <Field invalid>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" />
              <FieldError>Too short</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
