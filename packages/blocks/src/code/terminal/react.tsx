import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { Terminal as TerminalIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface TerminalLine {
  kind: "command" | "output" | "success" | "error" | "warning" | "info" | "muted";
  text: string;
  prompt?: string;
  highlight?: boolean;
}

type TerminalVariant = "install" | "deploy" | "test";

const terminalTitles: Record<TerminalVariant, string> = {
  install: "~/project",
  deploy: "~/project · deploy",
  test: "~/project · test",
};

const terminalDefaultLines: Record<TerminalVariant, TerminalLine[]> = {
  install: [
    { kind: "command", text: "npm install acme-ui" },
    { kind: "muted", text: "Resolving dependencies..." },
    { kind: "info", text: "+ acme-ui 1.0.0" },
    { kind: "info", text: "+ react-spring 9.7.0" },
    { kind: "muted", text: "Linked 42 packages in 1.2s" },
    { kind: "success", text: "✓ Installed successfully" },
    { kind: "command", text: "" },
  ],
  deploy: [
    { kind: "command", text: "deploy --env=production" },
    { kind: "muted", text: "› Building bundle..." },
    { kind: "info", text: "→ 142 routes generated" },
    { kind: "warning", text: "! 2 large chunks (> 500kb)" },
    { kind: "muted", text: "› Uploading to edge..." },
    { kind: "success", text: "✓ Deployed in 1m 42s" },
    { kind: "output", text: "https://app.example.com" },
    { kind: "command", text: "" },
  ],
  test: [
    { kind: "command", text: "pest --parallel" },
    { kind: "muted", text: "PASS  Tests\\Feature\\AuthTest" },
    { kind: "muted", text: "PASS  Tests\\Feature\\BillingTest" },
    { kind: "error", text: "FAIL  Tests\\Feature\\WebhookTest" },
    { kind: "muted", text: " ↳ handles charge.failed" },
    { kind: "info", text: "Tests:    18 passed, 1 failed" },
    { kind: "info", text: "Duration: 4.2s" },
    { kind: "command", text: "" },
  ],
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

const linesAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
} as const;

const lineAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const caretAnim: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    transition: { duration: 1, repeat: Infinity, ease: "linear" },
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

const kindColors: Record<TerminalLine["kind"], string> = {
  command: "text-foreground",
  output: "text-muted-foreground",
  success: "text-emerald-500 dark:text-emerald-400",
  error: "text-rose-500 dark:text-rose-400",
  warning: "text-amber-500 dark:text-amber-400",
  info: "text-sky-500 dark:text-sky-400",
  muted: "text-muted-foreground/70",
};

export interface TerminalProps extends VisualProps {
  variant?: TerminalVariant;
  title?: string;
  lines?: readonly TerminalLine[];
  prompt?: string;
  caret?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Terminal({
  variant = "install",
  title,
  lines,
  prompt = "$",
  caret = true,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: TerminalProps) {
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
  const resolvedTitle = title ?? terminalTitles[variant];
  const activeLines = lines ?? terminalDefaultLines[variant];

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
              <TerminalIcon className="size-2.5" strokeWidth={2.5} />
              <span className="truncate">{resolvedTitle}</span>
            </div>
            <div className="w-8.5" />
          </div>
          <motion.div
            className="flex flex-col gap-1 py-3 font-mono text-[11px] leading-tight will-change-transform"
            variants={animated ? linesAnim : undefined}
            {...state}
          >
            {activeLines.map((line, i) => {
              const isCommand = line.kind === "command";
              const isEmptyCommand = isCommand && line.text === "";
              const borderColor = line.highlight ? "border-primary" : "border-transparent";
              const bg = line.highlight ? "bg-primary/8" : "";
              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-1.5 border-l-2 px-3 ${borderColor} ${bg}`}
                  variants={animated ? lineAnim : undefined}
                >
                  {isCommand ? (
                    <>
                      <span className="text-primary">{line.prompt ?? prompt}</span>
                      <span className={`whitespace-pre-wrap ${kindColors[line.kind]}`}>
                        {line.text}
                      </span>
                      {isEmptyCommand && caret && (
                        <motion.span
                          className="inline-block h-2.5 w-1.25 bg-primary"
                          variants={animated ? caretAnim : undefined}
                          {...state}
                        />
                      )}
                    </>
                  ) : (
                    <span className={`pl-3 whitespace-pre-wrap ${kindColors[line.kind]}`}>
                      {line.text}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
