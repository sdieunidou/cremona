import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Input } from "../src/components/input/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/input");

runGoldenParity("components/input", { blockDir, Component: Input });
