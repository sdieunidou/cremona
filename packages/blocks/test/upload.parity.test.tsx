import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Upload } from "../src/files/upload/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3's renderToStaticMarkup no longer emits <!-- --> text separators
// and hoists <link rel="preload" as="image">; the POC goldens were SSR'd with
// an older React. renderToString keeps the separators, matching the goldens.
vi.mock("react-dom/server", async (importOriginal) => {
  const actual = (await importOriginal()) as {
    renderToString: (element: React.ReactElement, options?: unknown) => string;
  };
  return {
    ...actual,
    renderToStaticMarkup: (element: React.ReactElement, options?: unknown) =>
      actual.renderToString(element, options).replace(/<link rel="preload" as="image"[^>]*\/>/g, ""),
  };
});

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/files/upload",
);

runGoldenParity("files/upload", {
  blockDir,
  Component: Upload,
});
