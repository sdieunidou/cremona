import { useRef, useState, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Boxes, Cloud, CodeXml, Database, Globe, Mail, MessageSquare } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type HubVariant = "orbit" | "beam";
type HubSpread = "compact" | "default" | "wide";

const BEAM_WIDTH = 16;
const BASE_DELAY = 0.6;
const DELAY_STEP = 0.1;

function beamDelay(index: number): number {
  return BASE_DELAY + index * DELAY_STEP;
}

function angleAt(index: number, count: number): number {
  return (360 / count) * index;
}

const spreads: Record<HubSpread, { radius: number; frame: string; staticRings: [string, string] }> = {
  compact: { radius: 64, frame: "size-52", staticRings: ["size-24", "size-30"] },
  default: { radius: 78, frame: "size-56", staticRings: ["size-28", "size-36"] },
  wide: { radius: 90, frame: "size-68", staticRings: ["size-36", "size-44"] },
};

const defaultLogo = <Boxes className="size-6" strokeWidth={1.25} />;

const defaultSatellites = [
  <Cloud className="size-4" strokeWidth={2} />,
  <Database className="size-4" strokeWidth={2} />,
  <MessageSquare className="size-4" strokeWidth={2} />,
  <Mail className="size-4" strokeWidth={2} />,
  <Globe className="size-4" strokeWidth={2} />,
  <CodeXml className="size-4" strokeWidth={2} />,
];

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function beamCurve(x: number, y: number, bend: number): string {
  const len = Math.sqrt(x * x + y * y);
  const nx = -y / len;
  const ny = x / len;
  const cx = x / 2 + nx * BEAM_WIDTH * bend;
  const cy = y / 2 + ny * BEAM_WIDTH * bend;
  return `M 0,0 Q ${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
}

const frameAnim: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

const frameIso: Variants = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const logoAnim: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 18, delay: 0.15 },
  },
};

const lineAnim: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: "easeOut" },
  }),
};

const satelliteAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay },
  }),
};

const pulseAnim: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: (delay: number) => ({
    scale: [0.6, 0.6, 1.6],
    opacity: [0, 0.4, 0],
    transition: {
      duration: 1.8,
      delay,
      ease: "easeOut",
      times: [0, 0.001, 1],
      repeat: Infinity,
      repeatDelay: 1.2,
    },
  }),
};

const labelAnim: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 1.25, ease: "easeOut" } },
};

export interface HubProps extends VisualProps {
  variant?: HubVariant;
  label?: string;
  spread?: HubSpread;
  spin?: boolean;
  logo?: ReactNode;
  satellites?: ReactNode[];
  hover?: boolean;
  isometric?: boolean;
}

export function Hub({
  variant = "orbit",
  label = "Connected",
  spread = "default",
  spin = false,
  logo = defaultLogo,
  satellites = defaultSatellites,
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  fill = false,
  className,
}: HubProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = hover ? hovered : inView;
  const state = animated ? { initial: "hidden", animate: inView ? "visible" : "hidden" } : {};
  const cfg = spreads[spread];
  const isBeam = variant === "beam";
  const beamDelayTotal = beamDelay(satellites.length - 1) + 0.45;
  const spinning = animated && spin && !isBeam;
  const pause = active ? "" : " paused";
  const orbitSpin = spinning ? `animate-[spin_120s_linear_infinite]${pause}` : "";
  const counterSpin = spinning ? `animate-[spin_120s_linear_infinite_reverse]${pause}` : "";

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className={`relative flex ${cfg.frame} items-center justify-center`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? frameIso : frameAnim) : undefined}
        {...state}
      >
        {isBeam ? (
          <>
            <div
              className={`absolute inset-0 m-auto ${cfg.staticRings[0]} rounded-full border border-border/40`}
            />
            <div
              className={`absolute inset-0 m-auto ${cfg.staticRings[1]} rounded-full border border-border/25`}
            />
          </>
        ) : animated ? (
          <>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: +!active }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div
                className={`absolute ${cfg.staticRings[0]} rounded-full border-2 border-primary/20 opacity-30`}
              />
              <div
                className={`absolute ${cfg.staticRings[1]} rounded-full border-2 border-primary/10 opacity-20`}
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: +!!active }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute size-20 rounded-full border-2 border-primary/30"
                variants={pulseAnim}
                custom={0.5}
                initial="hidden"
                animate="visible"
              />
              <motion.div
                className="absolute size-20 rounded-full border-2 border-primary/20"
                variants={pulseAnim}
                custom={2}
                initial="hidden"
                animate="visible"
              />
            </motion.div>
          </>
        ) : (
          <>
            <div
              className={`absolute ${cfg.staticRings[0]} rounded-full border-2 border-primary/20 opacity-30`}
            />
            <div
              className={`absolute ${cfg.staticRings[1]} rounded-full border-2 border-primary/10 opacity-20`}
            />
          </>
        )}
        {isBeam ? (
          <>
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="-100 -100 200 200"
              fill="none"
            >
              {satellites.map((_, i) => {
                const { x, y } = polarToCartesian(angleAt(i, satellites.length), cfg.radius);
                const curve = beamCurve(x, y, i % 2 === 0 ? 1 : -1);
                return (
                  <motion.path
                    key={i}
                    d={curve}
                    stroke="currentColor"
                    strokeWidth={0.5}
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    className="text-muted-foreground/50"
                    variants={animated ? lineAnim : undefined}
                    custom={beamDelay(i) - 0.2}
                    {...state}
                  />
                );
              })}
              {animated && (
                <motion.g
                  initial={false}
                  animate={{ opacity: +!!active }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: active && !hover ? beamDelayTotal : 0,
                  }}
                >
                  {satellites.map((_, i) => {
                    const { x, y } = polarToCartesian(angleAt(i, satellites.length), cfg.radius);
                    const curve = beamCurve(x, y, i % 2 === 0 ? 1 : -1);
                    return (
                      <g key={i}>
                        <circle r={4} fill="currentColor" className="text-primary/15">
                          <animateMotion
                            dur="2.5s"
                            repeatCount="indefinite"
                            begin={`${-i * 0.4}s`}
                            path={curve}
                          />
                        </circle>
                        <circle r={2} fill="currentColor" className="text-primary">
                          <animateMotion
                            dur="2.5s"
                            repeatCount="indefinite"
                            begin={`${-i * 0.4}s`}
                            path={curve}
                          />
                        </circle>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </svg>
            {satellites.map((sat, i) => {
              const { x, y } = polarToCartesian(angleAt(i, satellites.length), cfg.radius);
              return (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + x / 2}%`, top: `${50 + y / 2}%` }}
                >
                  <motion.div
                    className="flex size-9 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
                    variants={animated ? satelliteAnim : undefined}
                    custom={beamDelay(i)}
                    {...state}
                  >
                    {sat}
                  </motion.div>
                </div>
              );
            })}
          </>
        ) : (
          <div className={`absolute inset-0 ${orbitSpin}`}>
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="-100 -100 200 200"
              fill="none"
            >
              {satellites.map((_, i) => {
                const { x, y } = polarToCartesian(angleAt(i, satellites.length), cfg.radius);
                return (
                  <motion.line
                    key={i}
                    x1={0}
                    y1={0}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth={0.25}
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    className="text-muted-foreground/90"
                    variants={animated ? lineAnim : undefined}
                    custom={beamDelay(i) - 0.2}
                    {...state}
                  />
                );
              })}
            </svg>
            {satellites.map((sat, i) => {
              const { x, y } = polarToCartesian(angleAt(i, satellites.length), cfg.radius);
              return (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + x / 2}%`, top: `${50 + y / 2}%` }}
                >
                  <div className={counterSpin}>
                    <motion.div
                      className="flex size-9 items-center justify-center rounded-xl border bg-card text-foreground shadow-xs ring-2 ring-background"
                      variants={animated ? satelliteAnim : undefined}
                      custom={beamDelay(i)}
                      {...state}
                    >
                      {sat}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {logo && (
          <motion.div
            className="relative z-1 flex size-13 items-center justify-center rounded-2xl border border-primary bg-linear-to-b from-primary/60 to-primary/85 text-primary-foreground shadow-md ring-3 ring-primary/10"
            variants={animated ? logoAnim : undefined}
          >
            {logo}
          </motion.div>
        )}
        {label && (
          <motion.div
            className="absolute left-1/2 flex min-w-4 -translate-x-1/2 items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0"
            style={{ top: `calc(${50 + cfg.radius / 2}% + 32px)` }}
            variants={animated ? labelAnim : undefined}
          >
            {label}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
