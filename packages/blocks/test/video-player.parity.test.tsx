import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { VideoPlayer } from "../src/media/video-player/react.js";
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

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/media/video-player");

runGoldenParity("media/video-player", {
  blockDir,
  Component: VideoPlayer,
  variants: [
    // propsRaw contains an identifier (image path via e(...)); resolved manually
    { label: "real image", props: { image: "../../media/placeholders/photo-06.jpg", title: "Behind the scenes" } },
    {
      label: "isometric · real image",
      props: {
        isometric: true,
        image: "../../media/placeholders/photo-06.jpg",
        title: "Behind the scenes",
      },
    },
  ],
});
