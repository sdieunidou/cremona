import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Gallery } from "../src/images/gallery/react.js";
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

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/gallery");

// photo roster from the POC page chunk (`items:a` identifier)
const items = [
  { src: "../../media/placeholders/photo-12.jpg", title: "Alpine" },
  { src: "../../media/placeholders/photo-13.jpg", title: "Dusk" },
  { src: "../../media/placeholders/photo-14.jpg", title: "Pacific" },
  { src: "../../media/placeholders/photo-15.jpg", title: "Pines" },
  { src: "../../media/placeholders/photo-16.jpg", title: "Dunes" },
  { src: "../../media/placeholders/photo-17.jpg", title: "Skyline" },
  { src: "../../media/placeholders/photo-18.jpg", title: "Aurora" },
  { src: "../../media/placeholders/photo-19.jpg", title: "Blossom" },
  { src: "../../media/placeholders/photo-20.jpg", title: "Studio" },
];

runGoldenParity("images/gallery", {
  blockDir,
  Component: Gallery,
  variants: [
    { label: "real images", props: { title: "Photo library", badge: false, items } },
    { label: "isometric · real images", props: { isometric: true, title: "Photo library", badge: false, items } },
  ],
});
