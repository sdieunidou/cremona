import { render, screen } from "@testing-library/react";

import { Button } from "../src/button.js";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src/card.js";
import { a11yViolations } from "./axe.js";

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>Invite people to your workspace.</CardDescription>
        <CardAction>
          <Button size="sm">Invite</Button>
        </CardAction>
      </CardHeader>
      <CardContent>Three members</CardContent>
      <CardFooter>Updated today</CardFooter>
    </Card>
  );
}

describe("Card", () => {
  it("names each of its parts for styling", () => {
    const { container } = render(<Example />);
    const slots = [...container.querySelectorAll("[data-slot]")].map((e) =>
      e.getAttribute("data-slot"),
    );
    expect(slots).toEqual([
      "card",
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "button",
      "card-content",
      "card-footer",
    ]);
  });

  it("lays its action out beside the text from the width of the card, not of the screen", () => {
    render(<Example />);
    const header = screen.getByText("Team").parentElement;
    expect(header).toHaveClass(
      "@container/card-header",
      "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
    );
    expect(screen.getByRole("button", { name: "Invite" }).parentElement).toHaveClass(
      "col-start-2",
      "justify-self-end",
    );
  });

  it("renders the title as the heading you choose", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h2>Billing</h2>
          </CardTitle>
        </CardHeader>
      </Card>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Billing" });
    expect(heading).toHaveAttribute("data-slot", "card-title");
    expect(heading).toHaveClass("font-semibold");
  });

  it("renders the card as the element you choose", () => {
    render(
      <Card asChild>
        <article aria-label="Release notes">Body</article>
      </Card>,
    );
    expect(screen.getByRole("article", { name: "Release notes" })).toHaveAttribute(
      "data-slot",
      "card",
    );
  });

  it("merges its className", () => {
    render(<Card className="gap-2">Body</Card>);
    expect(screen.getByText("Body")).toHaveClass("gap-2");
    expect(screen.getByText("Body")).not.toHaveClass("gap-6");
  });

  it("has no accessibility violation", async () => {
    const { container } = render(<Example />);
    expect(await a11yViolations(container)).toEqual([]);
  });
});
