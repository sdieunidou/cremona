import { render, screen } from "@testing-library/react";

import { Badge } from "../src/badge.js";
import { a11yViolations } from "./axe.js";

describe("Badge", () => {
  it("is a short piece of text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New").tagName).toBe("SPAN");
    expect(screen.getByText("New")).toHaveAttribute("data-slot", "badge");
  });

  it("names its variant for styling, default when none is given", () => {
    const { rerender } = render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveAttribute("data-variant", "default");
    rerender(<Badge variant="success">Paid</Badge>);
    expect(screen.getByText("Paid")).toHaveAttribute("data-variant", "success");
  });

  it("tints the status variants with the status tokens", () => {
    render(
      <div>
        <Badge variant="success">Paid</Badge>
        <Badge variant="warning">Late</Badge>
        <Badge variant="info">Draft</Badge>
        <Badge variant="destructive">Failed</Badge>
      </div>,
    );
    expect(screen.getByText("Paid")).toHaveClass("bg-success/10", "text-success");
    expect(screen.getByText("Late")).toHaveClass("bg-warning/10", "text-warning");
    expect(screen.getByText("Draft")).toHaveClass("bg-info/10", "text-info");
    expect(screen.getByText("Failed")).toHaveClass("bg-destructive", "text-destructive-foreground");
  });

  it("renders its child with asChild: a link keeps its role", () => {
    render(
      <Badge asChild variant="outline">
        <a href="/changelog">Changelog</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link).toHaveAttribute("href", "/changelog");
    expect(link).toHaveAttribute("data-slot", "badge");
  });

  it("merges its className", () => {
    render(<Badge className="uppercase">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("uppercase", "rounded-md");
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        {(
          ["default", "secondary", "destructive", "outline", "success", "warning", "info"] as const
        ).map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
