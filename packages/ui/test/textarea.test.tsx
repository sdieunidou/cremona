import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Field, FieldDescription, FieldError, FieldLabel } from "../src/field.js";
import { Textarea } from "../src/textarea.js";
import { a11yViolations } from "./axe.js";

describe("Textarea", () => {
  it("is a multi-line text box with its placeholder and value", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Message" placeholder="Say hello" />);
    const box = screen.getByRole("textbox", { name: "Message" });
    expect(box.tagName).toBe("TEXTAREA");
    expect(box).toHaveAttribute("placeholder", "Say hello");
    await user.type(box, "one{Enter}two");
    expect(box).toHaveValue("one\ntwo");
  });

  it("takes a ref and merges its className", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Message" className="min-h-32" />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
    expect(ref.current).toHaveClass("min-h-32");
    expect(ref.current).not.toHaveClass("min-h-16");
  });

  it("is 16 px on small screens and 14 px from md (iOS does not zoom in)", () => {
    render(<Textarea aria-label="Message" />);
    expect(screen.getByRole("textbox")).toHaveClass("text-base", "md:text-sm");
  });

  it("grows with its content where the browser can", () => {
    render(<Textarea aria-label="Message" />);
    expect(screen.getByRole("textbox")).toHaveClass("field-sizing-content");
  });

  it("is labelled, described and marked invalid by its field", async () => {
    const user = userEvent.setup();
    render(
      <Field invalid>
        <FieldLabel>Message</FieldLabel>
        <Textarea />
        <FieldDescription>Plain text only.</FieldDescription>
        <FieldError>Write at least ten characters</FieldError>
      </Field>,
    );
    const box = screen.getByRole("textbox", { name: "Message" });
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription("Plain text only. Write at least ten characters");
    await user.click(screen.getByText("Message"));
    expect(box).toHaveFocus();
  });

  it("is disabled, also by its field", () => {
    const { rerender } = render(<Textarea aria-label="Message" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    rerender(
      <Field disabled>
        <FieldLabel>Message</FieldLabel>
        <Textarea />
      </Field>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        <Textarea aria-label="Message" />
        <Textarea aria-label="Bio" aria-invalid defaultValue="Ada" />
        <Textarea aria-label="Notes" disabled />
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
