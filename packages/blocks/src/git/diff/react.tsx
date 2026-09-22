import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { FileDiff } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

type TokenColor =
  | "keyword"
  | "func"
  | "string"
  | "variable"
  | "type"
  | "punct"
  | "tag"
  | "prop"
  | "comment";

export interface DiffToken {
  width: number;
  color: TokenColor;
}

export interface DiffLine {
  type?: "add" | "remove";
  indent?: number;
  tokens: DiffToken[];
}

export interface DiffProps extends VisualProps {
  view?: "unified" | "split";
  file?: string;
  language?: string;
  hunk?: string;
  startLine?: number;
  lines?: DiffLine[];
  lineNumbers?: boolean;
  hover?: boolean;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

const tokenColors: Record<TokenColor, string> = {
  keyword: "bg-violet-400/50 dark:bg-violet-400/40",
  func: "bg-blue-400/50 dark:bg-blue-400/40",
  string: "bg-emerald-400/50 dark:bg-emerald-400/40",
  variable: "bg-sky-400/50 dark:bg-sky-400/40",
  type: "bg-amber-400/50 dark:bg-amber-400/40",
  punct: "bg-muted-foreground/30",
  tag: "bg-rose-400/50 dark:bg-rose-400/40",
  prop: "bg-cyan-400/50 dark:bg-cyan-400/40",
  comment: "bg-muted-foreground/20",
};

const defaultFile = "src/checkout/session.ts";
const defaultLanguage = "TS";
const defaultHunk = "@@ -14,7 +14,9 @@";
const defaultStartLine = 14;
const defaultLines: DiffLine[] = [
  {
    indent: 0,
    tokens: [
      { width: 16, color: "keyword" },
      { width: 26, color: "func" },
      { width: 8, color: "punct" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { width: 20, color: "variable" },
      { width: 6, color: "punct" },
      { width: 30, color: "string" },
    ],
  },
  {
    type: "remove",
    indent: 1,
    tokens: [
      { width: 18, color: "variable" },
      { width: 6, color: "punct" },
      { width: 22, color: "type" },
    ],
  },
  {
    type: "remove",
    indent: 1,
    tokens: [
      { width: 26, color: "func" },
      { width: 6, color: "punct" },
      { width: 16, color: "string" },
    ],
  },
  {
    type: "add",
    indent: 1,
    tokens: [
      { width: 18, color: "variable" },
      { width: 6, color: "punct" },
      { width: 28, color: "type" },
    ],
  },
  {
    type: "add",
    indent: 1,
    tokens: [
      { width: 24, color: "func" },
      { width: 6, color: "punct" },
      { width: 22, color: "prop" },
    ],
  },
  { type: "add", indent: 2, tokens: [{ width: 34, color: "comment" }] },
  {
    indent: 1,
    tokens: [
      { width: 14, color: "keyword" },
      { width: 20, color: "variable" },
    ],
  },
  { indent: 0, tokens: [{ width: 10, color: "punct" }] },
];

const MAX_LINES = 10;
const TOKEN_SCALE = 0.75;
const INDENT_STEP = 8;
const SWEEP_STEP = 0.22;
const SWEEP_BASE_DELAY = 0.55;
const SWEEP_PULSE = 1.6;
const SWEEP_FIRST_DELAY = 0.9;
const HOVER_OPACITY_DURATION = 0.3;

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

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

const headerAnim = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.12, ease: "easeOut" },
  },
} as const;

const hunkAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.22, ease: "easeOut" },
  },
} as const;

const rowAnim: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 26,
      delay: 0.32 + index * 0.05,
    },
  }),
};

interface MarkedLine extends DiffLine {
  kind: "context" | "add" | "remove";
  ordinal: number | null;
}

function markKinds(lines: readonly DiffLine[]): MarkedLine[] {
  let counter = 0;
  return lines.map((line) => {
    const kind = line.type ?? "context";
    return { ...line, kind, ordinal: kind === "context" ? null : counter++ };
  });
}

function unifiedNumbers(lines: readonly MarkedLine[], start: number): (number | null)[] {
  let n = start;
  return lines.map((line) => (line.kind === "remove" ? null : n++));
}

interface SplitRow {
  left: MarkedLine | null;
  right: MarkedLine | null;
  leftNo: number | null;
  rightNo: number | null;
}

function splitRows(lines: readonly MarkedLine[], start: number): SplitRow[] {
  const rows: SplitRow[] = [];
  let leftNo = start;
  let rightNo = start;
  let i = 0;
  while (i < lines.length) {
    if (lines[i]!.kind === "context") {
      rows.push({ left: lines[i]!, right: lines[i]!, leftNo: leftNo++, rightNo: rightNo++ });
      i++;
      continue;
    }
    const removed: MarkedLine[] = [];
    const added: MarkedLine[] = [];
    while (i < lines.length && lines[i]!.kind === "remove") removed.push(lines[i++]!);
    while (i < lines.length && lines[i]!.kind === "add") added.push(lines[i++]!);
    const pairCount = Math.max(removed.length, added.length);
    for (let p = 0; p < pairCount; p++) {
      rows.push({
        left: removed[p] ?? null,
        right: added[p] ?? null,
        leftNo: removed[p] ? leftNo++ : null,
        rightNo: added[p] ? rightNo++ : null,
      });
    }
  }
  return rows;
}

const rowTint: Record<MarkedLine["kind"], string> = {
  add: "bg-emerald-500/8 dark:bg-emerald-500/10",
  remove: "bg-rose-500/8 dark:bg-rose-500/10",
  context: "",
};

const rowSweep: Record<MarkedLine["kind"], string> = {
  add: "bg-emerald-500/14 dark:bg-emerald-500/16",
  remove: "bg-rose-500/14 dark:bg-rose-500/16",
  context: "",
};

const rowBorder: Record<MarkedLine["kind"], string> = {
  add: "border-emerald-500/60",
  remove: "border-rose-500/60",
  context: "border-transparent",
};

const rowNumberColor: Record<MarkedLine["kind"], string> = {
  add: "text-emerald-600 dark:text-emerald-400",
  remove: "text-rose-600 dark:text-rose-400",
  context: "text-muted-foreground/60",
};

function Tokens({ line }: { line: MarkedLine }) {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-1"
      style={{ paddingLeft: `${(line.indent ?? 0) * INDENT_STEP}px` }}
    >
      {line.tokens.map((token, i) => (
        <div
          key={i}
          className={cn("h-1.25 shrink-0 rounded-sm", tokenColors[token.color])}
          style={{ width: `${token.width * TOKEN_SCALE}%` }}
        />
      ))}
    </div>
  );
}

function Half({
  line,
  number,
  active,
  animated,
  lineNumbers,
}: {
  line: MarkedLine | null;
  number: number | null;
  active: boolean;
  animated: boolean;
  lineNumbers: boolean;
}) {
  if (!line) {
    return (
      <div className="flex h-5 min-w-0 flex-1 items-center border-l-2 border-transparent bg-muted/30 px-2" />
    );
  }
  return (
    <div
      className={cn(
        "relative flex h-5 min-w-0 flex-1 items-center gap-1.5 border-l-2 px-2",
        rowBorder[line.kind],
        rowTint[line.kind],
      )}
    >
      {animated && line.kind !== "context" && (
        <motion.span
          className={cn("pointer-events-none absolute inset-0", rowSweep[line.kind])}
          initial={false}
          animate={{ opacity: +!!active }}
          transition={{ duration: HOVER_OPACITY_DURATION, ease: "easeOut" }}
        />
      )}
      {lineNumbers && (
        <span
          className={cn(
            "relative w-4 shrink-0 text-right text-[8px] font-semibold tabular-nums",
            rowNumberColor[line.kind],
          )}
        >
          {number}
        </span>
      )}
      <div className="relative flex min-w-0 flex-1 items-center">
        <Tokens line={line} />
      </div>
    </div>
  );
}

export function Diff({
  view = "unified",
  file = defaultFile,
  language = defaultLanguage,
  hunk = defaultHunk,
  startLine = defaultStartLine,
  lines,
  lineNumbers = true,
  animated = false,
  trigger = "inView",
  hover = false,
  gradient = true,
  fadeOut = false,
  isometric = false,
  fill = false,
  className,
}: DiffProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const sweeping = animated && (hover ? hovering : triggered) && ready;
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const marked = markKinds((lines?.length ? lines : defaultLines).slice(0, MAX_LINES));
  const changed = marked.filter((l) => l.kind !== "context");
  const totalChanged = changed.length;
  const visibleCount = sweeping ? cursor + 1 : totalChanged;
  const counted = changed.filter((l) => l.ordinal !== null && l.ordinal < visibleCount);
  const adds = counted.filter((l) => l.kind === "add").length;
  const removes = counted.length - adds;
  useEffect(() => {
    if (!sweeping || totalChanged === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };
    const stepMs = SWEEP_STEP * 1000;
    const cycleMs = totalChanged * stepMs + SWEEP_PULSE * 1000;
    const startCycle = () => {
      timers.length = 0;
      for (let i = 0; i < totalChanged; i++) schedule(() => setCursor(i), i * stepMs);
      schedule(() => setCursor(totalChanged), totalChanged * stepMs);
      schedule(startCycle, cycleMs);
    };
    schedule(() => setCursor(-1), 0);
    schedule(startCycle, hover ? 0 : SWEEP_FIRST_DELAY * 1000);
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [sweeping, hover, totalChanged]);
  const pairs = view === "split" ? splitRows(marked, startLine) : [];
  const numbers = unifiedNumbers(marked, startLine);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={
        animated && hover
          ? () => {
              setCursor(-1);
              setHovering(true);
            }
          : undefined
      }
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className={cn(
          "relative w-full", !fill && "max-w-96", "rounded-3xl border border-border/50 bg-muted/75 p-1.5",
          fadeOut && "mask-b-from-60%",
        )}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center gap-2 border-b px-3 py-2.5"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <FileDiff className="size-3.5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-medium text-foreground">
              {file}
            </span>
            <span
              className="shrink-0 text-[10px] font-medium text-emerald-600 tabular-nums dark:text-emerald-400"
              dangerouslySetInnerHTML={{ __html: `+<!-- -->${adds}` }}
            />
            <span
              className="shrink-0 text-[10px] font-medium text-rose-600 tabular-nums dark:text-rose-400"
              dangerouslySetInnerHTML={{ __html: `-<!-- -->${removes}` }}
            />
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
              {language}
            </span>
          </motion.div>
          <motion.div
            className="border-b bg-muted/40 px-3 py-1"
            variants={animated ? hunkAnim : undefined}
            {...state}
          >
            <span className="font-mono text-[9px] font-medium text-muted-foreground">{hunk}</span>
          </motion.div>
          {view === "unified" && (
            <div className="flex flex-col py-1">
              {marked.map((line, i) => (
                <motion.div
                  key={i}
                  className="flex"
                  variants={animated ? rowAnim : undefined}
                  custom={i}
                  {...state}
                >
                  <Half
                    line={line}
                    number={numbers[i] ?? null}
                    active={sweeping && line.ordinal === cursor}
                    animated={animated}
                    lineNumbers={lineNumbers}
                  />
                </motion.div>
              ))}
            </div>
          )}
          {view === "split" && (
            <div className="flex flex-col py-1">
              {pairs.map((pair, i) => (
                <motion.div
                  key={i}
                  className="flex items-stretch"
                  variants={animated ? rowAnim : undefined}
                  custom={i}
                  {...state}
                >
                  <Half
                    line={pair.left}
                    number={pair.leftNo}
                    active={sweeping && pair.left?.ordinal === cursor}
                    animated={animated}
                    lineNumbers={lineNumbers}
                  />
                  <span className="w-px shrink-0 bg-border" />
                  <Half
                    line={pair.right}
                    number={pair.rightNo}
                    active={sweeping && pair.right?.ordinal === cursor}
                    animated={animated}
                    lineNumbers={lineNumbers}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
