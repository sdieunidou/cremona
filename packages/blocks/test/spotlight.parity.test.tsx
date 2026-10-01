import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Spotlight } from "../src/branding/spotlight/react.js";
import { Sparkles } from "lucide-react";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/branding/spotlight");

runGoldenParity("branding/spotlight", {
  blockDir,
  Component: Spotlight,
  variants: [
    // `logo:(0,a.jsx)(n,...)` identifier in propsRaw — pass the element explicitly
    { label: "custom logo", props: { logo: <Sparkles className="size-6" strokeWidth={1.5} /> } },
    // `image:e(...)` cdn call — resolve the golden path explicitly
    { label: "image", props: { image: "/media/placeholders/photo-08.jpg" } },
  ],
});
