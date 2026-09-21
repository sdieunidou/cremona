import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { FileCode, GitBranch, Search } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface EditorTab {
  name: string;
  active?: boolean;
}

export interface EditorToken {
  width: number;
  color:
    | "keyword"
    | "func"
    | "string"
    | "variable"
    | "type"
    | "comment"
    | "punct"
    | "tag"
    | "prop";
}

export interface EditorLine {
  indent: number;
  tokens: readonly EditorToken[];
  blank?: boolean;
  highlight?: boolean;
  diff?: "add" | "remove";
}

type EditorLanguage = "tsx" | "js" | "py" | "php" | "html" | "css" | "go";

const editorDefaultTabs: Record<EditorLanguage, EditorTab[]> = {
  tsx: [{ name: "App.tsx", active: true }, { name: "Button.tsx" }, { name: "utils.ts" }],
  js: [{ name: "index.js", active: true }, { name: "config.js" }],
  py: [{ name: "main.py", active: true }, { name: "models.py" }, { name: "utils.py" }],
  php: [{ name: "User.php", active: true }, { name: "AuthController.php" }],
  html: [{ name: "index.html", active: true }, { name: "about.html" }, { name: "contact.html" }],
  css: [{ name: "styles.css", active: true }, { name: "theme.css" }, { name: "globals.css" }],
  go: [{ name: "main.go", active: true }, { name: "server.go" }, { name: "handler.go" }],
};

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

const tabsAnim = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2, ease: "easeOut" } },
} as const;

const linesAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
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

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const tokenColors: Record<EditorToken["color"], string> = {
  keyword: "bg-violet-400/50 dark:bg-violet-400/40",
  func: "bg-blue-400/50 dark:bg-blue-400/40",
  string: "bg-emerald-400/50 dark:bg-emerald-400/40",
  variable: "bg-sky-400/50 dark:bg-sky-400/40",
  type: "bg-amber-400/50 dark:bg-amber-400/40",
  comment: "bg-muted-foreground/20",
  punct: "bg-muted-foreground/30",
  tag: "bg-rose-400/50 dark:bg-rose-400/40",
  prop: "bg-cyan-400/50 dark:bg-cyan-400/40",
};

const editorDefaultLines: Record<EditorLanguage, EditorLine[]> = {
  tsx: [
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 24, color: "variable" }, { width: 10, color: "punct" }, { width: 32, color: "string" }] },
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 30, color: "func" }, { width: 24, color: "variable" }, { width: 14, color: "type" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 22, color: "keyword" }, { width: 32, color: "func" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 12, color: "keyword" }, { width: 14, color: "punct" }, { width: 18, color: "tag" }, { width: 22, color: "prop" }, { width: 18, color: "string" }] },
    { indent: 2, tokens: [{ width: 16, color: "tag" }, { width: 38, color: "string" }, { width: 14, color: "tag" }] },
    { indent: 2, tokens: [{ width: 16, color: "tag" }, { width: 32, color: "prop" }, { width: 14, color: "string" }, { width: 12, color: "tag" }] },
    { indent: 1, tokens: [{ width: 14, color: "punct" }, { width: 14, color: "tag" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  js: [
    { indent: 0, tokens: [{ width: 26, color: "comment" }, { width: 40, color: "comment" }] },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 28, color: "variable" }, { width: 10, color: "punct" }, { width: 20, color: "func" }, { width: 14, color: "string" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 30, color: "func" }, { width: 22, color: "variable" }] },
    { indent: 1, tokens: [{ width: 14, color: "keyword" }, { width: 22, color: "variable" }, { width: 10, color: "punct" }, { width: 28, color: "func" }] },
    { indent: 1, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "variable" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  py: [
    { indent: 0, tokens: [{ width: 16, color: "keyword" }, { width: 26, color: "variable" }, { width: 16, color: "keyword" }, { width: 18, color: "variable" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 28, color: "func" }, { width: 16, color: "variable" }, { width: 10, color: "type" }] },
    { indent: 1, tokens: [{ width: 40, color: "string" }] },
    { indent: 1, tokens: [{ width: 22, color: "variable" }, { width: 10, color: "punct" }, { width: 28, color: "func" }, { width: 14, color: "string" }] },
    { indent: 1, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "variable" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 24, color: "variable" }, { width: 16, color: "punct" }, { width: 26, color: "string" }] },
  ],
  php: [
    { indent: 0, tokens: [{ width: 14, color: "punct" }, { width: 22, color: "keyword" }, { width: 18, color: "variable" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "keyword" }, { width: 26, color: "type" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "func" }, { width: 14, color: "variable" }] },
    { indent: 2, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "variable" }, { width: 10, color: "punct" }, { width: 28, color: "func" }] },
    { indent: 1, tokens: [{ width: 10, color: "punct" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  html: [
    { indent: 0, tokens: [{ width: 10, color: "punct" }, { width: 22, color: "tag" }] },
    { indent: 0, tokens: [{ width: 18, color: "tag" }] },
    { indent: 1, tokens: [{ width: 16, color: "tag" }] },
    { indent: 2, tokens: [{ width: 14, color: "tag" }, { width: 24, color: "string" }, { width: 14, color: "tag" }] },
    { indent: 2, tokens: [{ width: 14, color: "tag" }, { width: 22, color: "prop" }, { width: 26, color: "string" }, { width: 12, color: "tag" }] },
    { indent: 1, tokens: [{ width: 18, color: "tag" }] },
    { indent: 1, tokens: [{ width: 16, color: "tag" }] },
    { indent: 2, tokens: [{ width: 14, color: "tag" }, { width: 32, color: "string" }, { width: 14, color: "tag" }] },
    { indent: 2, tokens: [{ width: 14, color: "tag" }, { width: 22, color: "prop" }, { width: 14, color: "string" }, { width: 18, color: "string" }, { width: 12, color: "tag" }] },
    { indent: 1, tokens: [{ width: 18, color: "tag" }] },
    { indent: 0, tokens: [{ width: 22, color: "tag" }] },
  ],
  css: [
    { indent: 0, tokens: [{ width: 26, color: "prop" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 22, color: "prop" }, { width: 20, color: "string" }] },
    { indent: 1, tokens: [{ width: 26, color: "prop" }, { width: 18, color: "keyword" }] },
    { indent: 1, tokens: [{ width: 24, color: "prop" }, { width: 22, color: "string" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 28, color: "tag" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 14, color: "tag" }, { width: 10, color: "punct" }] },
    { indent: 2, tokens: [{ width: 22, color: "prop" }, { width: 14, color: "keyword" }] },
    { indent: 1, tokens: [{ width: 10, color: "punct" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
  go: [
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 16, color: "variable" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 18, color: "keyword" }, { width: 22, color: "string" }] },
    { indent: 0, tokens: [], blank: true },
    { indent: 0, tokens: [{ width: 14, color: "keyword" }, { width: 22, color: "func" }, { width: 10, color: "punct" }, { width: 10, color: "punct" }] },
    { indent: 1, tokens: [{ width: 18, color: "variable" }, { width: 10, color: "punct" }, { width: 26, color: "string" }] },
    { indent: 1, tokens: [{ width: 14, color: "keyword" }, { width: 22, color: "variable" }, { width: 18, color: "type" }, { width: 10, color: "punct" }, { width: 18, color: "func" }, { width: 14, color: "punct" }] },
    { indent: 1, tokens: [{ width: 16, color: "variable" }, { width: 10, color: "punct" }, { width: 22, color: "func" }, { width: 14, color: "variable" }] },
    { indent: 0, tokens: [{ width: 10, color: "punct" }] },
  ],
};

function EditorCodeLine({
  line,
  index,
  showGutter,
  lineNumbers,
}: {
  line: EditorLine;
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
    <div className={`flex items-center gap-1.5 border-l-2 px-2.5 ${border} ${bg}`}>
      {showGutter && (
        <span className={`w-3 shrink-0 text-right text-[8px] font-medium tabular-nums ${gutterColor}`}>
          {gutterText}
        </span>
      )}
      <div className="flex flex-1 items-center gap-1" style={{ paddingLeft: `${line.indent * 8}px` }}>
        {line.blank ? (
          <div className="h-1.25" />
        ) : (
          line.tokens.map((token, i) => (
            <div
              key={i}
              className={`h-1.25 rounded-sm ${tokenColors[token.color]}`}
              style={{ width: `${token.width * 0.75}%` }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export interface EditorProps extends VisualProps {
  language?: EditorLanguage;
  tabs?: readonly EditorTab[];
  lines?: readonly EditorLine[];
  lineNumbers?: boolean;
  caret?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Editor({
  language = "tsx",
  tabs,
  lines,
  lineNumbers = true,
  caret = true,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};
  const activeTabs = tabs ?? editorDefaultTabs[language];
  const activeLines = lines ?? editorDefaultLines[language];
  const hasDiff = activeLines.some((line) => !!line.diff);
  const showGutter = lineNumbers || hasDiff;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
    >
      <motion.div
        className={`relative w-full max-w-90 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
          <div className="flex items-center gap-2 border-b bg-muted/40 px-2.5 py-1.5">
            <div className="flex gap-1.25">
              <div className="size-2 rounded-full bg-rose-400" />
              <div className="size-2 rounded-full bg-amber-400" />
              <div className="size-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex flex-1 items-center justify-center gap-1 text-[9px] font-medium text-muted-foreground">
              <GitBranch className="size-2.5" strokeWidth={2.5} />
              <span>main</span>
            </div>
            <Search className="size-2.5 text-muted-foreground" strokeWidth={2.5} />
          </div>
          <motion.div
            className="flex items-center gap-px border-b bg-muted/20 px-1.5 pt-1.5"
            variants={animated ? tabsAnim : undefined}
            {...state}
          >
            {activeTabs.map((tab) => (
              <div
                key={tab.name}
                className={`relative flex items-center gap-1 rounded-t-md border border-b-0 px-2 py-1 text-[9px] font-medium ${tab.active ? "z-1 translate-y-px border-border bg-card text-foreground" : "border-transparent text-muted-foreground hover:bg-muted/40"}`}
              >
                <FileCode
                  className={`size-2.5 ${tab.active ? "text-primary" : "text-muted-foreground/60"}`}
                  strokeWidth={2.5}
                />
                <span>{tab.name}</span>
              </div>
            ))}
          </motion.div>
          <div className="flex">
            <div className="w-1 shrink-0 bg-muted/30" />
            <motion.div
              className="flex flex-1 flex-col gap-1.5 py-3"
              variants={animated ? linesAnim : undefined}
              {...state}
            >
              {activeLines.map((line, i) => (
                <motion.div key={i} variants={animated ? lineAnim : undefined}>
                  <EditorCodeLine
                    line={line}
                    index={i}
                    showGutter={showGutter}
                    lineNumbers={lineNumbers}
                  />
                </motion.div>
              ))}
              {caret && (
                <div className="flex items-center gap-1.5 border-l-2 border-transparent px-2.5">
                  {showGutter && (
                    <span className="w-3 shrink-0 text-right text-[8px] font-medium text-muted-foreground/60 tabular-nums">
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
          <div className="flex items-center justify-between border-t bg-background px-2.5 py-1.5 text-[8px] font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="tracking-wide uppercase">{language}</span>
              <span className="text-muted-foreground/60">UTF-8</span>
            </div>
            <div className="flex items-center gap-2">
              {/* renderToString emitted `Ln <!-- -->N<!-- -->, Col 1`; three text nodes for parity */}
              <span
                dangerouslySetInnerHTML={{
                  __html: `Ln <!-- -->${activeLines.length + 1}<!-- -->, Col 1`,
                }}
              />
              <span className="text-muted-foreground/60">Spaces: 2</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
