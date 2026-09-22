import { useRef, useState, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  Calendar,
  Camera,
  Cloud,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Music,
} from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

const DOCK_PER_SIDE = 4;
const DOCK_STAGGER = 0.08;
const DOCK_DELAY = 0.15;
const FLY_DISTANCE = 140;
const HERO_SPRING_DELAY = 0.61;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

const DOCK_SIZES = ["size-10", "size-11", "size-12", "size-14"];

const DOCK_TILE =
  "relative flex shrink-0 items-center justify-center rounded-[0.9rem] bg-card/90 shadow-xs ring-1 ring-border";

const HERO_TILE =
  "relative z-10 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-primary text-primary-foreground shadow-xl ring-1 shadow-primary/20 ring-black/5 dark:ring-white/10";

const defaultLogo = (
  <svg viewBox="0 0 24 24" className="size-9 text-primary-foreground" fill="currentColor">
    <circle cx={12} cy={12} r={1.5} />
    {[0, 90, 180, 270].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <circle
          key={`i${deg}`}
          cx={12 + Math.cos(rad) * 4.5}
          cy={12 + Math.sin(rad) * 4.5}
          r={1.1}
        />
      );
    })}
    {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return (
        <circle
          key={`o${deg}`}
          cx={12 + Math.cos(rad) * 8.5}
          cy={12 + Math.sin(rad) * 8.5}
          r={0.9}
        />
      );
    })}
  </svg>
);

const PARTICLES = [
  { x: 26.25, y: 49.96, size: 3, color: "bg-chart-2", duration: 4.82, delay: -5.22, driftX: 4.87, driftY: 14.97, opacity: 0.6 },
  { x: 63.69, y: 60.66, size: 3, color: "bg-chart-1", duration: 6.16, delay: -2.68, driftX: 2.11, driftY: 12.52, opacity: 0.63 },
  { x: 52.56, y: 30.75, size: 3, color: "bg-chart-2", duration: 6.41, delay: -1.19, driftX: -2.04, driftY: 16.24, opacity: 0.48 },
  { x: 61.79, y: 50.16, size: 2, color: "bg-chart-3", duration: 4.09, delay: -3.47, driftX: 7.93, driftY: 13.39, opacity: 0.65 },
  { x: 50.59, y: 67.29, size: 2, color: "bg-chart-4", duration: 4.41, delay: -5.43, driftX: 7.64, driftY: 15.95, opacity: 0.63 },
  { x: 85.31, y: 52.45, size: 3, color: "bg-primary", duration: 4.22, delay: -1.23, driftX: 3.05, driftY: 14.75, opacity: 0.45 },
  { x: 76.54, y: 57.29, size: 2, color: "bg-chart-1", duration: 4.72, delay: -5.81, driftX: -5.22, driftY: 9.62, opacity: 0.63 },
  { x: 65.79, y: 51.31, size: 3, color: "bg-chart-4", duration: 7.66, delay: -5.45, driftX: 6.82, driftY: 13.1, opacity: 0.57 },
  { x: 80.61, y: 61.63, size: 3, color: "bg-primary", duration: 5.43, delay: -2.72, driftX: 1.28, driftY: 10, opacity: 0.65 },
  { x: 59.48, y: 26, size: 3, color: "bg-chart-3", duration: 4.75, delay: -1.01, driftX: 5.27, driftY: 8.7, opacity: 0.41 },
  { x: 53.4, y: 66.65, size: 3, color: "bg-primary", duration: 4.94, delay: -5.65, driftX: -4.64, driftY: 13.44, opacity: 0.66 },
  { x: 36.84, y: 49.8, size: 4, color: "bg-chart-4", duration: 4.69, delay: -2.39, driftX: -2.07, driftY: 15.9, opacity: 0.42 },
  { x: 78.87, y: 60.08, size: 3, color: "bg-chart-3", duration: 6.13, delay: -5.07, driftX: -2.6, driftY: 7.3, opacity: 0.83 },
  { x: 28.13, y: 38.14, size: 2, color: "bg-primary", duration: 6.39, delay: -5.57, driftX: -0.33, driftY: 9.13, opacity: 0.57 },
  { x: 66.59, y: 17.26, size: 3, color: "bg-chart-4", duration: 7.31, delay: -5.08, driftX: -4.42, driftY: 14.91, opacity: 0.64 },
  { x: 33.78, y: 52.03, size: 3, color: "bg-chart-4", duration: 5.23, delay: -2.49, driftX: -3.29, driftY: 7.84, opacity: 0.5 },
  { x: 21.54, y: 22.79, size: 2, color: "bg-primary", duration: 4.29, delay: -5.83, driftX: 1.4, driftY: 15.41, opacity: 0.63 },
  { x: 80.13, y: 50.12, size: 3, color: "bg-chart-2", duration: 5.95, delay: -2.63, driftX: -3.52, driftY: 11.93, opacity: 0.5 },
  { x: 36.24, y: 79.02, size: 3, color: "bg-chart-2", duration: 4.7, delay: -2.21, driftX: 3.87, driftY: 14.06, opacity: 0.67 },
  { x: 57.91, y: 49.85, size: 4, color: "bg-chart-2", duration: 4.44, delay: -3.78, driftX: 5.73, driftY: 6.62, opacity: 0.8 },
];

const dockIconClass = "size-1/3 text-muted-foreground/40";

const dockIcons = [
  <Camera key="camera" className={dockIconClass} strokeWidth={1.5} />,
  <Music key="music" className={dockIconClass} strokeWidth={1.5} />,
  <MessageCircle key="message-circle" className={dockIconClass} strokeWidth={1.5} />,
  <Calendar key="calendar" className={dockIconClass} strokeWidth={1.5} />,
  <MapPin key="map-pin" className={dockIconClass} strokeWidth={1.5} />,
  <Cloud key="cloud" className={dockIconClass} strokeWidth={1.5} />,
  <ImageIcon key="image" className={dockIconClass} strokeWidth={1.5} />,
  <Mail key="mail" className={dockIconClass} strokeWidth={1.5} />,
];

const scene = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const glowWrap = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" },
  },
} as const;

const particlesWrap = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: PARTICLES_DELAY, ease: "easeOut" },
  },
} as const;

const dockBase = {
  hidden: { opacity: 0, scaleX: 0, y: 12 },
  visible: {
    opacity: 1,
    scaleX: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
} as const;

const dockItem: Variants = {
  hidden: ({ dir }: { dir: number }) => ({ x: dir * FLY_DISTANCE, opacity: 0, scale: 0.8 }),
  visible: ({ delay }: { delay: number }) => ({
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 26, delay },
  }),
};

const hero = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay: HERO_SPRING_DELAY },
  },
} as const;

/** Ambient background glows behind the spotlight. */
function Glow(): ReactNode {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-60 translate-x-[-58%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-25 blur-2xl dark:opacity-30" />
      <div className="absolute top-1/2 left-1/2 size-60 translate-x-[-38%] translate-y-[-46%] rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-25 blur-2xl dark:opacity-30" />
      <div className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 translate-y-[-64%] rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_66%)] opacity-20 blur-2xl dark:opacity-25" />
      <div className="absolute top-1/2 left-1/2 size-48 -translate-x-1/2 translate-y-[-34%] rounded-full bg-[radial-gradient(circle,var(--color-chart-3),transparent_66%)] opacity-15 blur-2xl dark:opacity-20" />
    </>
  );
}

export interface SpotlightProps extends VisualProps {
  logo?: ReactNode;
  image?: string;
  iconClassName?: string;
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
}

export function Spotlight({
  logo,
  image,
  iconClassName,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  fill = false,
  className,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const logoEl = logo ?? defaultLogo;
  // the POC merges classes with twMerge: an icon bg-* override drops bg-primary
  const bgOverride = !!iconClassName && iconClassName.split(/\s+/).some((cls) => cls.startsWith("bg-"));
  const heroTile = bgOverride ? HERO_TILE.replace(/\s*\bbg-primary\b/, "") : HERO_TILE;

  if (!animated) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          frameClasses(fill),
          className,
        )}
      >
        <div className={cn("relative flex h-full w-full", !fill && "max-w-140", "items-center justify-center mask-r-from-75% mask-l-from-75%")}>
          {glow && (
            <div className="absolute inset-x-0 top-1/6 bottom-0">
              <Glow />
            </div>
          )}
          {particles && (
            <div className="absolute inset-x-0 inset-y-10">
              {PARTICLES.map((particle, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                >
                  <div
                    className={`rotate-45 rounded-[1px] ${particle.color}`}
                    style={{
                      width: particle.size,
                      height: particle.size,
                      opacity: particle.opacity * 0.7,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="relative z-10 flex h-44 items-end justify-center gap-2.5 pb-4">
            <div className="absolute -inset-x-3 bottom-0 h-10 rounded-3xl bg-card/90 shadow-xs ring ring-muted-foreground/5 backdrop-blur-md" />
            {Array.from({ length: DOCK_PER_SIDE }).map((_, i) => (
              <div key={`l${i}`} className={cn(DOCK_SIZES[i], DOCK_TILE)}>
                {dockIcons[i]}
              </div>
            ))}
            <div className={cn(heroTile, !image && iconClassName)}>
              {image && (
                <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
              )}
              <div className="pointer-events-none absolute inset-x-0 top-px bottom-px rounded-[1.35rem] bg-linear-to-b from-white/25 via-transparent to-transparent" />
              {!image && <div className="relative">{logoEl}</div>}
            </div>
            {Array.from({ length: DOCK_PER_SIDE }).map((_, i) => (
              <div key={`r${i}`} className={cn(DOCK_SIZES[3 - i], DOCK_TILE)}>
                {dockIcons[DOCK_PER_SIDE + i]}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const inView =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = hover ? hovered : inView;
  const state = { initial: "hidden", animate: inView ? "visible" : "hidden" };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
    >
      <motion.div
        className={cn("relative flex h-full w-full", !fill && "max-w-140", "items-center justify-center mask-r-from-75% mask-l-from-75%")}
        variants={scene}
        {...state}
      >
        {glow && (
          <motion.div
            className="absolute inset-x-0 top-1/6 bottom-0"
            variants={glowWrap}
            {...state}
          >
            <motion.div
              className="absolute inset-0"
              animate={
                active ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.85 }
              }
              transition={
                active
                  ? { duration: 4.5, ease: "easeInOut", repeat: Infinity }
                  : { duration: 0.6, ease: "easeOut" }
              }
            >
              <Glow />
            </motion.div>
          </motion.div>
        )}
        {particles && (
          <motion.div
            className="absolute inset-x-0 inset-y-10"
            variants={particlesWrap}
            {...state}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: +!!active }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {PARTICLES.map((particle, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                >
                  <motion.div
                    animate={
                      inView
                        ? {
                            x: [0, particle.driftX, 0],
                            y: [0, -particle.driftY, 0],
                            opacity: [particle.opacity * 0.5, particle.opacity, particle.opacity * 0.5],
                          }
                        : { x: 0, y: 0, opacity: 0 }
                    }
                    transition={
                      inView
                        ? {
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }
                        : { duration: 0.3 }
                    }
                  >
                    <div
                      className={`rotate-45 rounded-[1px] ${particle.color}`}
                      style={{ width: particle.size, height: particle.size }}
                    />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
        <div className="relative z-10 flex h-44 items-end justify-center gap-2.5 pb-4">
          <motion.div
            className="absolute -inset-x-3 bottom-0 h-10 rounded-3xl bg-card/90 shadow-xs ring ring-muted-foreground/5 backdrop-blur-md"
            variants={dockBase}
            {...state}
          />
          {Array.from({ length: DOCK_PER_SIDE }).map((_, i) => (
            <motion.div
              key={`l${i}`}
              className={cn(DOCK_SIZES[i], DOCK_TILE, "will-change-transform")}
              variants={dockItem}
              custom={{ dir: -1, delay: DOCK_DELAY + i * DOCK_STAGGER }}
              {...state}
            >
              {dockIcons[i]}
            </motion.div>
          ))}
          <motion.div
            className={cn(heroTile, "will-change-transform", !image && iconClassName)}
            variants={hero}
            {...state}
          >
            {image && (
              <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-px bottom-px rounded-[1.35rem] bg-linear-to-b from-white/25 via-transparent to-transparent" />
            {!image && <div className="relative">{logoEl}</div>}
          </motion.div>
          {Array.from({ length: DOCK_PER_SIDE }).map((_, i) => (
            <motion.div
              key={`r${i}`}
              className={cn(DOCK_SIZES[3 - i], DOCK_TILE, "will-change-transform")}
              variants={dockItem}
              custom={{ dir: 1, delay: DOCK_DELAY + (3 - i) * DOCK_STAGGER }}
              {...state}
            >
              {dockIcons[DOCK_PER_SIDE + i]}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
