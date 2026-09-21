import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Blog } from "../src/sections/blog/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/blog",
);

// build drift: the POC page has 9 variations but only 6 golden previews were
// extracted; the extra variations have no goldens so there is nothing to test.
runGoldenParity("sections/blog", {
  blockDir,
  Component: Blog,
});
