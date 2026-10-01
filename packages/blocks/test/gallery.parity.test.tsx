import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Gallery } from "../src/images/gallery/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/gallery");

// photo roster from the POC page chunk (`items:a` identifier). The POC reused the scene
// names ("Alpine", "Dusk"…) as the photos' alt text; these describe the actual photos.
const items = [
  { src: "/media/placeholders/photo-12.jpg", title: "Stream in a green forest" },
  { src: "/media/placeholders/photo-13.jpg", title: "Hiker facing a mountain lake" },
  { src: "/media/placeholders/photo-14.jpg", title: "Road through a green valley" },
  { src: "/media/placeholders/photo-15.jpg", title: "Fawn in a sunlit forest" },
  { src: "/media/placeholders/photo-16.jpg", title: "Golden Gate Bridge in the fog" },
  { src: "/media/placeholders/photo-17.jpg", title: "Pier on a misty lake" },
  { src: "/media/placeholders/photo-18.jpg", title: "Manhattan avenue from above" },
  { src: "/media/placeholders/photo-19.jpg", title: "Frosted berries" },
  { src: "/media/placeholders/photo-20.jpg", title: "Close-up of a cat's nose" },
];

const photoVariants = [
  { label: "real images", props: { title: "Photo library", badge: false, items } },
  {
    label: "isometric · real images",
    props: { isometric: true, title: "Photo library", badge: false, items },
  },
];

// every attribute of every scene variant
runGoldenParity("images/gallery", {
  blockDir,
  Component: Gallery,
  variants: photoVariants.map((v) => ({ ...v, skip: true })),
});

// the photo variants too, except their corrected alt text (and writes preview-props)
runGoldenParity("images/gallery · photo alt text", {
  blockDir,
  Component: Gallery,
  ignoreAttrs: ["alt", "aria-label"],
  variants: photoVariants,
});
