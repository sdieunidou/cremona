import { Badge } from "@cremona/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@cremona/ui/table";

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV-003", status: "Paid", method: "Bank transfer", amount: "$350.00" },
];

export default function Invoices() {
  return (
    <Table containerClassName="w-full max-w-2xl">
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableHead scope="row">{invoice.id}</TableHead>
            <TableCell>
              <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

/** A table wider than its box scrolls sideways in its own region, which takes focus to be scrolled. */
export function Overflowing() {
  return (
    <Table label="Shipments" containerClassName="w-full max-w-sm">
      <TableHeader>
        <TableRow>
          {["Order", "Carrier", "Destination", "Weight", "Status", "Estimated delivery"].map(
            (heading) => (
              <TableHead key={heading}>{heading}</TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableHead scope="row">#1042</TableHead>
          <TableCell>Colissimo</TableCell>
          <TableCell>Lyon, France</TableCell>
          <TableCell>2.4 kg</TableCell>
          <TableCell>In transit</TableCell>
          <TableCell>Thursday</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">#1043</TableHead>
          <TableCell>DHL</TableCell>
          <TableCell>Berlin, Germany</TableCell>
          <TableCell>0.8 kg</TableCell>
          <TableCell>Delivered</TableCell>
          <TableCell>Tuesday</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
