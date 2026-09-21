import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Image,
  LayoutGrid,
  Search,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

interface ExplorerFile {
  name: string;
  ext: string;
}

const files: ExplorerFile[] = [
  { name: "Brand", ext: "fig" },
  { name: "Hero", ext: "png" },
  { name: "Notes", ext: "md" },
  { name: "Budget", ext: "xlsx" },
  { name: "Promo", ext: "mp4" },
  { name: "Cover", ext: "jpg" },
  { name: "Deck", ext: "pdf" },
  { name: "Logo", ext: "svg" },
];

const sidebarItems: { icon: LucideIcon; label: string; active: boolean }[] = [
  { icon: Folder, label: "All Files", active: true },
  { icon: Star, label: "Starred", active: false },
  { icon: Image, label: "Photos", active: false },
  { icon: LayoutGrid, label: "Projects", active: false },
];

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

const grid = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.6 + i * 0.05, ease: "easeOut" },
  }),
};

const glow = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veil = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const gridVariants: Variants[] = files.map((_, i) => ({
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.6 + i * 0.05, ease: "easeOut" },
  },
}));

export interface ExplorerProps extends VisualProps {
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Explorer({
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: ExplorerProps) {
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
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
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
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <div className="flex gap-1.5">
              <div className="size-2 rounded-full bg-rose-400" />
              <div className="size-2 rounded-full bg-amber-400" />
              <div className="size-2 rounded-full bg-emerald-400" />
            </div>
            <motion.div
              className="flex items-center gap-0.5"
              variants={animated ? chrome : undefined}
            >
              <button
                type="button"
                className="flex size-4 items-center justify-center rounded-md text-muted-foreground hover:bg-background/75"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronLeft className="size-2.5" />
              </button>
              <button
                type="button"
                className="flex size-4 items-center justify-center rounded-md text-muted-foreground hover:bg-background/75"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronRight className="size-2.5" />
              </button>
            </motion.div>
            <motion.div
              className="flex h-5 flex-1 items-center gap-1 rounded-xl bg-background/75 px-2"
              variants={animated ? chrome : undefined}
            >
              <Search className="size-2.5 text-muted-foreground" />
              <span className="truncate text-[10px] text-muted-foreground">Search files</span>
            </motion.div>
            <motion.button
              type="button"
              className="relative z-1 flex size-5 items-center justify-center rounded-full bg-background/75 shadow-sm hover:bg-background"
              variants={animated ? chrome : undefined}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
            >
              <LayoutGrid className="size-2.5" />
            </motion.button>
          </div>
          <motion.div
            className="h-56 rounded-xl border bg-background p-2"
            variants={animated ? viewport : undefined}
            {...state}
          >
            <div className="flex h-full gap-2">
              <div className="flex w-18 flex-col gap-0.5 border-r border-muted pr-1.5">
                <div className="px-1 pb-0.5 text-[7px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                  Library
                </div>
                {sidebarItems.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-1 rounded px-1 py-0.5 text-[9px] font-medium ${active ? `bg-primary/7 text-primary` : `text-muted-foreground`}`}
                  >
                    <Icon className="size-2.5 opacity-60" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
                <div className="mt-2 px-1 pb-0.5 text-[7px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                  Tags
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 px-1">
                    <div className="size-1.5 rounded-full bg-primary/50" />
                    <div className="h-0.5 w-6 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <div className="size-1.5 rounded-full bg-amber-500/50" />
                    <div className="h-0.5 w-5 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <div className="size-1.5 rounded-full bg-emerald-500/50" />
                    <div className="h-0.5 w-7 rounded-full bg-muted-foreground/30" />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
                    <ChevronRight className="size-2 text-muted-foreground/25" />
                    <div className="h-1 w-6 rounded-full bg-muted-foreground/15" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-1 rounded-full bg-muted-foreground/20" />
                    <div className="size-1 rounded-full bg-muted-foreground/20" />
                    <div className="size-1 rounded-full bg-muted-foreground/20" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {files.map((file, i) => (
                    <motion.div
                      key={file.name}
                      custom={i}
                      variants={animated ? gridVariants[i] : undefined}
                      className={`flex flex-col items-center gap-1.5 rounded-lg p-2 ${i === 1 ? `bg-primary/8 ring-1 ring-primary/20` : `ring-1 ring-transparent`}`}
                    >
                      <div className="relative h-6 w-5 rounded-[3px] bg-primary/12">
                        <div className="absolute top-0 right-0 size-1.5 rounded-bl-[3px] bg-primary/15" />
                      </div>
                      <div className="h-0.5 w-3/5 rounded-full bg-muted-foreground/20" />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-muted pt-1.5">
                  <div className="h-0.5 w-10 rounded-full bg-muted-foreground/15" />
                  <div className="h-0.5 w-6 rounded-full bg-muted-foreground/15" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
