import { useId, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";
import { LAND_MASK_BASE64 } from "../globe/land-mask.js";

export interface WorldMapMarker {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  active?: boolean;
}

export interface WorldMapRegion {
  lat: [number, number];
  lng: [number, number];
  color?: string;
}

export interface WorldMapProps extends VisualProps {
  markers?: WorldMapMarker[];
  regions?: WorldMapRegion[];
  arcs?: boolean;
  arcPairs?: [number, number][];
  labels?: boolean;
  density?: "sparse" | "normal" | "dense";
  reveal?: "bloom" | "split" | "sweep";
  revealFrom?: number;
  hover?: boolean;
  wrapperClassName?: string;
}

const LAT_MAX = 78;
const LAT_MIN = -56;
const LAT_RANGE = 134;
const WIDTH = 100;
const HEIGHT = (LAT_RANGE / 360) * WIDTH;
const DENSITY = { sparse: 78, normal: 104, dense: 132 };
const DOT_SPACING = 0.3;
const ARC_LIFT = 0.32;
const BASE_DELAY = 0.1;
const REVEAL_DURATION = 1;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const SWEEP_START = 0.7;
const SWEEP_WIDTH = 0.8;
const SPLIT_SOFTNESS = 0.19999999999999996 / 2;
const MARKER_DELAY_PAD = 0.18;
const GLOW_DELAY_PAD = 0.23;
const LABEL_DELAY_PAD = 0.42;
const ARC_DELAY_PAD = 0.16;
const ARC_DRAW_DURATION = 0.7;
const TAIL_PAD = 0.35;
const ARC_DASH = "0.14 0.86";
const ARC_DASH_DURATION = 2.8;
const ARC_DASH_STAGGER = 0.45;
const PING_DURATION = 2.2;
const PING_STAGGER = 0.22;
const PING_DELAYS = [0, 1.1];
const LABEL_HALF_WIDTH = 0.895;
const LABEL_ACTIVE_WIDTH = 1.255;
const LABEL_CHAR = 1.79 * 0.56;
const LABEL_PADDING = 1.79 * 1.4;
const LABEL_HEIGHT = 1.79 * 1.8;
const LABEL_GAP = 0.7;
const SLOT_OFFSETS = [0, -1, 1, -2, 2, -3];
const SPLIT_SLOTS = 2;
const LABEL_MAX_DIST = 11.765999999999998;
const DEFAULT_DENSITY = "normal";
const DEFAULT_REVEAL = "bloom";

const defaultMarkers: WorldMapMarker[] = [
  { lat: 37.77, lng: -122.42, label: "San Francisco" },
  { lat: 40.71, lng: -74, label: "New York" },
  { lat: 51.51, lng: -0.13, label: "London" },
  { lat: -23.55, lng: -46.63, label: "Sao Paulo" },
  { lat: 1.35, lng: 103.82, label: "Singapore" },
  { lat: 35.68, lng: 139.69, label: "Tokyo" },
  { lat: -33.87, lng: 151.21, label: "Sydney" },
];
const defaultArcPairs: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [4, 5],
  [4, 6],
];

const MASK_WIDTH = 256;
const MASK_HEIGHT = 128;
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
let decodedMask: Uint8Array | null = null;

function landMask(): Uint8Array {
  if (decodedMask) return decodedMask;
  const body = LAND_MASK_BASE64.replace(/=+$/, "");
  const bytes = new Uint8Array((body.length * 3) >> 2);
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (let i = 0; i < body.length; i++) {
    buffer = (buffer << 6) | BASE64_CHARS.indexOf(body[i]!);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[index++] = (buffer >> bits) & 255;
    }
  }
  decodedMask = bytes;
  return bytes;
}

function isLand(lat: number, lng: number): boolean {
  let col = Math.floor(((lng + 180) / 360) * MASK_WIDTH);
  let row = Math.floor(((90 - lat) / 180) * MASK_HEIGHT);
  col = col < 0 ? 0 : col >= MASK_WIDTH ? 255 : col;
  row = row < 0 ? 0 : row >= MASK_HEIGHT ? 127 : row;
  const bitIndex = row * MASK_WIDTH + col;
  return ((landMask()[bitIndex >> 3]! >> (7 - (bitIndex & 7))) & 1) === 1;
}

interface Dot {
  x: number;
  y: number;
}

function project(lat: number, lng: number): Dot {
  const clamped = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  return {
    x: ((Math.max(-180, Math.min(180, lng)) + 180) / 360) * WIDTH,
    y: ((LAT_MAX - clamped) / LAT_RANGE) * HEIGHT,
  };
}

function regionIndex(lat: number, lng: number, regions: readonly WorldMapRegion[]): number {
  return regions.findIndex(
    (region) => lat >= region.lat[0] && lat <= region.lat[1] && lng >= region.lng[0] && lng <= region.lng[1],
  );
}

function dotsPath(points: readonly Dot[], spacing: number): string {
  const r = spacing.toFixed(2);
  const d = (spacing * 2).toFixed(2);
  return points
    .map(
      (p) =>
        `M${(p.x - spacing).toFixed(2)} ${p.y.toFixed(2)}a${r} ${r} 0 1 0 ${d} 0a${r} ${r} 0 1 0 -${d} 0`,
    )
    .join("");
}

function arcPath(a: Dot, b: Dot): string {
  const lift = Math.hypot(b.x - a.x, b.y - a.y) * ARC_LIFT;
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2 - lift;
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

function maxDistance(center: Dot): number {
  return Math.max(
    Math.hypot(center.x, center.y),
    Math.hypot(WIDTH - center.x, center.y),
    Math.hypot(center.x, HEIGHT - center.y),
    Math.hypot(WIDTH - center.x, HEIGHT - center.y),
  );
}

function revealProgress(
  point: Dot,
  reveal: WorldMapProps["reveal"],
  center: Dot,
  maxDist: number,
): number {
  if (reveal === "sweep") return SWEEP_WIDTH * (point.x / WIDTH) + 0.19999999999999996;
  if (reveal === "split") return Math.abs(point.x - WIDTH / 2) / (WIDTH / 2);
  if (maxDist <= 0) return 0;
  return Math.hypot(point.x - center.x, point.y - center.y) / maxDist;
}

function revealEase(value: number): number {
  return 1 - Math.sqrt(1 - Math.min(1, Math.max(0, value)));
}

function anchorFor(x: number): number {
  return x > 80 ? 1 : x < 20 ? 0 : 0.5;
}

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Slot {
  x: number;
  y: number;
  anchor: number;
}

function markerBox(point: Dot, half: number): Box {
  return { x0: point.x - half, x1: point.x + half, y0: point.y - half, y1: point.y + half };
}

function slotBox(slot: Slot, width: number): Box {
  const x0 = slot.x - slot.anchor * width;
  return { x0, x1: x0 + width, y0: slot.y - LABEL_HEIGHT, y1: slot.y };
}

function labelSlots(point: Dot, size: number): Slot[] {
  const stepY = 3.9219999999999997;
  const gap = size + LABEL_GAP;
  const anchor = anchorFor(point.x);
  const belowY = point.y + LABEL_HEIGHT / 2;
  const verticals = SLOT_OFFSETS.map((offset) => ({
    x: point.x,
    y: offset >= 0 ? point.y - gap - offset * stepY : point.y + gap + LABEL_HEIGHT + (-offset - 1) * stepY,
    anchor,
  }));
  return [
    ...verticals.slice(0, SPLIT_SLOTS),
    { x: point.x + gap, y: belowY, anchor: 0 },
    { x: point.x - gap, y: belowY, anchor: 1 },
    ...verticals.slice(SPLIT_SLOTS),
  ];
}

function boxDistance(box: Box, point: Dot): number {
  return Math.hypot((box.x0 + box.x1) / 2 - point.x, (box.y0 + box.y1) / 2 - point.y);
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

function boxOutOfBounds(box: Box): boolean {
  return box.x0 < 0 || box.x1 > WIDTH || box.y0 < 0 || box.y1 > HEIGHT;
}

function slotIsValid(box: Box, point: Dot, taken: readonly Box[]): boolean {
  return (
    boxDistance(box, point) <= LABEL_MAX_DIST &&
    !boxOutOfBounds(box) &&
    taken.every((other) => !boxesOverlap(box, other))
  );
}

function labelOrder(markers: readonly WorldMapMarker[], points: readonly Dot[]): number[] {
  return markers
    .map((_, i) => i)
    .sort((a, b) => +!!markers[b]!.active - +!!markers[a]!.active || points[a]!.y - points[b]!.y);
}

function placeLabels(markers: readonly WorldMapMarker[], points: readonly Dot[]): (Slot | null)[] {
  const taken = markers.map((marker, i) => markerBox(points[i]!, marker.active ? LABEL_ACTIVE_WIDTH : LABEL_HALF_WIDTH));
  const slots = markers.map(() => null as Slot | null);
  for (const i of labelOrder(markers, points)) {
    const marker = markers[i]!;
    if (!marker.label) continue;
    const size = marker.active ? LABEL_ACTIVE_WIDTH : LABEL_HALF_WIDTH;
    const width = marker.label.length * LABEL_CHAR + LABEL_PADDING;
    for (const slot of labelSlots(points[i]!, size)) {
      const box = slotBox(slot, width);
      if (slotIsValid(box, points[i]!, taken)) {
        taken.push(box);
        slots[i] = slot;
        break;
      }
    }
  }
  return slots;
}

const containerAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const bloomMaskAnim = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: REVEAL_DURATION, delay: BASE_DELAY, ease: easeOutQuad } },
} as const;

const sweepMaskAnim: Variants = {
  hidden: (width: number) => ({ x: -width }),
  visible: { x: 0, transition: { duration: REVEAL_DURATION, delay: BASE_DELAY, ease: easeOutQuad } },
};

const splitMaskAnim = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: REVEAL_DURATION, delay: BASE_DELAY, ease: easeOutQuad } },
} as const;

const arcAnim: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: ARC_DRAW_DURATION, delay, ease: "easeInOut" },
      opacity: { duration: 0.2, delay },
    },
  }),
};

const dotAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 480, damping: 16, delay },
  }),
};

const glowAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut", delay },
  }),
};

const labelAnim: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut", delay },
  }),
};

export function WorldMap({
  markers = defaultMarkers,
  regions = [],
  arcs = true,
  arcPairs = defaultArcPairs,
  labels = false,
  density = DEFAULT_DENSITY,
  reveal = DEFAULT_REVEAL,
  revealFrom = 0,
  animated = false,
  trigger = "inView",
  hover = false,
  fill = false,
  className,
  wrapperClassName,
}: WorldMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const reactId = useId();
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pinging = hover ? hovering : triggered;
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const { landPath, regionPaths } = useMemo(() => {
    const cols = DENSITY[density];
    const rows = Math.round((HEIGHT / WIDTH) * cols);
    const spacing = (WIDTH / cols) * DOT_SPACING;
    const land: Dot[] = [];
    const regionDots = regions.map(() => [] as Dot[]);
    for (let row = 0; row < rows; row++) {
      const lat = LAT_MAX - ((row + 0.5) / rows) * LAT_RANGE;
      for (let col = 0; col < cols; col++) {
        const lng = -180 + ((col + 0.5) / cols) * 360;
        if (!isLand(lat, lng)) continue;
        const dot = { x: ((col + 0.5) / cols) * WIDTH, y: ((row + 0.5) / rows) * HEIGHT };
        const region = regionIndex(lat, lng, regions);
        if (region === -1) land.push(dot);
        else regionDots[region]!.push(dot);
      }
    }
    return { landPath: dotsPath(land, spacing), regionPaths: regionDots.map((dots) => dotsPath(dots, spacing)) };
  }, [density, regions]);
  const points = useMemo(() => markers.map((marker) => project(marker.lat, marker.lng)), [markers]);
  const revealCenter = useMemo(() => points[revealFrom] ?? { x: WIDTH / 2, y: HEIGHT / 2 }, [points, revealFrom]);
  const maxDist = useMemo(() => maxDistance(revealCenter), [revealCenter]);
  const markerDelays = useMemo(
    () => points.map((point) => BASE_DELAY + revealEase(revealProgress(point, reveal, revealCenter, maxDist)) * REVEAL_DURATION + MARKER_DELAY_PAD),
    [points, reveal, revealCenter, maxDist],
  );
  const arcsList = useMemo(
    () =>
      arcPairs
        .filter(([a, b]) => points[a] && points[b])
        .map(([a, b]) => ({
          d: arcPath(points[a]!, points[b]!),
          delay: Math.max(markerDelays[a]!, markerDelays[b]!) + ARC_DELAY_PAD,
        })),
    [arcPairs, points, markerDelays],
  );
  const labelSlotsByMarker = useMemo(() => placeLabels(markers, points), [markers, points]);
  const markerDoneAt = (markerDelays.length ? Math.max(...markerDelays) : 0) + TAIL_PAD;
  const arcsDoneAt = arcsList.length
    ? Math.max(...arcsList.map((arc) => arc.delay)) + ARC_DRAW_DURATION + TAIL_PAD
    : markerDoneAt;
  const bloomRadius = maxDist / SWEEP_START;
  const sweepWidth = WIDTH / SWEEP_WIDTH;
  const maskId = `world-map-reveal-${reactId}`;
  const fadeId = `world-map-reveal-fade-${reactId}`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className={cn(
          "@container relative aspect-180/67 w-full",
          !/(?:^|\s)max-w-\S+/.test(wrapperClassName ?? "") && "max-w-140",
          wrapperClassName,
        )}
        variants={animated ? containerAnim : undefined}
        {...state}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 size-full">
          {animated && (
            <defs>
              {reveal === "bloom" && (
                <radialGradient id={fadeId}>
                  <stop offset={SWEEP_START} stopColor="white" />
                  <stop offset={1} stopColor="black" />
                </radialGradient>
              )}
              {reveal === "split" && (
                <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset={0} stopColor="black" />
                  <stop offset={SPLIT_SOFTNESS} stopColor="white" />
                  <stop offset={0.9} stopColor="white" />
                  <stop offset={1} stopColor="black" />
                </linearGradient>
              )}
              {reveal === "sweep" && (
                <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset={SWEEP_WIDTH} stopColor="white" />
                  <stop offset={1} stopColor="black" />
                </linearGradient>
              )}
              <mask id={maskId}>
                {reveal === "bloom" && (
                  <motion.circle
                    cx={revealCenter.x}
                    cy={revealCenter.y}
                    r={bloomRadius}
                    fill={`url(#${fadeId})`}
                    variants={bloomMaskAnim}
                    {...state}
                  />
                )}
                {reveal === "split" && (
                  <motion.g variants={splitMaskAnim} {...state}>
                    <rect
                      x={-25 / 2}
                      width={sweepWidth}
                      height={HEIGHT}
                      fill={`url(#${fadeId})`}
                    />
                  </motion.g>
                )}
                {reveal === "sweep" && (
                  <motion.rect
                    width={sweepWidth}
                    height={HEIGHT}
                    fill={`url(#${fadeId})`}
                    custom={sweepWidth}
                    variants={sweepMaskAnim}
                    {...state}
                  />
                )}
              </mask>
            </defs>
          )}
          <g mask={animated ? `url(#${maskId})` : undefined}>
            <path d={landPath} className="fill-muted-foreground/30" />
            {regionPaths.map((path, i) => (
              <path
                key={i}
                d={path}
                className={cn("fill-current", regions[i]?.color ?? "text-primary")}
              />
            ))}
          </g>
        </svg>
        {arcs && arcsList.length > 0 && (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            fill="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            {arcsList.map((arc, i) => (
              <motion.path
                key={i}
                d={arc.d}
                fill="none"
                strokeWidth={0.22}
                strokeLinecap="round"
                className="stroke-primary/30"
                custom={arc.delay}
                variants={animated ? arcAnim : undefined}
                {...state}
              />
            ))}
            {animated && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: +!!pinging }}
                transition={{ duration: 0.5, ease: "easeOut", delay: pinging && !hover ? arcsDoneAt : 0 }}
              >
                {arcsList.map((arc, i) => (
                  <path
                    key={i}
                    d={arc.d}
                    fill="none"
                    pathLength={1}
                    strokeDasharray={ARC_DASH}
                    strokeWidth={0.34}
                    strokeLinecap="round"
                    className="stroke-primary"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="1;0"
                      dur={`${ARC_DASH_DURATION}s`}
                      repeatCount="indefinite"
                      begin={`${-(i * ARC_DASH_STAGGER)}s`}
                    />
                  </path>
                ))}
              </motion.g>
            )}
          </svg>
        )}
        {markers.map((marker, i) => (
          <div
            key={i}
            className={cn("absolute", marker.color ?? "text-primary")}
            style={{
              left: `${(points[i]!.x / WIDTH) * 100}%`,
              top: `${(points[i]!.y / HEIGHT) * 100}%`,
            }}
          >
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                className={cn(
                  "block rounded-full bg-current/25 blur-[2.14cqw]",
                  marker.active ? "size-[6.43cqw]" : "size-[3.57cqw]",
                )}
                custom={markerDelays[i]! + GLOW_DELAY_PAD}
                variants={animated ? glowAnim : undefined}
                {...state}
              />
            </div>
            {animated && (
              <div
                className={cn(
                  "absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                  marker.active ? "size-[2.86cqw]" : "size-[2.14cqw]",
                )}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: +!!pinging }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: pinging && !hover ? markerDoneAt : 0 }}
                >
                  {PING_DELAYS.map((delay, p) => (
                    <motion.span
                      key={p}
                      className="absolute inset-0 rounded-full border-[max(1px,0.18cqw)] border-current"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: [0.5, 0.8, 2.6], opacity: [0, 0.45, 0] }}
                      transition={{
                        duration: PING_DURATION,
                        ease: "easeOut",
                        repeat: 1 / 0,
                        delay: i * PING_STAGGER + delay,
                        times: [0, 0.12, 1],
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            )}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                className={cn(
                  "block rounded-full bg-current ring-[max(1px,0.36cqw)] ring-background",
                  marker.active ? "size-[1.79cqw]" : "size-[1.07cqw]",
                )}
                custom={markerDelays[i]!}
                variants={animated ? dotAnim : undefined}
                {...state}
              />
            </div>
          </div>
        ))}
        {labels &&
          markers.map((marker, i) => {
            const slot = labelSlotsByMarker[i];
            if (!slot) return null;
            return (
              <div
                key={i}
                className="absolute z-10 @max-md:hidden"
                style={{
                  left: `${(slot.x / WIDTH) * 100}%`,
                  bottom: `${100 - (slot.y / HEIGHT) * 100}%`,
                }}
              >
                <div style={{ transform: `translateX(${-slot.anchor * 100}%)` }}>
                  <motion.div
                    custom={markerDelays[i]! + LABEL_DELAY_PAD}
                    variants={animated ? labelAnim : undefined}
                    {...state}
                  >
                    <div className="rounded-[0.6em] border-[max(1px,0.18cqw)] bg-card px-[0.6em] py-[0.2em] text-[1.79cqw] leading-[1.2] font-medium whitespace-nowrap text-foreground shadow-xs">
                      {marker.label}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
      </motion.div>
    </div>
  );
}
