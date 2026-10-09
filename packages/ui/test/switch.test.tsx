import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Field, FieldDescription, FieldLabel } from "../src/field.js";
import { Switch } from "../src/switch.js";
import { a11yViolations } from "./axe.js";

describe("Switch", () => {
  it("is a switch named by its field label, toggled by a click on either", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Field orientation="horizontal">
        <Switch onCheckedChange={onCheckedChange} />
        <FieldLabel>Airplane mode</FieldLabel>
      </Field>,
    );
    const toggle = screen.getByRole("switch", { name: "Airplane mode" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByText("Airplane mode"));
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange.mock.calls.map(([value]) => value)).toEqual([true, false]);
  });

  it("toggles with Space", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Wi-Fi" />);
    await user.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("is not toggled when disabled", async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Wi-Fi" disabled />);
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("is described by its field", () => {
    render(
      <Field>
        <FieldLabel>Notifications</FieldLabel>
        <Switch />
        <FieldDescription>Only what needs your attention.</FieldDescription>
      </Field>,
    );
    expect(screen.getByRole("switch", { name: "Notifications" })).toHaveAccessibleDescription(
      "Only what needs your attention.",
    );
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        <Switch aria-label="One" />
        <Switch aria-label="Two" defaultChecked />
        <Switch aria-label="Three" disabled />
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
