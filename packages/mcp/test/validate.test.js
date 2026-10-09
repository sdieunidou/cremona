/** validate() on a broken copy of the library: every missing piece is reported. */
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let root;
let result;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "cremona-validate-"));
  const copy = (path) => cpSync(join(repo, path), join(root, path), { recursive: true });
  for (const path of [
    "packages/mcp/src",
    "packages/blocks/catalog.json",
    "packages/blocks/src",
    "packages/blocks/test",
    "packages/stimulus/templates",
  ])
    copy(path);

  const blocks = join(root, "packages/blocks");
  rmSync(join(blocks, "src/metrics/trend/react.tsx"));
  rmSync(join(root, "packages/stimulus/templates/metrics/stat-card/000-default.html"));
  const propsPath = join(blocks, "src/charts/line/preview-props.json");
  const props = JSON.parse(readFileSync(propsPath, "utf8"));
  delete props.isometric;
  writeFileSync(propsPath, JSON.stringify(props));
  const ghostPath = join(blocks, "src/charts/bar/preview-props.json");
  writeFileSync(
    ghostPath,
    JSON.stringify({ ...JSON.parse(readFileSync(ghostPath, "utf8")), ghost: {} }),
  );
  rmSync(join(blocks, "test/metrics-comparison.parity.test.tsx"));
  mkdirSync(join(blocks, "src/metrics/orphan"));

  // a separate process, so the copy's store resolves its own REPO_ROOT
  const store = pathToFileURL(join(root, "packages/mcp/src/store.js")).href;
  const script = `const s = await import(${JSON.stringify(store)}); console.log(JSON.stringify({ root: s.REPO_ROOT, ...s.validate() }));`;
  result = JSON.parse(
    execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" }),
  );
}, 60000);

afterAll(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe("validate", () => {
  it("reads the copy, not the repo", () => {
    expect(result.root).toBe(root);
  });

  it("reports a missing react.tsx, template, preview-props entry and parity test, and orphans", () => {
    const { ok, issues } = result;
    expect(ok).toBe(false);
    expect(issues).toEqual(
      expect.arrayContaining([
        "MISSING_REACT: metrics/trend has no react.tsx",
        "MISSING_STIMULUS: metrics/stat-card · default (run pnpm generate:stimulus)",
        "MISSING_PREVIEW_PROPS: charts/line · isometric (add its props to preview-props.json)",
        "ORPHAN_PREVIEW_PROPS: charts/bar · ghost has props but is not a variant of block.json",
        "MISSING_PARITY_TEST: metrics/comparison (packages/blocks/test/metrics-comparison.parity.test.tsx)",
        "ORPHAN_BLOCK: metrics/orphan exists on disk but not in catalog.json",
      ]),
    );
    expect(issues).toHaveLength(6);
  });
});
