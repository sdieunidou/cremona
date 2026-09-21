import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { GitBranch, GitMerge } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface BranchGraphBranch {
  name: string;
  from: number;
  commits: number;
  merge?: boolean;
  color?: string;
  pulseColor?: string;
}

export interface BranchGraphProps extends VisualProps {
  base?: string;
  commits?: number;
  branches?: BranchGraphBranch[];
  head?: string;
  pulse?: "dot" | "line";
  hover?: boolean;
  isometric?: boolean;
}

const defaultBranches = [
  {
    name: "feat/checkout",
    from: 1,
    commits: 2,
    merge: true,
    color: "text-violet-500",
    pulseColor: "text-violet-800 dark:text-violet-200",
  },
  {
    name: "fix/auth",
    from: 4,
    commits: 2,
    color: "text-amber-500",
    pulseColor: "text-amber-800 dark:text-amber-200",
  },
] as const;

const W = 416;
const H = 288;
const LANE_GAP = 52;
const RAIL_Y = 208;
const ROW_H = 64;
const CURVE = 26;
const LABEL_H = 26;
const MAX_COMMITS = 7;
const MAX_BRANCHES = 2;
const PATH_LENGTH = 100;
const PULSE_WIDTH = 2;
const DASH = 10;
const NODE = {
  commit: { size: "size-3.5", scale: 2.6 },
  merge: { size: "size-5", scale: 1.9 },
} as const;

const MAIN_DELAY = 0.1;
const COMMIT_BASE = 0.3;
const COMMIT_STAGGER = 0.06;
const BRANCH_BASE = 0.5;
const BRANCH_STAGGER = 0.22;
const BRANCH_COMMIT_OFFSET = 0.3;
const LABEL_BASE = 0.8;
const LABEL_STAGGER = 0.12;
const HEAD_DELAY = 1.05;
const PULSE_DELAY = 1.3;
const FIRST_PULSE_BEGIN = 0.4;
const BRANCH_PULSE_STEP = 0.7;

const card = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const pathAnim: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

const nodeAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 16, delay },
  }),
};

const labelAnim: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 22, delay },
  }),
};

function Pulse({
  d,
  dur,
  begin,
  pulse,
  color,
}: {
  d: string;
  dur: string;
  begin: string;
  pulse: "dot" | "line";
  color: string;
}) {
  if (pulse === "line") {
    return (
      <path
        d={d}
        pathLength={PATH_LENGTH}
        fill="none"
        stroke="currentColor"
        className={color}
        strokeWidth={PULSE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={`${DASH} 200`}
      >
        <animate
          attributeName="stroke-dashoffset"
          values={`${DASH};-100`}
          dur={dur}
          repeatCount="indefinite"
          begin={begin}
        />
      </path>
    );
  }
  return (
    <g className={color}>
      <circle r={4.5} fill="currentColor" opacity={0.18}>
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
      <circle r={2.2} fill="currentColor">
        <animateMotion dur={dur} repeatCount="indefinite" begin={begin} path={d} />
      </circle>
    </g>
  );
}

const railStart = (count: number) => (W - (count - 1) * LANE_GAP) / 2;
const branchY = (row: number) => RAIL_Y - row * ROW_H;

interface LaidOutBranch extends BranchGraphBranch {
  merge: boolean;
  count: number;
  from: number;
  tip: number;
  mergeCol: number | null;
  y: number;
}

function layout(branches: readonly BranchGraphBranch[], total: number): LaidOutBranch[] {
  return branches.map((branch, row) => {
    const isMerge = !!branch.merge && total > 2;
    const lastLane = Math.max(total - 2 - (isMerge ? 1 : 0), 0);
    const from = Math.min(Math.max(Math.round(branch.from), 0), lastLane);
    const lanes = total - 1 - from - (isMerge ? 1 : 0);
    const count = Math.min(Math.max(Math.round(branch.commits), 1), Math.max(lanes, 1));
    const tip = from + count;
    const mergeCol = isMerge ? Math.min(tip + 1, total - 1) : null;
    return {
      ...branch,
      merge: isMerge,
      count,
      from,
      tip,
      mergeCol,
      y: branchY(row + 1),
    };
  });
}

function branchPath(branch: LaidOutBranch, x: (lane: number) => number): string {
  let d = `M ${x(branch.from)} ${RAIL_Y} C ${x(branch.from) + CURVE} ${RAIL_Y}, ${x(branch.from + 1) - CURVE} ${branch.y}, ${x(branch.from + 1)} ${branch.y}`;
  if (branch.tip > branch.from + 1) d += ` H ${x(branch.tip)}`;
  if (branch.mergeCol !== null) {
    d += ` C ${x(branch.tip) + CURVE} ${branch.y}, ${x(branch.mergeCol) - CURVE} ${RAIL_Y}, ${x(branch.mergeCol)} ${RAIL_Y}`;
  }
  return d;
}

export function BranchGraph({
  base = "main",
  commits = 7,
  branches,
  head = "HEAD",
  pulse = "dot",
  animated = false,
  trigger = "inView",
  hover = false,
  isometric = false,
  className,
}: BranchGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pulsing = animated && (hover ? hovering : triggered);
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const total = Math.min(Math.max(Math.round(commits), 2), MAX_COMMITS);
  const x0 = railStart(total);
  const x = (lane: number) => x0 + lane * LANE_GAP;
  const laid = layout(branches?.length ? branches : defaultBranches, total).slice(0, MAX_BRANCHES);
  const mergeCols = new Set(laid.map((b) => b.mergeCol).filter((c) => c !== null));
  const railD = `M ${x(0)} ${RAIL_Y} H ${x(total - 1)}`;
  const lastLane = total - 1;
  const baseLabelTop = laid.some((b) => b.from === 0) ? 236 : 182;
  const pos = (left: number, top: number) => ({
    left: `${(left / W) * 100}%`,
    top: `${(top / H) * 100}%`,
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className="relative shrink-0"
        style={
          !animated && isometric
            ? { width: W, height: H, transform: "rotateX(45deg) rotateZ(-45deg)" }
            : { width: W, height: H }
        }
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
        >
          <motion.path
            d={railD}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="text-primary/35"
            variants={animated ? pathAnim : undefined}
            custom={MAIN_DELAY}
            {...state}
          />
          {laid.map((branch, i) => (
            <motion.path
              key={`lane${i}`}
              d={branchPath(branch, x)}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              className={cn("opacity-40", branch.color ?? "text-primary")}
              variants={animated ? pathAnim : undefined}
              custom={BRANCH_BASE + i * BRANCH_STAGGER}
              {...state}
            />
          ))}
          {animated && (
            <motion.g
              initial={false}
              animate={{ opacity: +!!pulsing }}
              transition={{ duration: 0.5, ease: "easeOut", delay: pulsing && !hover ? PULSE_DELAY : 0 }}
            >
              <Pulse d={railD} dur="3.4s" begin="0s" pulse={pulse} color="text-primary" />
              {laid.map((branch, i) => (
                <Pulse
                  key={`lp${i}`}
                  d={branchPath(branch, x)}
                  dur="2.8s"
                  begin={`${-(FIRST_PULSE_BEGIN + i * BRANCH_PULSE_STEP)}s`}
                  pulse={pulse}
                  color={branch.pulseColor ?? branch.color ?? "text-primary"}
                />
              ))}
            </motion.g>
          )}
        </svg>
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pos(x(0), baseLabelTop)}
        >
          <motion.div
            className="flex h-5.5 items-center gap-1 rounded-full border bg-card px-1.5 shadow-xs ring-2 ring-background"
            variants={animated ? labelAnim : undefined}
            custom={LABEL_BASE}
            {...state}
          >
            <GitBranch className="size-2.5 shrink-0 text-primary" />
            <span className="font-mono text-[10px] leading-none font-medium text-foreground">
              {base}
            </span>
          </motion.div>
        </div>
        {laid.map((branch, i) => (
          <div
            key={`ll${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={pos(x(branch.from + 1), branch.y - LABEL_H)}
          >
            <motion.div
              className="flex h-5.5 items-center gap-1 rounded-full border bg-card px-1.5 shadow-xs ring-2 ring-background"
              variants={animated ? labelAnim : undefined}
              custom={LABEL_BASE + i * LABEL_STAGGER}
              {...state}
            >
              <GitBranch
                className={cn("size-2.5 shrink-0", branch.color ?? "text-primary")}
              />
              <span className="font-mono text-[10px] leading-none font-medium text-foreground">
                {branch.name}
              </span>
            </motion.div>
          </div>
        ))}
        {Array.from({ length: total }).map((_, i) => {
          const isMerge = mergeCols.has(i);
          const isHead = i === lastLane;
          const node = isMerge ? NODE.merge : NODE.commit;
          return (
            <div
              key={`mc${i}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={pos(x(i), RAIL_Y)}
            >
              <motion.div
                className="relative flex items-center justify-center"
                variants={animated ? nodeAnim : undefined}
                custom={COMMIT_BASE + i * COMMIT_STAGGER}
                {...state}
              >
                {isHead && animated && (
                  <motion.span
                    className={cn("absolute rounded-full bg-primary", node.size)}
                    initial={false}
                    animate={
                      pulsing
                        ? { scale: [1, node.scale], opacity: [0.45, 0] }
                        : { scale: 1, opacity: 0 }
                    }
                    transition={
                      pulsing
                        ? { duration: 2, ease: "easeOut", repeat: 1 / 0, repeatDelay: 0.4 }
                        : { duration: 0.3 }
                    }
                  />
                )}
                {isMerge ? (
                  <span className="relative flex size-5 items-center justify-center rounded-full border bg-card text-primary shadow-xs ring-2 ring-background">
                    <GitMerge className="size-2.5" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "relative rounded-full bg-primary ring-2 ring-background",
                      isHead ? "size-3.5" : "size-3",
                    )}
                  />
                )}
              </motion.div>
            </div>
          );
        })}
        {laid.map((branch, i) =>
          Array.from({ length: branch.count }).map((_, r) => (
            <div
              key={`bc${i}-${r}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={pos(x(branch.from + 1 + r), branch.y)}
            >
              <motion.span
                className={cn(
                  "block size-2.5 rounded-full bg-current ring-2 ring-background",
                  branch.color ?? "text-primary",
                )}
                variants={animated ? nodeAnim : undefined}
                custom={BRANCH_BASE + i * BRANCH_STAGGER + BRANCH_COMMIT_OFFSET + r * COMMIT_STAGGER}
                {...state}
              />
            </div>
          )),
        )}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(x(lastLane), 236)}>
          <motion.span
            className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0"
            variants={animated ? labelAnim : undefined}
            custom={HEAD_DELAY}
            {...state}
          >
            {head}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
