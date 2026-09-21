import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimate, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

const KEY_UNIT = 46;
const GAP = 4;
const ROW_HEIGHT = 38;

function keyWidth(units: number): number {
  return units * KEY_UNIT - GAP;
}

interface KeyDef {
  label: string;
  w: number;
}

const ROWS: KeyDef[][] = [
  [
    { label: "esc", w: 1.5 },
    { label: "F1", w: 1 },
    { label: "F2", w: 1 },
    { label: "F3", w: 1 },
    { label: "F4", w: 1 },
    { label: "F5", w: 1 },
  ],
  [
    { label: "~", w: 1 },
    { label: "1", w: 1 },
    { label: "2", w: 1 },
    { label: "3", w: 1 },
    { label: "4", w: 1 },
    { label: "5", w: 1 },
  ],
  [
    { label: "tab", w: 1.5 },
    { label: "Q", w: 1 },
    { label: "W", w: 1 },
    { label: "E", w: 1 },
    { label: "R", w: 1 },
    { label: "T", w: 1 },
  ],
  [
    { label: "caps lock", w: 1.75 },
    { label: "A", w: 1 },
    { label: "S", w: 1 },
    { label: "D", w: 1 },
    { label: "F", w: 1 },
    { label: "G", w: 1 },
  ],
  [
    { label: "shift", w: 2.25 },
    { label: "Z", w: 1 },
    { label: "X", w: 1 },
    { label: "C", w: 1 },
    { label: "V", w: 1 },
  ],
];

const MAC_BOTTOM: KeyDef[] = [
  { label: "control", w: 1.25 },
  { label: "option", w: 1.25 },
  { label: "⌘", w: 1.25 },
  { label: "", w: 2.5 },
];

const WINDOWS_BOTTOM: KeyDef[] = [
  { label: "ctrl", w: 1.25 },
  { label: "start", w: 1.25 },
  { label: "alt", w: 1.25 },
  { label: "", w: 2.75 },
];

function buildRows(layout: string): KeyDef[][] {
  return [...ROWS, layout === "windows" ? WINDOWS_BOTTOM : MAC_BOTTOM];
}

const MODIFIER_MAP: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  "⌘": "meta",
  win: "meta",
  windows: "meta",
  start: "meta",
  meta: "meta",
  super: "meta",
  ctrl: "control",
  ctl: "control",
  control: "control",
  alt: "alt",
  opt: "alt",
  option: "alt",
  esc: "esc",
  escape: "esc",
};

function normalizeKey(label: string): string {
  const key = label.toLowerCase();
  return MODIFIER_MAP[key] ?? key;
}

const keyboard = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const keyboardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const row: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.1 + index * 0.05, ease: "easeOut" },
  }),
};

const TIMING = {
  initialDelay: 700,
  keyLightUp: 0.15,
  holdBetweenKeys: 250,
  holdAllLit: 700,
  keyDimDown: 0.3,
  rippleFade: 0.6,
  pauseBetweenCycles: 1000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type HalfLayout = "mac" | "windows";

export interface HalfProps extends VisualProps {
  keys?: string[] | null;
  layout?: HalfLayout;
  hover?: boolean;
  isometric?: boolean;
}

export function Half({
  keys = null,
  layout = "mac",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  className,
}: HalfProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const inViewActive =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pressedKeys = useMemo(() => keys ?? [], [keys]);
  const hasKeys = pressedKeys.length > 0;
  const active = hover && hasKeys ? hovered : inViewActive;
  const state = animated
    ? { initial: "hidden", animate: inViewActive ? "visible" : "hidden" }
    : {};
  const rows = buildRows(layout);
  const matched = useMemo(() => {
    const available = new Set(
      buildRows(layout)
        .flatMap((rowKeys) => rowKeys.map((key) => normalizeKey(key.label)))
        .filter((label) => label.length > 0),
    );
    return pressedKeys
      .map((_, i) => i)
      .filter((i) => available.has(normalizeKey(pressedKeys[i]!)));
  }, [layout, pressedKeys]);

  function keyIndex(label: string): number {
    return pressedKeys.findIndex((key) => normalizeKey(key) === normalizeKey(label));
  }

  useEffect(() => {
    if (!animated || matched.length === 0) return;
    if (!inViewActive) {
      for (const i of matched) {
        animate(`.key-glow-${i}`, { opacity: 0 }, { duration: 0 });
        animate(`.key-ripple-${i}`, { opacity: 0 }, { duration: 0 });
      }
      return;
    }
    if (!active) {
      for (const i of matched) {
        animate(`.key-glow-${i}`, { opacity: 0 }, { duration: 0.2 });
      }
      return;
    }
    let cancelled = false;
    async function run(): Promise<void> {
      try {
        for (const i of matched) {
          animate(`.key-glow-${i}`, { opacity: 0 }, { duration: 0 });
          animate(`.key-ripple-${i}`, { opacity: 0 }, { duration: 0 });
        }
        await sleep(hover ? 0 : TIMING.initialDelay);
        while (!cancelled) {
          for (const i of matched) {
            animate(`.key-glow-${i}`, { opacity: 0 }, { duration: 0 });
          }
          for (let k = 0; k < matched.length && !cancelled; k++) {
            const i = matched[k]!;
            animate(`.key-glow-${i}`, { opacity: 1 }, { duration: TIMING.keyLightUp });
            animate(
              `.key-ripple-${i}`,
              { opacity: [0.6, 0] },
              { duration: TIMING.rippleFade, ease: "easeOut" },
            );
            if (k < matched.length - 1) await sleep(TIMING.holdBetweenKeys);
          }
          if (cancelled) break;
          await sleep(TIMING.holdAllLit);
          if (cancelled) break;
          for (const i of matched) {
            animate(`.key-glow-${i}`, { opacity: 0 }, { duration: TIMING.keyDimDown });
          }
          await sleep(TIMING.keyDimDown * 1000);
          if (cancelled) break;
          await sleep(TIMING.pauseBetweenCycles);
        }
      } catch {
        // scope unmounted mid-animation
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [animated, inViewActive, active, hover, animate, matched]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover && hasKeys ? () => setHovered(true) : undefined}
      onMouseLeave={animated && hover && hasKeys ? () => setHovered(false) : undefined}
    >
      <motion.div
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? keyboardIso : keyboard) : undefined}
        {...state}
      >
        <div
          ref={scope}
          className="rounded-xl border border-border/50 bg-card/50 mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left p-0.75"
        >
          <div className="rounded-lg border border-border/50 bg-muted/60 p-2">
            <div className="flex flex-col" style={{ gap: GAP }}>
              {rows.map((rowKeys, rowIndex) => (
                <motion.div
                  key={rowIndex}
                  className="flex"
                  style={{ gap: GAP }}
                  variants={animated ? row : undefined}
                  custom={rowIndex}
                  {...state}
                >
                  {rowKeys.map((key, keyPos) => {
                    const index = keyIndex(key.label);
                    const matchedKey = index >= 0;
                    const isSpace = key.label === "";
                    const isWide =
                      key.label === "tab" || key.label === "shift" || key.label === "caps lock";
                    return (
                      <button
                        key={`${rowIndex}-${keyPos}`}
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        className={cn(
                          "relative flex items-center rounded-md border bg-card bg-linear-to-b from-card via-card to-muted/25 shadow-xs hover:to-muted/45 active:translate-y-px active:to-muted/60 active:shadow-none",
                          isWide ? "justify-start pl-2" : "justify-center",
                        )}
                        style={{ width: keyWidth(key.w), height: ROW_HEIGHT }}
                      >
                        <span
                          className={cn(
                            "font-medium text-muted-foreground select-none",
                            key.label.length > 1 ? "text-[10px]" : "text-xs",
                            isSpace && "sr-only",
                          )}
                        >
                          {isSpace ? "Space" : key.label}
                        </span>
                        {matchedKey && !animated && (
                          <span className="pointer-events-none absolute inset-0 block rounded-[4px] bg-primary/15 ring-1 ring-primary/40 ring-inset" />
                        )}
                        {matchedKey && animated && (
                          <>
                            <span
                              className={`block key-glow-${index} pointer-events-none absolute inset-0 rounded-md bg-muted/25 shadow-xs ring-1 shadow-primary/10 ring-primary/50 ring-inset dark:shadow-primary/25 dark:ring-primary`}
                              style={{ opacity: 0 }}
                            />
                            <span
                              className={`block key-ripple-${index} pointer-events-none absolute -inset-0.5 rounded-lg border-2 border-primary/30`}
                              style={{ opacity: 0 }}
                            />
                          </>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
