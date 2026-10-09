import { render, screen } from "@testing-library/react";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "../src/alert.js";
import { a11yViolations } from "./axe.js";

describe("Alert", () => {
  it("announces an error or a warning at once, anything else politely", () => {
    render(
      <div>
        <Alert variant="destructive">
          <AlertTitle>Payment failed</AlertTitle>
        </Alert>
        <Alert variant="warning">
          <AlertTitle>Storage almost full</AlertTitle>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
        </Alert>
        <Alert variant="info">
          <AlertTitle>New version</AlertTitle>
        </Alert>
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
        </Alert>
      </div>,
    );
    expect(screen.getAllByRole("alert").map((alert) => alert.textContent)).toEqual([
      "Payment failed",
      "Storage almost full",
    ]);
    expect(screen.getAllByRole("status").map((alert) => alert.textContent)).toEqual([
      "Saved",
      "New version",
      "Heads up",
    ]);
  });

  it("takes the role it is given", () => {
    render(
      <Alert variant="destructive" role="none">
        <AlertTitle>Already on screen</AlertTitle>
      </Alert>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Already on screen").parentElement).toHaveAttribute("role", "none");
  });

  it("lays out an icon, a title and a description", () => {
    render(
      <Alert variant="info">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>You can use components from npm.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole("status");
    expect(alert).toHaveAttribute("data-variant", "info");
    expect(screen.getByText("Heads up")).toHaveAttribute("data-slot", "alert-title");
    expect(screen.getByText("You can use components from npm.")).toHaveAttribute(
      "data-slot",
      "alert-description",
    );
    expect(alert).toHaveAccessibleName("");
    expect(alert).toHaveTextContent("Heads upYou can use components from npm.");
  });

  it("tints the status variants with the status tokens", () => {
    render(
      <div>
        <Alert variant="destructive">Failed</Alert>
        <Alert variant="success">Saved</Alert>
      </div>,
    );
    expect(screen.getByText("Failed")).toHaveClass("bg-destructive/10", "text-destructive");
    expect(screen.getByText("Saved")).toHaveClass("bg-success/10", "text-success");
  });

  it("has no accessibility violation", async () => {
    const { container } = render(
      <div>
        {(["default", "destructive", "success", "warning", "info"] as const).map((variant) => (
          <Alert key={variant} variant={variant}>
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>{variant}</AlertTitle>
            <AlertDescription>Something to know.</AlertDescription>
          </Alert>
        ))}
      </div>,
    );
    expect(await a11yViolations(container)).toEqual([]);
  });
});
