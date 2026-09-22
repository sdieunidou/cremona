import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface DocsShellProps extends VisualProps {
  /** Replace the article code card with a highlighted, line-numbered listing. */
  code?: boolean;
}

const navGroups: { title: string; items: string[]; active?: string }[] = [
  {
    title: "Getting started",
    items: ["Introduction", "Installation", "Quickstart"],
    active: "Installation",
  },
  { title: "API reference", items: ["Authentication", "Endpoints"] },
  { title: "Guides", items: ["Migrations", "Theming"] },
];

const tocItems = ["Overview", "Install", "Styles", "Next steps"] as const;

const codeLines = [
  [
    { t: "import", c: "text-primary" },
    { t: " { Button } ", c: "text-foreground" },
    { t: "from", c: "text-primary" },
    { t: ' "@cremona/blocks"', c: "text-emerald-600 dark:text-emerald-400" },
  ],
  null,
  [
    { t: "export default", c: "text-primary" },
    { t: " Page() {", c: "text-foreground" },
  ],
  [
    { t: "  return", c: "text-primary" },
    { t: " <Button", c: "text-foreground" },
    { t: " size", c: "text-rose-600 dark:text-rose-400" },
    { t: '="lg"', c: "text-emerald-600 dark:text-emerald-400" },
    { t: " />", c: "text-foreground" },
  ],
  [{ t: "}", c: "text-foreground" }],
] as const;

type CodeLine = (typeof codeLines)[number];

const shell = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const regions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
} as const;

const subRegions = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
} as const;

const region = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

function SidebarNav() {
  return (
    <motion.aside
      className="flex w-[5.75rem] shrink-0 flex-col gap-2 border-r p-2"
      aria-label="Docs navigation"
      variants={region}
    >
      {navGroups.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <span className="px-1 pb-0.5 text-[7px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            {group.title}
          </span>
          {group.items.map((item) => (
            <span
              key={item}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[9px] leading-tight",
                item === group.active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </span>
          ))}
        </div>
      ))}
    </motion.aside>
  );
}

function Article({ code }: { code: boolean }) {
  return (
    <motion.article
      className="flex min-w-0 flex-1 flex-col gap-1.5 p-2.5"
      variants={subRegions}
    >
      <motion.p
        className="text-[11px] leading-tight font-semibold tracking-tight text-foreground"
        variants={region}
      >
        Installation
      </motion.p>
      <motion.p className="text-[9px] leading-snug text-muted-foreground" variants={region}>
        Cremona ships as a single stylesheet plus per-framework adapters. Install the
        package, then import the tokens once at the root of your app.
      </motion.p>
      <motion.div className="flex flex-col gap-1" variants={region}>
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
        <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/10" />
      </motion.div>
      <motion.div
        className="rounded-lg border bg-muted p-2 font-mono text-[8px] leading-relaxed"
        variants={region}
      >
        {code ? (
          <div className="flex flex-col">
            {codeLines.map((tokens, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-2 shrink-0 text-right text-muted-foreground/50 tabular-nums">
                  {i + 1}
                </span>
                <span className="whitespace-pre">
                  {tokens &&
                    tokens.map((token, j) => (
                      <span key={j} className={token.c}>
                        {token.t}
                      </span>
                    ))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-foreground">$ npm install @cremona/blocks</span>
            <span className="text-foreground">$ npx cremona init --theme</span>
            <span className="text-muted-foreground"># added 2 packages in 1.4s</span>
          </div>
        )}
      </motion.div>
      <motion.div className="flex flex-col gap-1" variants={region}>
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/10" />
        <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/10" />
      </motion.div>
      <motion.div
        className="mt-auto flex items-center justify-between border-t pt-1.5"
        variants={region}
      >
        <span className="text-[8px] font-medium text-primary">← Quickstart</span>
        <span className="text-[8px] font-medium text-primary">Authentication →</span>
      </motion.div>
    </motion.article>
  );
}

function OnThisPage() {
  return (
    <motion.aside
      className="flex w-16 shrink-0 flex-col gap-1 border-l p-2"
      aria-label="On this page"
      variants={region}
    >
      <span className="pb-0.5 text-[7px] font-semibold tracking-wider text-foreground uppercase">
        On this page
      </span>
      {tocItems.map((item, i) => (
        <span
          key={item}
          className={cn(
            "border-l-2 py-px pl-1.5 text-[8px] leading-tight",
            i === 1
              ? "border-primary font-medium text-primary"
              : "border-transparent text-muted-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </motion.aside>
  );
}

export function DocsShell({
  code = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: DocsShellProps) {
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
        className={cn("w-full", !fill && "max-w-96", "overflow-hidden rounded-xl border bg-background shadow-xs")}
        variants={animated ? shell : undefined}
        {...state}
      >
        <motion.div className="flex h-80" variants={animated ? regions : undefined} {...state}>
          <SidebarNav />
          <Article code={code} />
          <OnThisPage />
        </motion.div>
      </motion.div>
    </div>
  );
}
