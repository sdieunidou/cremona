import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ProfileCard } from "../src/avatars/profile-card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/avatars/profile-card");

runGoldenParity("avatars/profile-card", {
  blockDir,
  Component: ProfileCard,
  variants: [
    // `image:e(...)` cdn call in propsRaw — resolve the golden path explicitly
    {
      label: "online · photo",
      props: {
        initials: "SR",
        image: "/media/placeholders/avatar-08.jpg",
        name: "Sara Ruiz",
        role: "Design Lead",
      },
    },
  ],
});
