/** The published tarball must run on its own: bundled data, no authoring tools. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
let workDir;
let client;

beforeAll(async () => {
  workDir = mkdtempSync(join(tmpdir(), "cremona-mcp-pack-"));
  execFileSync("pnpm", ["pack", "--pack-destination", workDir], { cwd: pkgRoot, stdio: "ignore" });
  const tarball = readdirSync(workDir).find((f) => f.endsWith(".tgz"));
  execFileSync("tar", ["-xzf", join(workDir, tarball), "-C", workDir]);
  symlinkSync(join(pkgRoot, "node_modules"), join(workDir, "package", "node_modules"), "dir");

  client = new Client({ name: "packaged-test", version: "0.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(workDir, "package", "bin", "cremona-mcp.mjs")],
      cwd: workDir,
    }),
  );
}, 120000);

afterAll(async () => {
  await client?.close();
  if (workDir) rmSync(workDir, { recursive: true, force: true });
  rmSync(join(pkgRoot, "data"), { recursive: true, force: true });
});

const json = async (name, args = {}) =>
  JSON.parse((await client.callTool({ name, arguments: args })).content[0].text);

describe("packaged @cremona/mcp", () => {
  it("does not expose the authoring tools", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("get_block");
    expect(names).not.toContain("add_block");
    expect(names).not.toContain("add_category");
  });

  it("serves blocks, templates, guides and tokens from the bundled data", async () => {
    const block = await json("get_block", {
      key: "metrics/stat-card",
      include: ["react", "stimulus"],
    });
    expect(block.reactSource).toContain("export function StatCard");
    expect(block.import).toBe('import { StatCard } from "@cremona/blocks/metrics/stat-card";');
    expect(block.stimulus.sample).toContain('data-controller="cremona-visual"');
    const guide = await client.callTool({ name: "get_guide", arguments: { name: "react" } });
    expect(guide.content[0].text).toContain("# React adapter");
    expect((await json("get_css", { kind: "tokens" })).css).toContain(":root{--background");
    expect((await json("get_css")).fonts.files.length).toBeGreaterThan(0);
    expect((await json("validate")).ok).toBe(true);
    expect((await json("list_components")).components.map((c) => c.name)).toContain("button");
    const button = await json("get_component", { name: "button" });
    expect(button.files[0].content).toContain("export { Button");
  });
});
