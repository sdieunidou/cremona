import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Badge } from "../src/components/badge/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/badge");

runGoldenParity("components/badge", { blockDir, Component: Badge });
