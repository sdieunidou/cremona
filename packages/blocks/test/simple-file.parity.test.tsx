import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { SimpleFile } from "../src/files/simple/react.js";
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
  "../src/files/simple",
);

// The POC page chunk only carried 12 variations (build drift): it generated
// one preview per file type at runtime. The goldens label each variant with
// the file type, so we pass `extension` explicitly for every one of them.
const FILE_TYPES = [
  "pdf", "docx", "pptx", "txt", "md", "xlsx", "csv", "png", "jpg", "webp",
  "svg", "psd", "fig", "mp4", "mp3", "zip", "json", "sql", "html", "css",
  "js", "ts", "jsx", "tsx", "py", "php",
] as const;

runGoldenParity("files/simple", {
  blockDir,
  Component: SimpleFile,
  variants: FILE_TYPES.map((extension) => ({ label: extension, props: { extension } })),
});
