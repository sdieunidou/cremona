import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Card } from "../src/components/card/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/card");

runGoldenParity("components/card", { blockDir, Component: Card });
