import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WorldMap } from "../src/geo/world-map/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/geo/world-map");

runGoldenParity("geo/world-map", {
  blockDir,
  Component: WorldMap,
  variants: [
    // propsRaw contains `lng:-.13` which the shared JSON-based parser can't
    // handle (JSON forbids leading-dot numbers); resolved manually here.
    {
      label: "active marker",
      props: {
        markers: [
          { lat: 37.77, lng: -122.42, label: "San Francisco" },
          { lat: 51.51, lng: -0.13, label: "London", active: true },
          { lat: 1.35, lng: 103.82, label: "Singapore" },
          { lat: -33.87, lng: 151.21, label: "Sydney" },
        ],
        arcPairs: [
          [0, 1],
          [1, 2],
          [2, 3],
        ],
        labels: true,
      },
    },
    {
      label: "custom colors",
      props: {
        arcs: false,
        markers: [
          { lat: 37.77, lng: -122.42, color: "text-sky-600 dark:text-sky-500" },
          { lat: 51.51, lng: -0.13, color: "text-violet-600 dark:text-violet-500" },
          { lat: -23.55, lng: -46.63, color: "text-rose-600 dark:text-rose-500" },
          { lat: 1.35, lng: 103.82, color: "text-emerald-600 dark:text-emerald-500" },
          { lat: -33.87, lng: 151.21, color: "text-orange-600 dark:text-orange-500" },
        ],
      },
    },
  ],
});
