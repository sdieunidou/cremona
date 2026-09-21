import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DropdownMenu } from "../src/components/dropdown-menu/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/components/dropdown-menu");

runGoldenParity("components/dropdown-menu", {
  blockDir,
  Component: DropdownMenu,
});
