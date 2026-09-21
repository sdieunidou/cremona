import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BlogPost } from "../src/sections/blog-post/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/sections/blog-post",
);

runGoldenParity("sections/blog-post", {
  blockDir,
  Component: BlogPost,
});
