import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Carousel } from "../src/images/carousel/react.js";
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

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/carousel");

// photo roster from the POC page chunk (`slides:a` identifier)
const slides = [
  { src: "../../media/placeholders/photo-07.jpg", title: "Beach", caption: "A beautiful tropical beach" },
  { src: "../../media/placeholders/photo-08.jpg", title: "City", caption: "Train station in the city" },
  { src: "../../media/placeholders/photo-09.jpg", title: "Paris", caption: "The capital of France" },
];

runGoldenParity("images/carousel", {
  blockDir,
  Component: Carousel,
  variants: [
    { label: "real images", props: { badge: false, slides, count: 3 } },
    { label: "isometric · real images", props: { isometric: true, badge: false, slides, count: 3 } },
  ],
});
