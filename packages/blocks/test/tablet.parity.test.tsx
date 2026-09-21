import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Tablet } from "../src/devices/tablet/react.js";
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
  "../src/devices/tablet",
);

// image paths resolved from the golden HTML (`use-cdn` helper in the POC page chunk)
const photo01 = "../../media/placeholders/photo-01.jpg";

runGoldenParity("devices/tablet", {
  blockDir,
  Component: Tablet,
  variants: [
    { label: "lockscreen · image", props: { variant: "lockscreen", image: photo01 } },
    { label: "screenshot", props: { variant: "screenshot", image: photo01 } },
    {
      label: "lockscreen · custom copy",
      props: {
        variant: "lockscreen",
        image: photo01,
        time: "14:08",
        date: "Friday, June 6",
        notifications: [],
      },
    },
  ],
});
