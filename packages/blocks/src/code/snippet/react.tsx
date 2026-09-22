import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Copy } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SnippetToken {
  width: number;
  color:
    | "keyword"
    | "func"
    | "string"
    | "variable"
    | "type"
    | "punct"
    | "tag"
    | "prop"
    | "comment";
}

export interface SnippetLine {
  indent: number;
  tokens: readonly SnippetToken[];
  blank?: boolean;
  highlight?: boolean;
  diff?: "add" | "remove";
}

type SnippetLanguage = "tsx" | "bash" | "json" | "css" | "sql" | "yaml" | "md";

const snippetFilenames: Record<SnippetLanguage, string> = {
  tsx: "Button.tsx",
  bash: "install.sh",
  json: "package.json",
  css: "theme.css",
  sql: "query.sql",
  yaml: "config.yaml",
  md: "README.md",
};

const snippetLabels: Record<SnippetLanguage, string> = {
  tsx: "TSX",
  bash: "BASH",
  json: "JSON",
  css: "CSS",
  sql: "SQL",
  yaml: "YAML",
  md: "MD",
};

const tokenColors: Record<SnippetToken["color"], string> = {
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

const snippetDefaultLines: Record<SnippetLanguage, SnippetLine[]> = {
  tsx: [
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 26, color: "variable" }, { width: 10, color: "punct" }, { width: 32, color: "string" }] },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 24, color: "func" }, { width: 12, color: "type" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 14, color: "keyword" }, { width: 18, color: "punct" }, { width: 22, color: "tag" }, { width: 20, color: "prop" }, { width: 16, color: "string" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  bash: [
    { indent: 0, tokens: [{ width: 30, color: "comment" }, { width: 40, color: "comment" }] },
    { indent: 0, tokens: [{ width: 16, color: "func" }, { width: 14, color: "keyword" }, { width: 38, color: "string" }] },
    { indent: 0, tokens: [{ width: 16, color: "func" }, { width: 24, color: "variable" }, { width: 18, color: "string" }] },
    { indent: 0, tokens: [{ width: 16, color: "func" }, { width: 22, color: "keyword" }] },
    { indent: 0, tokens: [{ width: 16, color: "func" }, { width: 20, color: "variable" }] },
  ],
  json: [
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 22, color: "prop" }, { width: 30, color: "string" }] },
    { indent: 1, tokens: [{ width: 26, color: "prop" }, { width: 18, color: "string" }] },
    { indent: 1, tokens: [{ width: 30, color: "prop" }, { width: 10, color: "punct" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  css: [
    { indent: 0, tokens: [{ width: 30, color: "tag" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 24, color: "prop" }, { width: 32, color: "string" }] },
    { indent: 1, tokens: [{ width: 30, color: "prop" }, { width: 20, color: "variable" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  sql: [
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 14, color: "variable" }, { width: 18, color: "variable" }, { width: 14, color: "keyword" }, { width: 20, color: "tag" }] },
    { indent: 1, tokens: [{ width: 16, color: "keyword" }, { width: 26, color: "variable" }, { width: 10, color: "punct" }, { width: 28, color: "string" }] },
    { indent: 1, tokens: [{ width: 20, color: "keyword" }, { width: 24, color: "variable" }, { width: 14, color: "keyword" }] },
    { indent: 1, tokens: [{ width: 14, color: "keyword" }, { width: 12, color: "type" }] },
  ],
  yaml: [
    { indent: 0, tokens: [{ width: 18, color: "prop" }, { width: 24, color: "string" }] },
    { indent: 0, tokens: [{ width: 22, color: "prop" }, { width: 18, color: "keyword" }] },
    { indent: 0, tokens: [{ width: 30, color: "prop" }] },
    { indent: 1, tokens: [{ width: 10, color: "punct" }, { width: 24, color: "string" }] },
    { indent: 1, tokens: [{ width: 10, color: "punct" }, { width: 20, color: "string" }] },
  ],
  md: [
    { indent: 0, tokens: [{ width: 12, color: "tag" }, { width: 32, color: "keyword" }] },
    { indent: 0, tokens: [{ width: 22, color: "comment" }, { width: 18, color: "comment" }, { width: 14, color: "string" }, { width: 20, color: "func" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }, { width: 26, color: "comment" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }, { width: 24, color: "comment" }] },
  ],
};

const card = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const cardIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const linesAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
} as const;

const lineAnim = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const caretAnim: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    transition: { duration: 1, delay: 0.9, repeat: Infinity, ease: "linear" },
  },
};

const buttonAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.5 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

function SnippetCodeLine({
  line,
  index,
  showGutter,
  lineNumbers,
}: {
  line: SnippetLine;
  index: number;
  showGutter: boolean;
  lineNumbers: boolean;
}) {
  const bg = line.diff === "add"
    ? "bg-emerald-500/8 dark:bg-emerald-500/10"
    : line.diff === "remove"
      ? "bg-rose-500/8 dark:bg-rose-500/10"
      : line.highlight
        ? "bg-primary/8"
        : "";
  const border = line.diff === "add"
    ? "border-emerald-500/60"
    : line.diff === "remove"
      ? "border-rose-500/60"
      : line.highlight
        ? "border-primary"
        : "border-transparent";
  const gutterColor = line.diff === "add"
    ? "text-emerald-600 dark:text-emerald-400"
    : line.diff === "remove"
      ? "text-rose-600 dark:text-rose-400"
      : "text-muted-foreground/60";
  const gutterText = line.diff === "add" ? "+" : line.diff === "remove" ? "−" : lineNumbers ? index + 1 : "";
  return (
    <div className={`flex items-center gap-1.5 border-l-2 px-3 ${border} ${bg}`}>
      {showGutter && (
        <span className={`w-3 shrink-0 text-right text-[8px] font-semibold tabular-nums ${gutterColor}`}>
          {gutterText}
        </span>
      )}
      <div className="flex flex-1 items-center gap-1" style={{ paddingLeft: `${line.indent * 10}px` }}>
        {line.tokens.map((token, i) => (
          <div
            key={i}
            className={`h-1.25 rounded-sm ${tokenColors[token.color]}`}
            style={{ width: `${token.width * 0.75}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export interface SnippetProps extends VisualProps {
  language?: SnippetLanguage;
  filename?: string;
  lines?: readonly SnippetLine[];
  lineNumbers?: boolean;
  caret?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Snippet({
  language = "tsx",
  filename,
  lines,
  lineNumbers = true,
  caret = true,
  animated = false,
  trigger = "inView",
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: SnippetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [copied, setCopied] = useState(false);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};
  const resolvedFilename = filename ?? snippetFilenames[language];
  const activeLines = lines ?? snippetDefaultLines[language];
  const hasDiff = activeLines.some((line) => !!line.diff);
  const showGutter = lineNumbers || hasDiff;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div
        className={cn("relative flex w-full", !fill && "max-w-72", "flex-col")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && (
          <>
            <motion.div
              className="absolute inset-x-1 bottom-0 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute -inset-x-0.5 -bottom-0.5 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-semibold text-muted-foreground">
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {snippetLabels[language]}
              </span>
              <span className="truncate">{resolvedFilename}</span>
            </div>
            <motion.button
              type="button"
              onClick={() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
              className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              variants={animated ? buttonAnim : undefined}
              {...state}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              {copied ? (
                <Check
                  className="size-2.5 text-emerald-500 dark:text-emerald-400"
                  strokeWidth={3}
                />
              ) : (
                <Copy className="size-2.5" strokeWidth={2.5} />
              )}
            </motion.button>
          </div>
          <motion.div
            className="flex flex-col gap-1.5 py-3"
            variants={animated ? linesAnim : undefined}
            {...state}
          >
            {activeLines.map((line, i) => (
              <motion.div key={i} variants={animated ? lineAnim : undefined}>
                <SnippetCodeLine
                  line={line}
                  index={i}
                  showGutter={showGutter}
                  lineNumbers={lineNumbers}
                />
              </motion.div>
            ))}
            {caret && (
              <div className="flex items-center gap-1.5 border-l-2 border-transparent px-3">
                {showGutter && (
                  <span className="w-3 shrink-0 text-right text-[8px] font-semibold text-muted-foreground/60 tabular-nums">
                    {lineNumbers ? activeLines.length + 1 : ""}
                  </span>
                )}
                <motion.div
                  className="h-2.5 w-px bg-primary"
                  variants={animated ? caretAnim : undefined}
                  {...state}
                />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
