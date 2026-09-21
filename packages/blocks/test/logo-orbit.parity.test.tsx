import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LogoOrbit } from "../src/integrations/logo-orbit/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/integrations/logo-orbit");

// custom center logo for the "custom logo" variant (from the golden markup)
const customLogo = (
  <svg viewBox="0 0 24 24" className="size-7">
    <circle cx={7.5} cy={8} r={5} className="fill-blue-500" opacity={0.9} />
    <circle cx={16.5} cy={8} r={5} className="fill-rose-500" opacity={0.9} />
    <circle cx={12} cy={15} r={5} className="fill-amber-500" opacity={0.9} />
  </svg>
);

runGoldenParity("integrations/logo-orbit", {
  blockDir,
  Component: LogoOrbit,
  variants: [
    { label: "hover · orbit", props: { hover: true, orbit: true, innerRing: true } },
    { label: "isometric", props: { isometric: true } },
    { label: "orbit", props: { orbit: true } },
    { label: "orbit · isometric", props: { orbit: true, isometric: true } },
    { label: "hidden logo", props: { hiddenLogo: true } },
    { label: "custom logo", props: { logo: customLogo } },
    { label: "inner ring", props: { innerRing: true } },
    { label: "orbit · inner ring", props: { orbit: true, innerRing: true } },
    { label: "custom radius", props: { orbit: true, innerRing: true, radius: 160, innerRadius: 52 } },
    {
      label: "custom radius · orbit · isometric",
      props: { orbit: true, innerRing: true, radius: 140, innerRadius: 85, isometric: true },
    },
  ],
});
