import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Blog } from "../src/sections/blog/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/blog");

runGoldenParity("sections/blog", {
  blockDir,
  Component: Blog,
});
