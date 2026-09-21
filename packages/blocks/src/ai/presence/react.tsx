import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Bot } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export const presenceDefaultCopy = {
  collaborators: [
    { name: "You", kind: "user", color: "text-primary", initials: "JC" },
    { name: "Research Agent", kind: "agent", color: "text-purple-600 dark:text-purple-500" },
    { name: "Coding Agent", kind: "agent", color: "text-sky-600 dark:text-sky-500" },
    { name: "Review Agent", kind: "agent", color: "text-pink-600 dark:text-pink-500" },
  ],
} as const;

interface CursorPath {
  points: { x: number; y: number }[];
  duration: number;
}

const CURSOR_PATHS: CursorPath[] = [
  { points: [{ x: 30, y: 58 }, { x: 48, y: 40 }, { x: 40, y: 66 }, { x: 22, y: 52 }, { x: 30, y: 58 }], duration: 16 },
  { points: [{ x: 56, y: 26 }, { x: 62, y: 50 }, { x: 50, y: 60 }, { x: 60, y: 32 }, { x: 56, y: 26 }], duration: 19 },
  { points: [{ x: 18, y: 24 }, { x: 34, y: 44 }, { x: 22, y: 58 }, { x: 12, y: 36 }, { x: 18, y: 24 }], duration: 21 },
  { points: [{ x: 58, y: 62 }, { x: 63, y: 38 }, { x: 52, y: 28 }, { x: 46, y: 54 }, { x: 58, y: 62 }], duration: 18 },
  { points: [{ x: 42, y: 18 }, { x: 54, y: 34 }, { x: 38, y: 46 }, { x: 30, y: 26 }, { x: 42, y: 18 }], duration: 20 },
];

const CURSOR_LOOP_DELAY = 0.6;
const GLOW_DELAY = 0.3;
const GLOW_DURATION = 1.2;
const PARTICLES_DELAY = 1.02;

const AGENT_COLORS = [
  "text-purple-600 dark:text-purple-500",
  "text-sky-600 dark:text-sky-500",
  "text-pink-600 dark:text-pink-500",
  "text-green-600 dark:text-green-500",
  "text-rose-600 dark:text-rose-500",
];

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  opacity: number;
}

const PARTICLES: Particle[] = [
  { x: 14.2, y: 24.6, size: 3, color: "bg-primary", duration: 4.82, delay: -5.22, driftX: 4.87, driftY: 14.97, opacity: 0.6 },
  { x: 86.7, y: 32.1, size: 3, color: "bg-chart-1", duration: 6.16, delay: -2.68, driftX: -3.11, driftY: 12.52, opacity: 0.6 },
  { x: 24.1, y: 72.3, size: 2, color: "bg-chart-2", duration: 6.41, delay: -1.19, driftX: -2.04, driftY: 16.24, opacity: 0.48 },
  { x: 78.6, y: 66.2, size: 3, color: "bg-chart-3", duration: 4.09, delay: -3.47, driftX: 5.93, driftY: 13.39, opacity: 0.62 },
  { x: 8.8, y: 54.5, size: 2, color: "bg-chart-4", duration: 4.41, delay: -5.43, driftX: 6.64, driftY: 15.95, opacity: 0.52 },
  { x: 91.2, y: 54.4, size: 3, color: "bg-primary", duration: 4.22, delay: -1.23, driftX: -3.05, driftY: 14.75, opacity: 0.45 },
  { x: 18.3, y: 16.2, size: 2, color: "bg-chart-1", duration: 4.72, delay: -5.81, driftX: 4.22, driftY: 9.62, opacity: 0.5 },
  { x: 72.5, y: 20.7, size: 3, color: "bg-chart-4", duration: 7.66, delay: -5.45, driftX: 6.82, driftY: 13.1, opacity: 0.55 },
  { x: 32.6, y: 82.6, size: 3, color: "bg-primary", duration: 5.43, delay: -2.72, driftX: -2.28, driftY: 10, opacity: 0.6 },
  { x: 65.4, y: 80.3, size: 2, color: "bg-chart-3", duration: 4.75, delay: -1.01, driftX: 5.27, driftY: 8.7, opacity: 0.5 },
  { x: 6.9, y: 40.4, size: 3, color: "bg-primary", duration: 4.94, delay: -5.65, driftX: 4.64, driftY: 13.44, opacity: 0.46 },
  { x: 93.3, y: 42.8, size: 2, color: "bg-chart-2", duration: 4.69, delay: -2.39, driftX: -3.07, driftY: 15.9, opacity: 0.5 },
  { x: 46.5, y: 10.6, size: 3, color: "bg-chart-4", duration: 6.13, delay: -5.07, driftX: -2.6, driftY: 9.3, opacity: 0.5 },
  { x: 53.2, y: 90.1, size: 2, color: "bg-primary", duration: 6.39, delay: -5.57, driftX: 1.33, driftY: 9.13, opacity: 0.52 },
  { x: 38.8, y: 86.9, size: 3, color: "bg-chart-1", duration: 7.31, delay: -5.08, driftX: -4.42, driftY: 14.91, opacity: 0.5 },
  { x: 84.1, y: 86.4, size: 2, color: "bg-chart-4", duration: 5.23, delay: -2.49, driftX: 3.29, driftY: 7.84, opacity: 0.48 },
];

const glowVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: "easeOut" } },
} as const;

const particlesVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: PARTICLES_DELAY, ease: "easeOut" } },
} as const;

const chip: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.3 + i * 0.14 },
  }),
};

const windowAnim: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1 + i * 0.1, ease: "easeOut" },
  }),
};

const WINDOWS = [{ lines: 3 }, { lines: 4 }, { lines: 2 }];
const LINE_WIDTHS = ["w-full", "w-3/4", "w-5/6", "w-2/3"];

function GlowScene() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_68%)] opacity-20 blur-3xl dark:opacity-25" />
      <div className="absolute top-1/3 left-1/4 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-1),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
      <div className="absolute top-2/3 left-3/4 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-chart-2),transparent_68%)] opacity-15 blur-3xl dark:opacity-20" />
    </>
  );
}

function CursorArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 drop-shadow-sm" fill="none">
      <path
        d="m4 4 7.07 17 2.51-7.39L21 11.06z"
        fill="currentColor"
        stroke="var(--color-background)"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Collaborator {
  name: string;
  kind?: "user" | "agent";
  color?: string;
  initials?: string;
  avatar?: string;
}

function CursorChip({ collaborator }: { collaborator: Collaborator }) {
  const isUser = collaborator.kind === "user";
  return (
    <div className="relative inline-flex items-center gap-1 overflow-hidden rounded-full rounded-tl-none bg-current py-1 pr-2 pl-1 shadow-sm">
      <span className="absolute inset-0 bg-black/15 dark:bg-black/25" />
      {isUser ? (
        <span
          className="relative flex size-5 items-center justify-center overflow-hidden rounded-full bg-white/25 text-[8px] font-semibold text-white ring-1 ring-white/40"
          /* img via innerHTML: React 19 would emit a <link rel=preload> for <img src>, absent from the goldens */
          {...(collaborator.avatar
            ? {
                dangerouslySetInnerHTML: {
                  __html: `<img src="${collaborator.avatar}" alt="${collaborator.name}" class="size-full object-cover"/>`,
                },
              }
            : { children: collaborator.initials })}
        />
      ) : (
        <span className="relative flex size-4 items-center justify-center rounded-full bg-white/20">
          <Bot className="size-2.5 text-white" strokeWidth={2.5} />
        </span>
      )}
      <span className="relative text-[10px] leading-none font-medium whitespace-nowrap text-white">
        {collaborator.name}
      </span>
    </div>
  );
}

function DocumentWindow({ lines }: { lines: number }) {
  return (
    <div className="flex size-full flex-col overflow-hidden rounded-lg border border-border/40 bg-card/40 shadow-xs dark:bg-card/25">
      <div className="flex items-center gap-1 border-b border-border/40 px-2 py-1.5">
        <span className="size-1 rounded-full bg-muted-foreground/30" />
        <span className="size-1 rounded-full bg-muted-foreground/30" />
        <span className="size-1 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn("h-1.5 rounded-full bg-muted-foreground/15", LINE_WIDTHS[i % LINE_WIDTHS.length])} />
        ))}
      </div>
    </div>
  );
}

function Cursor({
  win,
  index,
  animated,
  state,
}: {
  win: { lines: number };
  index: number;
  animated: boolean;
  state: Record<string, unknown>;
}) {
  if (!animated) {
    return (
      <div className="h-[62%] flex-1">
        <DocumentWindow lines={win.lines} />
      </div>
    );
  }
  return (
    <motion.div className="h-[62%] flex-1" variants={windowAnim} custom={index} {...state}>
      <DocumentWindow lines={win.lines} />
    </motion.div>
  );
}

export interface PresenceProps extends VisualProps {
  collaborators?: readonly Collaborator[];
  hover?: boolean;
  glow?: boolean;
  particles?: boolean;
}

export function Presence({
  collaborators = presenceDefaultCopy.collaborators,
  animated = false,
  trigger = "inView",
  hover = false,
  glow = true,
  particles = true,
  className,
}: PresenceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTicked(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = (hover ? hovered : inView) && ticked;
  const drifting = inView && ticked;
  const state = { initial: "hidden", animate: inView ? "visible" : "hidden" } as const;

  let colorSeed = 0;
  const cursors = collaborators.slice(0, CURSOR_PATHS.length).map((c) => {
    const kind = c.kind ?? "agent";
    const color =
      c.color ?? (kind === "user" ? "text-primary" : AGENT_COLORS[colorSeed++ % AGENT_COLORS.length]);
    return { ...c, kind, color };
  });

  if (!animated) {
    return (
      <div
        aria-hidden="true"
        className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      >
        {glow && (
          <div className="absolute inset-0 -z-10">
            <GlowScene />
          </div>
        )}
        {particles && (
          <div className="absolute inset-0 -z-10">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div
                  className={`rotate-45 rounded-[1px] ${p.color}`}
                  style={{ width: p.size, height: p.size, opacity: p.opacity * 0.7 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="relative z-10 aspect-video w-full max-w-md">
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            {WINDOWS.map((win, i) => (
              <Cursor key={i} win={win} index={i} animated={false} state={{}} />
            ))}
          </div>
          {cursors.map((c, i) => {
            const start = CURSOR_PATHS[i % CURSOR_PATHS.length]!.points[0]!;
            return (
              <div
                key={i}
                className={cn("absolute", c.kind === "user" && "z-10")}
                style={{ left: `${start.x}%`, top: `${start.y}%` }}
              >
                <div className={cn("origin-top-left", c.color)}>
                  <CursorArrow />
                  <div className="mt-0.5 ml-2.5">
                    <CursorChip collaborator={c} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative isolate flex size-full items-center justify-center overflow-hidden px-2", className)}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
    >
      {glow && (
        <motion.div className="absolute inset-0 -z-10" variants={glowVariant} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={active ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.85 }}
            transition={
              active ? { duration: 4.5, ease: "easeInOut", repeat: Infinity } : { duration: 0.6, ease: "easeOut" }
            }
          >
            <GlowScene />
          </motion.div>
        </motion.div>
      )}
      {particles && (
        <motion.div className="absolute inset-0 -z-10" variants={particlesVariant} {...state}>
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: +!!active }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <motion.div
                  animate={
                    drifting
                      ? { x: [0, p.driftX, 0], y: [0, -p.driftY, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }
                      : { x: 0, y: 0, opacity: 0 }
                  }
                  transition={
                    drifting
                      ? { duration: p.duration, delay: p.delay, ease: "easeInOut", repeat: Infinity }
                      : { duration: 0.3 }
                  }
                >
                  <div className={`rotate-45 rounded-[1px] ${p.color}`} style={{ width: p.size, height: p.size }} />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
      <div className="relative z-10 aspect-video w-full max-w-md">
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {WINDOWS.map((win, i) => (
            <Cursor key={i} win={win} index={i} animated state={state} />
          ))}
        </div>
        {cursors.map((c, i) => {
          const path = CURSOR_PATHS[i % CURSOR_PATHS.length]!;
          const xs = path.points.map((p) => `${p.x}%`);
          const ys = path.points.map((p) => `${p.y}%`);
          return (
            <motion.div
              key={i}
              className={cn("absolute inset-0", c.kind === "user" && "z-10")}
              initial={{ x: xs[0], y: ys[0] }}
              animate={active ? { x: xs, y: ys } : { x: xs[0], y: ys[0] }}
              transition={
                active
                  ? { duration: path.duration, ease: "easeInOut", repeat: Infinity, delay: hover ? 0 : CURSOR_LOOP_DELAY }
                  : { duration: 0.25, ease: "easeOut" }
              }
            >
              <motion.div className={cn("relative origin-top-left", c.color)} variants={chip} custom={i} {...state}>
                {c.kind === "user" && (
                  <span className="absolute top-[3px] left-[3px] -translate-x-1/2 -translate-y-1/2">
                    <motion.span
                      className="block size-5 rounded-full border-2 border-current"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={
                        active ? { scale: [0.3, 1.1, 1.9], opacity: [0, 0.55, 0] } : { scale: 0.3, opacity: 0 }
                      }
                      transition={
                        active
                          ? { duration: 2.2, delay: hover ? 0.3 : 1, repeat: Infinity, repeatDelay: 1.6, ease: "easeOut" }
                          : { duration: 0.3 }
                      }
                    />
                  </span>
                )}
                <CursorArrow />
                <div className="mt-0.5 ml-2.5">
                  <CursorChip collaborator={c} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
