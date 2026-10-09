import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlusIcon } from "lucide-react";

import { Button } from "../src/button.js";
import { a11yViolations } from "./axe.js";

describe("Button", () => {
  it("is a button named by its text", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("names its variant and size for styling", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "default");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");
    rerender(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("clicks with the mouse, Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("does nothing when disabled, and leaves the tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).not.toHaveFocus();
  });

  it("renders its child with asChild: a link keeps its role and gets the styles", () => {
    render(
      <Button asChild variant="link">
        <a href="/pricing">Pricing</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveClass("text-primary", "underline-offset-4");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("takes a ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole("button"));
  });

  it("lets a className override its own classes", () => {
    render(<Button className="h-12 bg-secondary">Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-12", "bg-secondary");
    expect(button).not.toHaveClass("h-9", "bg-primary");
  });

  it("has no accessibility violation in any variant and size", async () => {
    const { container } = render(
      <div>
        {(["default", "secondary", "destructive", "outline", "ghost", "link"] as const).map(
          (variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ),
        )}
        {(["sm", "lg"] as const).map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button size="icon-sm" aria-label="Add item">
          <PlusIcon />
        </Button>
        <Button disabled>disabled</Button>
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
