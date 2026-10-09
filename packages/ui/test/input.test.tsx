import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "../src/input.js";
import { a11yViolations } from "./axe.js";

describe("Input", () => {
  it("is a text box with its placeholder, value and type", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" placeholder="Ada" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("placeholder", "Ada");
    await user.type(input, "Lovelace");
    expect(input).toHaveValue("Lovelace");
  });

  it("takes a ref and merges its className", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" className="h-12" />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
    expect(ref.current).toHaveClass("h-12");
    expect(ref.current).not.toHaveClass("h-9");
  });

  it("is 16 px on small screens and 14 px from md (iOS does not zoom in)", () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole("textbox")).toHaveClass("text-base", "md:text-sm");
  });

  it("styles the invalid state from aria-invalid", () => {
    render(<Input aria-label="Name" aria-invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox")).toHaveClass("aria-invalid:border-destructive");
  });

  it("is disabled", () => {
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        <Input aria-label="Name" />
        <Input aria-label="Search" type="search" />
        <Input aria-label="Secret" type="password" aria-invalid />
        <Input aria-label="Upload" type="file" />
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
