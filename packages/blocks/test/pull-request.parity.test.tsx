import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { PullRequest } from "../src/git/pull-request/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.
vi.mock("react-dom/server", async (importOriginal) => {
  const actual = (await importOriginal()) as {
    renderToStaticMarkup: (element: React.ReactElement, options?: unknown) => string;
  };
  return {
    ...actual,
    renderToStaticMarkup: (element: React.ReactElement, options?: unknown) =>
      actual
        .renderToStaticMarkup(element, options)
        .replace(/<link rel="preload" as="image"[^>]*\/>/g, ""),
  };
});

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/git/pull-request");

runGoldenParity("git/pull-request", {
  blockDir,
  Component: PullRequest,
  variants: [
    // propsRaw contains an identifier (image path via e(...)); resolved manually
    {
      label: "avatar image",
      props: { reviewer: "Emma Wallace", reviewerImage: "../../media/placeholders/avatar-04.jpg" },
    },
  ],
});
