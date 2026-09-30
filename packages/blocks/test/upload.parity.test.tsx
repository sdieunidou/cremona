import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Upload } from "../src/files/upload/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3's renderToStaticMarkup no longer emits <!-- --> text separators
// and hoists <link rel="preload" as="image">; the POC goldens were SSR'd with
// an older React. renderToString keeps the separators, matching the goldens.

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/files/upload");

runGoldenParity("files/upload", {
  blockDir,
  Component: Upload,
});
