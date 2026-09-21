import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Error } from "../src/states/error/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/states/error");

// states/error: 8 of 10 variants have empty propsRaw in block.json (POC build
// drift); props derived from golden labels. Test name disambiguated from
// sections/error.
runGoldenParity("states/error", {
  blockDir,
  Component: Error,
  variants: [
    { label: "default · no glow", props: { glow: false } },
    { label: "isometric · no glow", props: { isometric: true, glow: false } },
    { label: "line pulse", props: { pulse: "line" } },
    { label: "line pulse · isometric", props: { pulse: "line", isometric: true } },
    { label: "two services", props: { services: 2 } },
    { label: "five services · isometric", props: { services: 5, isometric: true } },
    { label: "hover", props: { hover: true } },
    { label: "hover · isometric", props: { hover: true, isometric: true } },
  ],
});
