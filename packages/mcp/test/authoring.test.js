/** add_category / add_block write into the library: run in a minimal copy of the repo, never in the checkout. */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let root;
let client;

const textOf = (result) => JSON.parse(result.content[0].text);
const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "cremona-authoring-"));
  for (const path of ["packages/mcp/src", "packages/mcp/bin", "packages/mcp/package.json"])
    cpSync(join(repo, path), join(root, path), { recursive: true });
  // the server's dependencies resolve through the package's node_modules
  symlinkSync(
    join(repo, "packages/mcp/node_modules"),
    join(root, "packages/mcp/node_modules"),
    "dir",
  );
  cpSync(join(repo, "packages/tokens/themes.json"), join(root, "packages/tokens/themes.json"), {
    recursive: true,
  });
  cpSync(join(repo, "docs"), join(root, "docs"), { recursive: true });
  mkdirSync(join(root, "packages/blocks/src/demo"), { recursive: true });
  mkdirSync(join(root, "packages/blocks/test"), { recursive: true });
  writeFileSync(
    join(root, "packages/blocks/catalog.json"),
    JSON.stringify([{ category: "Demo", slug: "demo", items: [] }], null, 2) + "\n",
  );

  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(root, "packages/mcp/bin/cremona-mcp.mjs")],
    }),
  );
}, 60000);

afterAll(async () => {
  await client?.close();
  if (root) rmSync(root, { recursive: true, force: true });
});

describe("authoring tools", () => {
  it("add_category creates the folder and the catalog entry, once", async () => {
    const created = textOf(
      await client.callTool({ name: "add_category", arguments: { name: "Payments" } }),
    );
    expect(created).toMatchObject({ ok: true, slug: "payments" });
    expect(existsSync(join(root, "packages/blocks/src/payments"))).toBe(true);
    expect(readJson("packages/blocks/catalog.json").map((g) => g.slug)).toEqual([
      "demo",
      "payments",
    ]);
    const again = textOf(
      await client.callTool({ name: "add_category", arguments: { name: "Payments" } }),
    );
    expect(again.note).toBe("category already exists");
  });

  it("add_block scaffolds block.json, preview-props.json, react.tsx and a parity test", async () => {
    const result = await client.callTool({
      name: "add_block",
      arguments: {
        category: "demo",
        file: "balance-card",
        name: "Balance Card",
        description: "A balance card.",
      },
    });
    expect(result.isError).toBeUndefined();
    expect(textOf(result).files).toEqual([
      "packages/blocks/src/demo/balance-card/block.json",
      "packages/blocks/src/demo/balance-card/preview-props.json",
      "packages/blocks/src/demo/balance-card/react.tsx",
      "packages/blocks/test/demo-balance-card.parity.test.tsx",
    ]);

    const dir = "packages/blocks/src/demo/balance-card";
    const meta = readJson(`${dir}/block.json`);
    expect(Object.keys(meta)).toEqual([
      "category",
      "file",
      "name",
      "description",
      "added",
      "kind",
      "page",
      "variants",
    ]);
    expect(meta.variants.map((v) => v.label)).toEqual([
      "default",
      "fadeOut",
      "isometric",
      "isometric · fadeOut",
      "default · no gradient",
      "isometric · no gradient",
    ]);
    expect(meta.variants.every((v) => /^\d{3}-[a-z0-9-]+$/.test(v.slug) && v.size === null)).toBe(
      true,
    );

    // every variant has its props, in the form the parity test and the gallery read
    const props = readJson(`${dir}/preview-props.json`);
    expect(Object.keys(props)).toEqual(meta.variants.map((v) => v.label));
    expect(props["isometric · fadeOut"]).toEqual({ isometric: true, fadeOut: true });
    expect(props["default · no gradient"]).toEqual({ gradient: false });

    expect(readFileSync(join(root, dir, "react.tsx"), "utf8")).toMatch(
      /^"use client";[\s\S]*export function BalanceCard\(/,
    );
    expect(existsSync(join(root, dir, "golden"))).toBe(true);
    expect(
      readFileSync(join(root, "packages/blocks/test/demo-balance-card.parity.test.tsx"), "utf8"),
    ).toContain('runGoldenParity("demo/balance-card"');
    expect(readJson("packages/blocks/catalog.json")[0].items.map((i) => i.file)).toEqual([
      "balance-card",
    ]);
  });

  it("add_block refuses a block that exists and a category that does not", async () => {
    const exists = await client.callTool({
      name: "add_block",
      arguments: { category: "demo", file: "balance-card", name: "x", description: "x" },
    });
    expect(exists.isError).toBe(true);
    const unknown = await client.callTool({
      name: "add_block",
      arguments: { category: "nope", file: "x", name: "x", description: "x" },
    });
    expect(unknown.isError).toBe(true);
  });
});
