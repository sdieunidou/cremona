import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Phone } from "../src/devices/phone/react.js";
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
  "../src/devices/phone",
);

// image paths resolved from the golden HTML (`use-cdn` helper in the POC page chunk)
const photos = {
  photo01: "../../media/placeholders/photo-01.jpg",
  photo02: "../../media/placeholders/photo-02.jpg",
  photo03: "../../media/placeholders/photo-03.jpg",
};

runGoldenParity("devices/phone", {
  blockDir,
  Component: Phone,
  variants: [
    {
      label: "lockscreen · image",
      props: { variant: "lockscreen", image: photos.photo01 },
    },
    {
      label: "lockscreen · isometric · fadeOut",
      props: {
        variant: "lockscreen",
        image: photos.photo02,
        isometric: true,
        fadeOut: true,
      },
    },
    {
      label: "lockscreen · custom copy",
      props: {
        variant: "lockscreen",
        image: photos.photo01,
        time: "14:08",
        date: "Friday, June 6",
        notifications: [
          { app: "Slack", title: "#design", body: "New mockups uploaded to Figma" },
          { app: "Calendar", title: "Standup in 5 min", body: "Daily sync with the engineering team" },
        ],
      },
    },
    {
      label: "screenshot",
      props: { variant: "screenshot", image: photos.photo01 },
    },
    {
      label: "lockscreen · no notifications",
      props: {
        variant: "lockscreen",
        image: photos.photo03,
        time: "7:30",
        date: "Saturday, March 15",
        notifications: [],
      },
    },
  ],
});
