import { useRef, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { BookOpen, CodeXml, FileText, Search, SlidersHorizontal } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface SearchResult {
  icon?: ReactNode;
  title: string;
  path: string;
  snippet: string;
  meta?: string;
}

export interface ResultsProps extends VisualProps {
  query?: string;
  stats?: string;
  filters?: string[];
  activeFilter?: number;
  results?: SearchResult[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const defaultQuery = "webhook";
const defaultStats = "128 results in 0.08s";
const defaultFilters = ["All", "Docs", "API", "Help"];
const defaultResults = [
  {
    icon: <BookOpen className="size-3" strokeWidth={2.5} />,
    title: "Webhooks overview",
    path: "docs.acme.com › guides",
    snippet: "Receive events the moment they happen, without polling.",
    meta: "Docs",
  },
  {
    icon: <CodeXml className="size-3" strokeWidth={2.5} />,
    title: "Verify webhook signatures",
    path: "docs.acme.com › api › security",
    snippet: "Every webhook request is signed with your endpoint secret.",
    meta: "API",
  },
  {
    icon: <FileText className="size-3" strokeWidth={2.5} />,
    title: "Retry policy for failed webhooks",
    path: "help.acme.com › delivery",
    snippet: "Failed deliveries retry with backoff for up to 24 hours.",
    meta: "Help",
  },
];

const FILTER_BASE_DELAY = 0.25;
const FILTER_STAGGER = 0.05;
const RESULT_BASE_DELAY = 0.4;
const RESULT_STAGGER = 0.09;
const SWEEP_PAD = 0.22;
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
    transition: { duration: 0.3, delay: 0.1, ease: "easeOut" },
  },
} as const;

const filterAnim: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: FILTER_BASE_DELAY + index * FILTER_STAGGER, ease: "easeOut" },
  }),
};

const resultAnim: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: RESULT_BASE_DELAY + index * RESULT_STAGGER,
      ease: "easeOut",
    },
  }),
};

const sweepAnim: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: (index: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.35,
      delay: RESULT_BASE_DELAY + index * RESULT_STAGGER + SWEEP_PAD,
      ease: "easeOut",
    },
  }),
};

interface Segment {
  text: string;
  match: boolean;
}

function segments(text: string, term: string): Segment[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [{ text, match: false }];
  const parts: Segment[] = [];
  const haystack = text.toLowerCase();
  let cursor = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false });
    parts.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}

function Highlight({
  text,
  term,
  index,
  animated,
  motionProps,
}: {
  text: string;
  term: string;
  index: number;
  animated: boolean;
  motionProps: Record<string, unknown>;
}) {
  return (
    <>
      {segments(text, term).map((segment, i) =>
        segment.match ? (
          <span key={i} className="relative inline-block">
            <motion.span
              className="absolute -inset-x-0.5 -inset-y-px origin-left rounded-[3px] bg-primary/10 dark:bg-primary/25"
              variants={animated ? sweepAnim : undefined}
              custom={index}
              {...motionProps}
            />
            <span className="relative font-medium text-primary">{segment.text}</span>
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function Results({
  query = defaultQuery,
  stats = defaultStats,
  filters = defaultFilters,
  activeFilter = 0,
  results = defaultResults,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  fill = false,
  className,
}: ResultsProps) {
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
  const resolvedResults = results.length ? results : defaultResults;

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
        className={`relative w-full${fill ? "" : " max-w-88"} rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
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
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <motion.div
            className="flex items-center gap-2 border-b px-3 py-2.75"
            variants={animated ? headerAnim : undefined}
            {...state}
          >
            <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {query}
            </span>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="flex size-5 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-xs hover:text-foreground"
            >
              <SlidersHorizontal className="size-3" strokeWidth={2.5} />
            </button>
          </motion.div>
          <div className="flex items-center gap-1.5 border-b px-3 py-2">
            {filters.map((filter, i) => (
              <motion.button
                key={i}
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                className={`rounded-full px-2 py-0.75 text-[9px] font-medium ${i === activeFilter ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
                variants={animated ? filterAnim : undefined}
                custom={i}
                {...state}
              >
                {filter}
              </motion.button>
            ))}
            <span className="ml-auto min-w-0 truncate text-right text-[9px] text-muted-foreground tabular-nums">
              {stats}
            </span>
          </div>
          <div className="flex flex-col divide-y">
            {resolvedResults.map((result, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5"
                variants={animated ? resultAnim : undefined}
                custom={i}
                {...state}
              >
                {result.icon && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                    {result.icon}
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[9px] text-muted-foreground">{result.path}</span>
                  <span className="line-clamp-1 text-[11px] font-semibold text-foreground">
                    <Highlight
                      text={result.title}
                      term={query}
                      index={i}
                      animated={animated}
                      motionProps={state}
                    />
                  </span>
                  <span className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                    <Highlight
                      text={result.snippet}
                      term={query}
                      index={i}
                      animated={animated}
                      motionProps={state}
                    />
                  </span>
                </div>
                {result.meta && (
                  <span className="shrink-0 rounded-full border bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {result.meta}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
