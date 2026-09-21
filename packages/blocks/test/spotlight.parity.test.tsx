import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Spotlight } from "../src/branding/spotlight/react.js";
import { Sparkles } from "lucide-react";
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

const blockDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/branding/spotlight",
);

runGoldenParity("branding/spotlight", {
  blockDir,
  Component: Spotlight,
  variants: [
    // `logo:(0,a.jsx)(n,...)` identifier in propsRaw — pass the element explicitly
    { label: "custom logo", props: { logo: <Sparkles className="size-6" strokeWidth={1.5} /> } },
    // `image:e(...)` cdn call — resolve the golden path explicitly
    { label: "image", props: { image: "../../media/placeholders/photo-08.jpg" } },
  ],
});
