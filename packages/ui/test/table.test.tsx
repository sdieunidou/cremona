import { render, screen } from "@testing-library/react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table.js";
import { a11yViolations } from "./axe.js";

function Example(props: Partial<React.ComponentProps<typeof Table>> & { caption?: boolean } = {}) {
  const { caption = true, ...table } = props;
  return (
    <Table {...table}>
      {caption && <TableCaption>Recent invoices</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">INV-001</TableHead>
          <TableCell>Paid</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableHead scope="row">INV-002</TableHead>
          <TableCell>Pending</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">$400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function overflow(scrollWidth: number, clientWidth: number) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Table", () => {
  it("is a table with its column and row headers", () => {
    render(<Example />);
    const table = screen.getByRole("table");
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Invoice",
      "Status",
      "Amount",
    ]);
    expect(screen.getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual([
      "INV-001",
      "INV-002",
    ]);
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(table).toHaveAccessibleName("Recent invoices");
  });

  it("makes a header cell a column header unless told otherwise", () => {
    render(<Example />);
    expect(screen.getByText("Invoice")).toHaveAttribute("scope", "col");
    expect(screen.getByText("INV-001")).toHaveAttribute("scope", "row");
  });

  it("names its scrollable region with the caption, or with a label", () => {
    const { rerender } = render(<Example />);
    expect(screen.getByRole("region", { name: "Recent invoices" })).toContainElement(
      screen.getByRole("table"),
    );
    rerender(<Example label="Invoices of May" />);
    expect(screen.getByRole("region", { name: "Invoices of May" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Recent invoices" })).not.toBeInTheDocument();
  });

  it("forgets the caption when it goes", () => {
    const { rerender } = render(<Example />);
    expect(screen.getByRole("region")).toHaveAttribute("aria-labelledby");
    rerender(<Example caption={false} />);
    expect(screen.getByRole("region")).not.toHaveAttribute("aria-labelledby");
  });

  it("scrolls sideways inside its region instead of widening the page", () => {
    render(<Example containerClassName="max-h-64" />);
    const region = screen.getByRole("region");
    expect(region).toHaveClass("overflow-x-auto", "w-full", "max-h-64");
    expect(screen.getByRole("table")).toHaveClass("w-full");
  });

  it("takes no tab stop while it fits, and one while it overflows", () => {
    const { unmount } = render(<Example />);
    expect(screen.getByRole("region")).not.toHaveAttribute("tabindex");
    unmount();
    overflow(900, 300);
    render(<Example />);
    expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0");
  });

  it("highlights a selected row", () => {
    render(<Example />);
    const row = screen.getByText("INV-002").closest("tr");
    expect(row).toHaveAttribute("data-state", "selected");
    expect(row).toHaveClass("data-[state=selected]:bg-muted");
  });

  it("has no accessibility violation, fitting or overflowing", async () => {
    const { container, unmount } = render(<Example />);
    expect(await a11yViolations(container)).toEqual([]);
    unmount();
    overflow(900, 300);
    const overflowing = render(<Example />);
    expect(await a11yViolations(overflowing.container)).toEqual([]);
  });
});
