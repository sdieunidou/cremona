import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Globe } from "../src/geo/globe/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/geo/globe");

runGoldenParity("geo/globe", {
  blockDir,
  Component: Globe,
  variants: [
    // propsRaw contains `lng:-.13` which the shared JSON-based parser can't
    // handle (JSON forbids leading-dot numbers); resolved manually here.
    {
      label: "half · labels",
      props: {
        half: true,
        arcs: false,
        spinSpeed: -6,
        wrapperClassName: "max-w-full",
        markers: [
          { lat: 37.77, lng: -122.42, label: "San Francisco" },
          { lat: 40.71, lng: -74, label: "New York" },
          { lat: 51.51, lng: -0.13, label: "London" },
          { lat: 1.35, lng: 103.82, label: "Singapore" },
          { lat: 35.68, lng: 139.69, label: "Tokyo" },
        ],
      },
    },
    {
      label: "start: americas · arc pairs",
      props: {
        startAt: "americas",
        markers: [
          { lat: 40.71, lng: -74, label: "New York" },
          { lat: 51.51, lng: -0.13 },
          { lat: 35.68, lng: 139.69 },
          { lat: -33.87, lng: 151.21 },
        ],
        arcPairs: [
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      },
    },
    {
      label: "dot pulse",
      props: {
        arcPulse: "dot",
        markers: [
          { lat: 37.77, lng: -122.42 },
          { lat: 40.71, lng: -74 },
          { lat: 51.51, lng: -0.13 },
          { lat: 1.35, lng: 103.82 },
          { lat: 35.68, lng: 139.69 },
        ],
      },
    },
  ],
});
