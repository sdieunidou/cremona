import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VideoPlayer } from "../src/media/video-player/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/media/video-player");

runGoldenParity("media/video-player", {
  blockDir,
  Component: VideoPlayer,
});
