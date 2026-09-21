import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  MotionConfigContext,
  cancelFrame,
  frame,
} from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";
import { LAND_MASK_BASE64 } from "./land-mask.js";

type Vec3 = { x: number; y: number; z: number };

export interface GlobeMarker {
  lat: number;
  lng: number;
  label?: string;
}

export interface GlobeProps extends VisualProps {
  markers?: GlobeMarker[];
  arcs?: boolean;
  arcPairs?: [number, number][];
  arcDrawIn?: boolean;
  arcPulse?: "spike" | "dot";
  half?: boolean;
  tilt?: "top" | "equator" | "bottom" | number;
  startAt?: "americas" | "atlantic" | "europe" | "africa" | "asia" | "oceania" | "pacific" | number;
  spinSpeed?: number;
  hover?: boolean;
  wrapperClassName?: string;
}

/** Reusable rAF loop shared by the canvas globe (mirrors the POC `useGlobeFrame`). */
function useGlobeFrame(callback: (time: number, delta: number) => void) {
  const start = useRef(0);
  const { isStatic } = useContext(MotionConfigContext);
  useEffect(() => {
    if (isStatic) return;
    const onFrame = ({ timestamp, delta: d }: { timestamp: number; delta: number }) => {
      start.current ||= timestamp;
      callback(timestamp - start.current, d);
    };
    frame.update(onFrame, true);
    return () => cancelFrame(onFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, isStatic]);
}

const TILTS = { top: 0.45, equator: 0, bottom: -0.45 };
const DEFAULT_TILT = "top";
const START_LONGITUDES = {
  americas: -90,
  atlantic: -30,
  europe: 15,
  africa: 20,
  asia: 100,
  oceania: 140,
  pacific: 180,
};
const DEFAULT_START = "atlantic";

function startRotation(startAt: Exclude<GlobeProps["startAt"], undefined>): number {
  const deg = typeof startAt === "number" ? startAt : START_LONGITUDES[startAt];
  return ((deg as number) * Math.PI) / 180 - Math.PI / 2;
}

const defaultMarkers: GlobeMarker[] = [
  { lat: 37.77, lng: -122.42 },
  { lat: 40.71, lng: -74 },
  { lat: 51.51, lng: -0.13 },
  { lat: 1.35, lng: 103.82 },
  { lat: -23.55, lng: -46.63 },
  { lat: 35.68, lng: 139.69 },
];
const defaultArcPairs: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 5],
  [0, 5],
  [1, 4],
];

const CONFIG = {
  landSampleCount: 5400,
  fill: 0.94,
  padding: 6,
  dotRadius: 1,
  dotAlphaBuckets: 12,
  spinSpeed: -12,
  arcHeight: 0.32,
  arcSamples: 54,
  arcDotSpeed: 16e-5,
  arcTravel: 0.5,
  arcSpikeLength: 0.2,
  arcSpikeSamples: 14,
  arcClipDepth: 0,
  pulseSpeed: 0.0038,
  activityEase: 220,
  arcDrawDuration: 850,
  arcStagger: 200,
  markerLimbBand: 0.2,
  labelLimbBand: 0.55,
  frameStep: 1,
} as const;

function slerp(a: Vec3, b: Vec3, t: number, omega: number, sinOmega: number): Vec3 {
  const wa = sinOmega > 1e-6 ? Math.sin((1 - t) * omega) / sinOmega : 1 - t;
  const wb = sinOmega > 1e-6 ? Math.sin(t * omega) / sinOmega : t;
  return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
}

function smoothstep(edge: number, value: number): number {
  const t = Math.max(0, Math.min(1, value / edge));
  return t * t * (3 - 2 * t);
}

function latLngToVec({ lat, lng }: { lat: number; lng: number }): Vec3 {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return {
    x: Math.cos(phi) * Math.cos(theta),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.sin(theta),
  };
}

function fibonacciSphere(count: number): Vec3[] {
  const points: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - i * i));
    const theta = golden * i;
    points.push({ x: Math.cos(theta) * radius, y: i, z: Math.sin(theta) * radius });
  }
  return points;
}

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

function isLand(p: Vec3): boolean {
  const lat = (Math.asin(Math.max(-1, Math.min(1, p.y))) * 180) / Math.PI;
  const lng = (Math.atan2(p.z, p.x) * 180) / Math.PI;
  let col = Math.floor(((lng + 180) / 360) * MASK_WIDTH);
  let row = Math.floor(((90 - lat) / 180) * MASK_HEIGHT);
  col = col < 0 ? 0 : col >= MASK_WIDTH ? 255 : col;
  row = row < 0 ? 0 : row >= MASK_HEIGHT ? 127 : row;
  const bitIndex = row * MASK_WIDTH + col;
  return ((landMask()[bitIndex >> 3]! >> (7 - (bitIndex & 7))) & 1) === 1;
}

const globeAnim = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, delay: 0.3, ease: "easeOut" },
  },
} as const;

interface ArcGeometry {
  a: Vec3;
  b: Vec3;
  omega: number;
  sinOmega: number;
  surface: Vec3[];
  lifted: Vec3[];
}

export function Globe({
  markers,
  arcs = true,
  arcPairs,
  arcDrawIn = true,
  arcPulse = "spike",
  half = false,
  tilt = DEFAULT_TILT,
  startAt = DEFAULT_START,
  spinSpeed = CONFIG.spinSpeed,
  animated = false,
  trigger = "inView",
  hover = false,
  className,
  wrapperClassName,
}: GlobeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const primaryProbeRef = useRef<HTMLSpanElement>(null);
  const cardProbeRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activityRef = useRef(0);
  const rotationRef = useRef(startRotation(startAt));
  const clockRef = useRef(0);
  const drawStartRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dirtyRef = useRef(true);
  const frameCountRef = useRef(0);
  const dotColorRef = useRef("");
  const cardColorRef = useRef("");
  const recolorRef = useRef(true);
  const drawRef = useRef<() => void>(() => {});
  const tiltAngle = typeof tilt === "number" ? (tilt * Math.PI) / 180 : TILTS[tilt];
  const startAngle = startRotation(startAt);
  const inViewOnce = useInView(rootRef, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(rootRef, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const visible = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulsing = (hover ? hovering : visible) && inViewRepeat;
  const state = animated ? { initial: "hidden", animate: visible ? "visible" : "hidden" } : {};
  const resolvedMarkers = markers ?? defaultMarkers;
  const landSamples = useMemo(() => fibonacciSphere(CONFIG.landSampleCount).filter(isLand), []);
  const markerVectors = useMemo(() => resolvedMarkers.map(latLngToVec), [resolvedMarkers]);
  const labeledMarkers = useMemo(
    () =>
      resolvedMarkers
        .map((marker, index) => ({ label: marker.label, index }))
        .filter((entry) => !!entry.label),
    [resolvedMarkers],
  );
  const pairs = useMemo(
    () => arcPairs || (markers ? markers.map((_, i) => [i, (i + 1) % markers.length] as [number, number]) : defaultArcPairs),
    [arcPairs, markers],
  );  const arcsGeometry = useMemo<ArcGeometry[]>(() => {
    return pairs.map(([from, to]) => {
      const a = markerVectors[from]!;
      const b = markerVectors[to]!;
      if (!a || !b) return null as unknown as ArcGeometry;
      const omega = Math.acos(Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z)));
      const sinOmega = Math.sin(omega);
      const surface: Vec3[] = [];
      const lifted: Vec3[] = [];
      for (let i = 0; i <= CONFIG.arcSamples; i++) {
        const t = i / CONFIG.arcSamples;
        const point = slerp(a, b, t, omega, sinOmega);
        const scale = 1 + CONFIG.arcHeight * Math.sin(Math.PI * t);
        surface.push(point);
        lifted.push({ x: point.x * scale, y: point.y * scale, z: point.z * scale });
      }
      return { a, b, omega, sinOmega, surface, lifted };
    });
  }, [markerVectors, pairs]);

  const draw = () => {
    const canvas = canvasRef.current;
    const probe = primaryProbeRef.current;
    if (!canvas || !probe) return;
    const ctx = canvas.getContext("2d");
    const { w, h } = sizeRef.current;
    if (!ctx || w === 0 || h === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(w * dpr);
    const pixelH = Math.round(h * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (recolorRef.current || !dotColorRef.current) {
      dotColorRef.current = getComputedStyle(probe).color || "rgb(99, 102, 241)";
      const cardProbe = cardProbeRef.current;
      cardColorRef.current = (cardProbe && getComputedStyle(cardProbe).color) || dotColorRef.current;
      recolorRef.current = false;
    }
    const dotColor = dotColorRef.current;
    const cardColor = cardColorRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const lift = arcs ? 1 + CONFIG.arcHeight : 1;
    const radius = ((Math.min(w, h) / 2 - CONFIG.padding) / lift) * CONFIG.fill;
    const rot = rotationRef.current;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const cosT = Math.cos(tiltAngle);
    const sinT = Math.sin(tiltAngle);
    const project = (p: Vec3) => {
      const x1 = p.x * cosR + p.z * sinR;
      const z1 = -p.x * sinR + p.z * cosR;
      const y2 = p.y * cosT - z1 * sinT;
      const z2 = p.y * sinT + z1 * cosT;
      return { sx: cx - x1 * radius, sy: cy - y2 * radius, depth: z2 };
    };
    ctx.globalAlpha = 1;
    ctx.fillStyle = cardColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dotColor;
    ctx.strokeStyle = dotColor;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    const buckets: Path2D[] = [];
    for (let i = 0; i < CONFIG.dotAlphaBuckets; i++) buckets.push(new Path2D());
    for (const p of landSamples) {
      const x1 = p.x * cosR + p.z * sinR;
      const z1 = -p.x * sinR + p.z * cosR;
      const y2 = p.y * cosT - z1 * sinT;
      const z2 = p.y * sinT + z1 * cosT;
      if (z2 <= 0) continue;
      const sx = cx - x1 * radius;
      const sy = cy - y2 * radius;
      const r = CONFIG.dotRadius * (0.45 + 0.55 * z2);
      const bucket = Math.min(CONFIG.dotAlphaBuckets - 1, (z2 * CONFIG.dotAlphaBuckets) | 0);
      buckets[bucket]!.moveTo(sx + r, sy);
      buckets[bucket]!.arc(sx, sy, r, 0, Math.PI * 2);
    }
    for (let i = 0; i < CONFIG.dotAlphaBuckets; i++) {
      ctx.globalAlpha = 0.16 + 0.5 * ((i + 0.5) / CONFIG.dotAlphaBuckets);
      ctx.fill(buckets[i]!);
    }
    if (arcs) {
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      const drawStart = drawStartRef.current;
      const clipDepth = CONFIG.arcClipDepth;
      for (let n = 0; n < arcsGeometry.length; n++) {
        const arc = arcsGeometry[n];
        if (!arc) continue;
        const progress = (drawStart - n * CONFIG.arcStagger) / CONFIG.arcDrawDuration;
        const grow = animated && arcDrawIn ? Math.max(0, Math.min(1, progress)) ** 0.6 : 1;
        ctx.globalAlpha = 0.34;
        let drawing = false;
        let lastX = 0;
        let lastY = 0;
        let lastDepth = 0;
        for (let i = 0; i <= CONFIG.arcSamples; i++) {
          const t = i / CONFIG.arcSamples;
          let surfacePoint = arc.surface[i]!;
          let liftedPoint = arc.lifted[i]!;
          const capped = t >= grow;
          if (capped) {
            surfacePoint = slerp(arc.a, arc.b, grow, arc.omega, arc.sinOmega);
            const scale = 1 + CONFIG.arcHeight * Math.sin(Math.PI * grow);
            liftedPoint = { x: surfacePoint.x * scale, y: surfacePoint.y * scale, z: surfacePoint.z * scale };
          }
          const surfaceDepth = project(surfacePoint).depth;
          const projected = project(liftedPoint);
          const visible = surfaceDepth > clipDepth;
          if (i > 0) {
            const prevVisible = lastDepth > clipDepth;
            if (prevVisible && visible) ctx.lineTo(projected.sx, projected.sy);
            else if (prevVisible !== visible) {
              const f = (clipDepth - lastDepth) / (surfaceDepth - lastDepth);
              const ix = lastX + (projected.sx - lastX) * f;
              const iy = lastY + (projected.sy - lastY) * f;
              if (prevVisible) {
                ctx.lineTo(ix, iy);
                ctx.stroke();
                drawing = false;
              } else {
                ctx.beginPath();
                ctx.moveTo(ix, iy);
                ctx.lineTo(projected.sx, projected.sy);
                drawing = true;
              }
            }
          }
          if (visible && !drawing) {
            ctx.beginPath();
            ctx.moveTo(projected.sx, projected.sy);
            drawing = true;
          }
          lastX = projected.sx;
          lastY = projected.sy;
          lastDepth = surfaceDepth;
          if (capped) break;
        }
        if (drawing) ctx.stroke();
        if (grow < 1) continue;
        const phase = (clockRef.current * CONFIG.arcDotSpeed + n / arcsGeometry.length) % 1;
        if (phase >= CONFIG.arcTravel) continue;
        const travel = phase / CONFIG.arcTravel;
        const height = Math.sin(Math.PI * travel);
        const sample = (t: number) => {
          const p = slerp(arc.a, arc.b, t, arc.omega, arc.sinOmega);
          const scale = 1 + CONFIG.arcHeight * Math.sin(Math.PI * t);
          const projected = project({ x: p.x * scale, y: p.y * scale, z: p.z * scale });
          const limb = Math.max(
            0,
            Math.min(1, (projected.depth / scale - CONFIG.arcClipDepth) / 0.18),
          );
          return { sx: projected.sx, sy: projected.sy, limb };
        };
        if (arcPulse === "spike") {
          const startT = Math.max(0, travel - CONFIG.arcSpikeLength);
          const span = travel - startT;
          if (span <= 1e-4) continue;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          let prev = sample(startT);
          for (let i = 1; i <= CONFIG.arcSpikeSamples; i++) {
            const f = i / CONFIG.arcSpikeSamples;
            const next = sample(startT + span * f);
            const alpha = height * f * Math.min(next.limb, prev.limb);
            if (alpha > 0.001) {
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(prev.sx, prev.sy);
              ctx.lineTo(next.sx, next.sy);
              ctx.stroke();
            }
            prev = next;
          }
          const head = sample(travel);
          const headAlpha = height * head.limb;
          if (headAlpha > 0.001) {
            ctx.globalAlpha = headAlpha;
            ctx.beginPath();
            ctx.arc(head.sx, head.sy, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
          continue;
        }
        const point = sample(travel);
        const alpha = height * point.limb;
        if (alpha <= 0.001) continue;
        ctx.globalAlpha = 0.22 * alpha;
        ctx.beginPath();
        ctx.arc(point.sx, point.sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(point.sx, point.sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < markerVectors.length; i++) {
      const { sx, sy, depth } = project(markerVectors[i]!);
      if (depth <= 0) continue;
      const pulse = 0.5 + 0.5 * Math.sin(clockRef.current * CONFIG.pulseSpeed + i * 1.1);
      const limb = smoothstep(CONFIG.markerLimbBand, depth);
      ctx.globalAlpha = 0.3 * (1 - pulse) * depth * limb;
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + pulse * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.min(1, 0.5 + 0.6 * depth) * limb;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.85 * depth * limb;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < labeledMarkers.length; i++) {
      const el = labelRefs.current[i];
      if (!el) continue;
      const { sx, sy, depth } = project(markerVectors[labeledMarkers[i]!.index]!);
      const fade = depth <= 0 ? 0 : smoothstep(CONFIG.labelLimbBand, depth);
      if (fade <= 0.01) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      el.style.opacity = `${fade}`;
      el.style.transform = `translate(${sx}px, ${sy - 10}px) translate(-50%, -100%)`;
    }
  };
  useEffect(() => {
    drawRef.current = draw;
  });
  useGlobeFrame((_, delta) => {
    if (!animated) return;
    activityRef.current += (+!!pulsing - activityRef.current) * Math.min(1, delta / CONFIG.activityEase);
    rotationRef.current += ((spinSpeed * Math.PI) / 180) * (delta / 1000) * activityRef.current;
    clockRef.current += delta * activityRef.current;
    if (visible) drawStartRef.current += delta;
    else drawStartRef.current = 0;
    const drawWindow =
      arcs && arcDrawIn ? pairs.length * CONFIG.arcStagger + CONFIG.arcDrawDuration : 0;
    const drawing = visible && drawStartRef.current < drawWindow + 50;
    if (activityRef.current < 0.002 && !drawing && !dirtyRef.current) return;
    frameCountRef.current += 1;
    if (dirtyRef.current || frameCountRef.current % CONFIG.frameStep === 0) {
      dirtyRef.current = false;
      drawRef.current();
    }
  });
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onResize = () => {
      sizeRef.current = { w: wrapper.clientWidth, h: wrapper.clientHeight };
      dirtyRef.current = true;
      drawRef.current();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(wrapper);
    onResize();
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      recolorRef.current = true;
      dirtyRef.current = true;
      drawRef.current();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    rotationRef.current = startAngle;
    dirtyRef.current = true;
    drawRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAngle]);
  useEffect(() => {
    dirtyRef.current = true;
    drawRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiltAngle, arcs, landSamples, markerVectors, arcsGeometry]);
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        ref={wrapperRef}
        className={cn(
          "aspect-square w-full",
          !/(?:^|\s)max-w-\S+/.test(wrapperClassName ?? "") && "max-w-90",
          half ? "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" : "relative",
          wrapperClassName,
        )}
        variants={animated ? globeAnim : undefined}
        {...state}
      >
        <motion.div
          className="absolute inset-0 -z-10"
          variants={animated ? glowAnim : undefined}
          {...state}
        >
          <motion.div
            className="absolute inset-0"
            animate={
              animated
                ? pulsing
                  ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
                  : { scale: 1, opacity: 0.9 }
                : undefined
            }
            transition={
              pulsing
                ? { duration: 5, ease: "easeInOut", repeat: 1 / 0 }
                : { duration: 0.6, ease: "easeOut" }
            }
          >
            <div className="absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_65%)] opacity-15 blur-2xl dark:opacity-20" />
            <div className="absolute top-1/2 left-1/2 size-[90%] -translate-x-1/2 translate-y-[-60%] rounded-full bg-[radial-gradient(circle,var(--color-muted),transparent_65%)] opacity-20 blur-2xl dark:opacity-15" />
          </motion.div>
        </motion.div>
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        <div className="pointer-events-none absolute inset-0">
          {labeledMarkers.map((entry, i) => (
            <div
              key={entry.index}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 rounded-md border bg-card px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-foreground shadow-xs will-change-transform"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {entry.label}
            </div>
          ))}
        </div>
      </motion.div>
      <span
        ref={primaryProbeRef}
        aria-hidden="true"
        className="pointer-events-none absolute size-0 text-primary opacity-0"
      />
      <span
        ref={cardProbeRef}
        aria-hidden="true"
        className="pointer-events-none absolute size-0 text-card opacity-0"
      />
    </div>
  );
}
