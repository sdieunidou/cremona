import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AudioWaveform } from "../src/media/audio-waveform/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/media/audio-waveform");

runGoldenParity("media/audio-waveform", {
  blockDir,
  Component: AudioWaveform,
});
