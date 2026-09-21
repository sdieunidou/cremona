import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Headphones, Mic } from "lucide-react";
import { AudioWaveform } from "../src/media/audio-waveform/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/media/audio-waveform");

runGoldenParity("media/audio-waveform", {
  blockDir,
  Component: AudioWaveform,
  variants: [
    // propsRaw contains icon identifiers; resolved manually here.
    {
      label: "voice note · custom icon · custom meta",
      props: {
        icon: <Mic className="size-4" />,
        title: "Voice memo · Tuesday",
        subtitle: "Recording",
        current: "0:18",
        duration: "0:42",
        progress: 42,
        meta: "Mono · 96kbps",
      },
    },
    {
      label: "podcast · pause · isometric",
      props: {
        isometric: true,
        state: "pause",
        icon: <Headphones className="size-4" />,
        title: "On building in public",
        subtitle: "Highlight · 10:35",
        current: "2:03",
        duration: "10:35",
        progress: 20,
        meta: "Episode 47",
      },
    },
  ],
});
