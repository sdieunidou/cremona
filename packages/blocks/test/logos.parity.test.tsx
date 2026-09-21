import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Logos } from "../src/sections/logos/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/sections/logos");

runGoldenParity("sections/logos", {
  blockDir,
  Component: Logos,
  variants: [
    { label: "fadeOut", props: { fadeOut: true } },
    { label: "isometric", props: { isometric: true } },
    { label: "isometric · fadeOut", props: { isometric: true, fadeOut: true } },
    { label: "default · no gradient", props: { gradient: false } },
    { label: "isometric · no gradient", props: { isometric: true, gradient: false } },
  ],
});
