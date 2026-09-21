import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { Stack } from "../src/avatars/stack/react.js";
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
  "../src/avatars/stack",
);

// photo roster from the POC page chunk (`avatars:a` identifier)
const photos = [
  { initials: "JC", image: "../../media/placeholders/avatar-05.jpg" },
  { initials: "AM", image: "../../media/placeholders/avatar-07.jpg" },
  { initials: "KL", image: "../../media/placeholders/avatar-08.jpg" },
  { initials: "DP", image: "../../media/placeholders/avatar-06.jpg" },
  { initials: "SR", image: "../../media/placeholders/avatar-02.jpg" },
];

runGoldenParity("avatars/stack", {
  blockDir,
  Component: Stack,
  variants: [
    { label: "photos", props: { avatars: photos } },
    { label: "photos · isometric", props: { avatars: photos, isometric: true } },
  ],
});
