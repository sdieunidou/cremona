import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LogoReel } from "../src/integrations/logo-reel/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/integrations/logo-reel");

// custom logo set for the "custom logos" variant (from the golden markup)
const vBig = (
  <svg viewBox="0 0 24 24" className="size-7 fill-current text-foreground">
    <path d="M6 2l6 3.75L6 9.5 0 5.75zm12 0l6 3.75-6 3.75-6-3.75zM0 13.25L6 9.5l6 3.75L6 17zm12 0L18 9.5l6 3.75L18 17zM6 18.25l6-3.75 6 3.75L12 22z" />
  </svg>
);
const vercelSmall = (
  <svg viewBox="0 0 24 24" className="size-6 fill-current text-foreground">
    <path d="M12 1l12 21H0z" />
  </svg>
);
const xSmall = (
  <svg viewBox="0 0 24 24" className="size-6 fill-current text-foreground">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
const slackBig = (
  <svg viewBox="0 0 24 24" className="size-7 fill-current text-foreground">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
  </svg>
);
const figmaBig = (
  <svg viewBox="0 0 24 24" className="size-7 fill-current text-foreground">
    <path
      fillRule="evenodd"
      d="M8.5 2A3.5 3.5 0 0 0 5 5.5 3.5 3.5 0 0 0 8.5 9H12V2H8.5Zm3.5 7h3.5a3.5 3.5 0 1 0 0-7H12v7ZM5 12a3.5 3.5 0 0 1 3.5-3.5H12v7H8.5A3.5 3.5 0 0 1 5 12Zm7 3.5V19a3.5 3.5 0 1 1-3.5-3.5H12Zm3.5-3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
    />
  </svg>
);

const customLogos = [vBig, vercelSmall, xSmall, slackBig, figmaBig, vBig, vercelSmall];

// the "three logos" variant cycles a 3-logo set across the 7 slots
const threeLogos = [figmaBig, vBig, slackBig];

runGoldenParity("integrations/logo-reel", {
  blockDir,
  Component: LogoReel,
  variants: [
    { label: "custom logos", props: { logos: customLogos } },
    { label: "direction right", props: { direction: "right" } },
    { label: "hover", props: { hover: true } },
    { label: "fast interval", props: { interval: 1000 } },
    { label: "slow interval", props: { interval: 4000 } },
    { label: "no glow", props: { glow: false } },
    { label: "three logos · direction right", props: { logos: threeLogos, direction: "right" } },
  ],
});
