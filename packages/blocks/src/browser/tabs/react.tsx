import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowRight, X } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const containerIso = {
  hidden: { opacity: 0, transform: "rotateX(0deg) rotateZ(0deg)" },
  visible: {
    opacity: 1,
    transform: "rotateX(45deg) rotateZ(-45deg)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const chrome = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2, ease: "easeOut" } },
} as const;

const viewport = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, delay: 0.2, ease: "easeOut" } },
} as const;

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

function OverviewContent() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="size-2.5 rounded-full bg-primary" />
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="h-2.5 w-6 rounded-md bg-primary" />
      </div>
      <div className="flex flex-col items-center gap-1 pt-3">
        <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/25" />
        <div className="h-1 w-2/5 rounded-full bg-muted-foreground/15" />
        <div className="h-1 w-1/3 rounded-full bg-muted-foreground/15" />
        <div className="mt-1 flex gap-1">
          <div className="h-3 w-8 rounded-md bg-primary" />
          <div className="h-3 w-8 rounded-md border border-muted-foreground/15" />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-lg bg-muted/60 p-1.5">
            <div className="size-2 rounded-full bg-muted-foreground/25" />
            <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
            <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/15" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1 w-6 rounded-full bg-muted-foreground/10" />
        ))}
      </div>
    </div>
  );
}

function PricingContent() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="size-2.5 rounded-full bg-primary" />
        <div className="flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="h-2.5 w-6 rounded-md bg-primary" />
      </div>
      <div className="flex flex-col items-center gap-1 pt-2">
        <div className="h-1.5 w-2/5 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3/5 rounded-full bg-muted-foreground/15" />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        {[false, true, false].map((featured, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1.5 rounded-md p-2 ${featured ? `bg-primary` : `bg-muted/60`}`}
          >
            <div className={`h-1 w-3/5 rounded-full ${featured ? `bg-background/60` : `bg-muted-foreground/20`}`} />
            <div className={`h-2.5 w-4/5 rounded-full ${featured ? `bg-background` : `bg-muted-foreground/35`}`} />
            <div className={`mt-auto h-3 rounded-sm ${featured ? `bg-background` : `bg-muted-foreground/20`}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsContent() {
  return (
    <div className="flex h-full gap-3">
      <div className="flex w-14 flex-col gap-1.5 border-r border-muted pr-2">
        <div className="h-2 w-full rounded-md bg-primary" />
        <div className="h-2 w-4/5 rounded-md bg-muted-foreground/10" />
        <div className="h-2 w-3/5 rounded-md bg-muted-foreground/10" />
        <div className="h-2 w-4/5 rounded-md bg-muted-foreground/10" />
        <div className="h-2 w-3/5 rounded-md bg-muted-foreground/10" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-2 w-3/5 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-full rounded-full bg-muted-foreground/15" />
        <div className="h-1 w-5/6 rounded-full bg-muted-foreground/15" />
        <div className="mt-1 flex flex-1 flex-col justify-center gap-1 rounded-md bg-muted/60 p-2">
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-1/2 rounded-full bg-muted-foreground/25" />
          <div className="h-1 w-3/5 rounded-full bg-muted-foreground/25" />
        </div>
      </div>
    </div>
  );
}

export interface TabsProps extends VisualProps {
  tabs?: string[];
  url?: string;
  hover?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Tabs({
  tabs = ["Overview", "Pricing", "Docs"],
  url = "app.example.com",
  animated = false,
  trigger = "inView",
  hover = false,
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: TabsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const isActive = hover ? isHovering : inView;

  useEffect(() => {
    if (!animated || !isActive) return;
    const interval = setInterval(() => {
      setActiveTab((tab) => (tab + 1) % tabs.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [animated, isActive, tabs.length]);

  const state = animated
    ? {
        initial: "hidden",
        animate: inView ? "visible" : "hidden",
      }
    : {};

  return (
    <div
      ref={ref}
      aria-hidden="true"
      inert={!animated}
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setIsHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setIsHovering(false) : undefined}
    >
      <motion.div
        className={`relative w-full max-w-90 rounded-2xl border border-border/50 bg-muted/75 px-1.5 pb-1.5 ${fadeOut ? `mask-b-from-60%` : ``}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? containerIso : container) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glow : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-background/75 mask-t-from-50% shadow-xs"
              variants={animated ? veil : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative flex flex-col">
          <motion.div
            className="flex items-center gap-2 px-1.5 pt-1.5"
            variants={animated ? chrome : undefined}
          >
            <div className="flex gap-1.5">
              <div className="size-2 rounded-full bg-rose-400" />
              <div className="size-2 rounded-full bg-amber-400" />
              <div className="size-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex flex-1 items-center gap-1 overflow-hidden">
              {tabs.map((tab, i) => {
                const active = i === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setActiveTab(i)}
                    className={`flex h-5 items-center gap-1 rounded-full px-2 text-[9px] font-medium transition-colors ${active ? `bg-background text-foreground` : `text-muted-foreground hover:bg-background/50`}`}
                  >
                    <span className={`size-1.5 rounded-full ${active ? `bg-primary` : `bg-muted-foreground/40`}`} />
                    <span>{tab}</span>
                    <X className="size-2 opacity-50" />
                  </button>
                );
              })}
            </div>
          </motion.div>
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <motion.div
              className="flex h-5 flex-1 items-center rounded-xl bg-background/75 px-2"
              variants={animated ? chrome : undefined}
            >
              {/* dynamic array child → React emits <!-- --> text separators like the POC SSR */}
              <span className="truncate text-[10px] text-muted-foreground">
                {[url, "/", tabs[activeTab]?.toLowerCase()]}
              </span>
            </motion.div>
            <motion.button
              type="button"
              className="relative z-1 flex size-5 items-center justify-center rounded-full bg-background/75 shadow-sm hover:bg-background"
              variants={animated ? chrome : undefined}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ArrowRight className="size-2.5" />
            </motion.button>
          </div>
          <motion.div
            className="relative h-56 overflow-hidden rounded-xl border bg-background p-3"
            variants={animated ? viewport : undefined}
            {...state}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="mx-auto flex h-full w-full max-w-56 flex-col"
                initial={animated ? { opacity: 0, y: 8 } : false}
                animate={animated ? { opacity: 1, y: 0 } : undefined}
                exit={animated ? { opacity: 0, y: -8 } : undefined}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {activeTab === 0 && <OverviewContent />}
                {activeTab === 1 && <PricingContent />}
                {activeTab === 2 && <DocsContent />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
