import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PullRequest } from "../src/git/pull-request/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.

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
