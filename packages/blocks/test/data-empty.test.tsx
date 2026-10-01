import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Filters } from "../src/data/filters/react.js";
import { Import } from "../src/data/import/react.js";
import { Query } from "../src/data/query/react.js";
import { Table } from "../src/data/table/react.js";

/** Visible text only: tags dropped, React's text separators merged. */
const text = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe("data blocks with an empty dataset", () => {
  it("query: an empty result is empty, not the demo rows", () => {
    const html = renderToStaticMarkup(
      <Query source="invoices" columns={["id", "customer"]} rows={[]} />,
    );
    expect(text(html)).not.toContain("Emma Wilson");
    expect(text(html)).toContain("No rows");
    expect(text(html)).toContain("0 rows");
    expect(renderToStaticMarkup(<Query rows={[["1", "Ada", "$1"]]} />)).toContain("1 row<");
  });

  it("query: no condition means no WHERE clause", () => {
    const html = renderToStaticMarkup(<Query conditions={[]} />);
    expect(text(html)).not.toContain("Where");
    expect(text(html)).not.toContain("paid");
  });

  it("filters: no rule shows the whole set, not 318 of 0", () => {
    const html = text(renderToStaticMarkup(<Filters rules={[]} total={0} />));
    expect(html).not.toContain("318");
    expect(html).not.toContain("Plan");
    expect(html).toContain("No filters");
    expect(html).toContain("0 of 0 customers");
  });

  it("filters: a missing count never reads NaN", () => {
    const html = renderToStaticMarkup(
      <Filters
        total={NaN}
        rules={[{ field: "Plan", operator: "is", value: "Pro", matches: NaN }]}
      />,
    );
    expect(html).not.toContain("NaN");
  });

  it("import: no mapping shows an empty state", () => {
    const html = text(renderToStaticMarkup(<Import mappings={[]} rowCount={NaN} />));
    expect(html).not.toContain("Email Address");
    expect(html).toContain("No columns to map");
    expect(html).not.toContain("NaN");
  });

  it("table: no item shows an empty row under the header", () => {
    const html = text(renderToStaticMarkup(<Table items={[]} emptyLabel="Aucun membre" />));
    expect(html).toContain("Aucun membre");
    expect(html).not.toContain("Sarah Chen");
  });

  it("keeps the demo data when the prop is left out", () => {
    expect(text(renderToStaticMarkup(<Query />))).toContain("Emma Wilson");
    expect(text(renderToStaticMarkup(<Filters />))).toContain("318");
    expect(text(renderToStaticMarkup(<Import />))).toContain("Email Address");
  });

  it("keeps every character of a cell that repeats an email address", () => {
    const html = renderToStaticMarkup(
      <Query columns={["id", "note"]} rows={[["1", "a@b.io wrote to a@b.io again"]]} />,
    );
    expect(text(html)).toContain("a@b.io wrote to a@b.io again");
  });
});
