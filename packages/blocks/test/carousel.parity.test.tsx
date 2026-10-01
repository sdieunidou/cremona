import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Carousel } from "../src/images/carousel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

// React 19.3 hoists <link rel="preload" as="image"> for every <img>; the POC
// goldens were SSR'd with an older React, so strip that version noise.

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/images/carousel");

// photo roster from the POC page chunk (`slides:a` identifier)
const slides = [
  {
    src: "/media/placeholders/photo-07.jpg",
    title: "Beach",
    caption: "A beautiful tropical beach",
  },
  {
    src: "/media/placeholders/photo-08.jpg",
    title: "City",
    caption: "Train station in the city",
  },
  {
    src: "/media/placeholders/photo-09.jpg",
    title: "Paris",
    caption: "The capital of France",
  },
];

// `activeIndex` centres its slide (neighbours wrap). The POC always centred slides[1],
// so these two variants list their slides in the order their goldens show.
const dolomitesFirst = [
  { kind: "mountain", title: "Dolomites", caption: "Above the cloud line" },
  { kind: "ocean", title: "Big Sur", caption: "Pacific morning swell" },
  { kind: "sunset", title: "Costa Brava", caption: "Sunset over the cliffs" },
];
const kyotoFirst = [
  { kind: "blossom", title: "Kyoto", caption: "Cherry blossom season" },
  { kind: "city", title: "Tokyo", caption: "Neon after dark" },
  { kind: "aurora", title: "Tromsø", caption: "Lights at midnight" },
];

runGoldenParity("images/carousel", {
  blockDir,
  Component: Carousel,
  variants: [
    { label: "active: first", props: { activeIndex: 0, count: 5, slides: dolomitesFirst } },
    { label: "custom slides · count", props: { slides: kyotoFirst, count: 8, activeIndex: 3 } },
    { label: "real images", props: { badge: false, slides, count: 3 } },
    {
      label: "isometric · real images",
      props: { isometric: true, badge: false, slides, count: 3 },
    },
  ],
});
