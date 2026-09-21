import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";
import { AvatarGrid } from "../src/avatars/grid/react.js";
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
  "../src/avatars/grid",
);

// photo roster from the POC page chunk (`members:a` identifier)
const photoMembers = [
  { initials: "JC", image: "../../media/placeholders/avatar-01.jpg" },
  { initials: "AM", image: "../../media/placeholders/avatar-02.jpg" },
  { initials: "KL", image: "../../media/placeholders/avatar-06.jpg" },
  { initials: "DP", image: "../../media/placeholders/avatar-03.jpg" },
  { initials: "SR", image: "../../media/placeholders/avatar-04.jpg" },
  { initials: "TN", image: "../../media/placeholders/avatar-05.jpg" },
];

runGoldenParity("avatars/grid", {
  blockDir,
  Component: AvatarGrid,
  variants: [
    { label: "photos · custom members", props: { members: photoMembers } },
    {
      label: "photos · isometric · custom members",
      props: { isometric: true, members: photoMembers },
    },
  ],
});
