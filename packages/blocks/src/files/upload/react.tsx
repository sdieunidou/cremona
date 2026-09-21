import { useEffect, useRef, useState } from "react";
import { motion, useAnimate } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowUp, Check, LoaderCircle } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export type UploadVariant =
  | "document" | "pdf" | "image" | "video" | "audio" | "spreadsheet" | "code" | "archive";

function Bar({ width }: { width: number }) {
  return <div className="h-1 rounded-full bg-muted" style={{ width: `${width}%` }} />;
}

function DocumentPreview() {
  return (
    <div className="flex h-full flex-col gap-1">
      <Bar width={89} />
      <Bar width={70} />
      <Bar width={88} />
      <Bar width={67} />
      <Bar width={87} />
      <Bar width={78} />
      <Bar width={86} />
    </div>
  );
}

function PdfPreview() {
  return (
    <div className="flex h-full flex-col gap-1.75">
      <div className="h-1.5 w-3/5 rounded-full bg-muted-foreground/30" />
      <div className="flex flex-col gap-1">
        <Bar width={92} />
        <Bar width={80} />
        <Bar width={85} />
      </div>
      <div className="h-px bg-muted" />
      <div className="flex flex-col gap-1">
        <Bar width={78} />
        <Bar width={90} />
      </div>
    </div>
  );
}

function ImagePreview() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="relative h-10 overflow-hidden rounded-xs bg-linear-to-br from-purple-200/40 to-indigo-300/40">
        <div className="absolute bottom-0.5 left-0.75 size-3 rounded-full bg-purple-300/50" />
        <div className="absolute right-1 bottom-0 h-4 w-5 rounded-t-full bg-purple-400/30" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-xs bg-linear-to-br from-red-200/30 to-red-400/20">
        <div className="size-0 border-t-5 border-b-5 border-l-[9px] border-t-transparent border-b-transparent border-l-red-400/60" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function AudioPreview() {
  return (
    <div className="flex h-full items-end justify-center gap-0.5 py-1">
      {[40, 70, 55, 85, 45, 75, 50].map((height, i) => (
        <div key={i} className="w-1 rounded-full bg-pink-300/40" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function SpreadsheetPreview() {
  return (
    <div className="flex h-full flex-col gap-0.5">
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex gap-0.5">
          {[0, 1, 2].map((col) => (
            <div
              key={col}
              className={`h-2 flex-1 rounded-xs ${row === 0 ? `bg-green-300/30` : `bg-muted`}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CodePreview() {
  return (
    <div className="flex h-full flex-col gap-1">
      <div className="h-1.5 w-1/6 rounded-full bg-yellow-300/40" />
      <div className="flex flex-col gap-1 pl-2">
        <div className="flex gap-1">
          <div className="h-1 w-1/4 rounded-full bg-yellow-300/30" />
          <div className="h-1 w-2/5 rounded-full bg-muted" />
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1/3 rounded-full bg-yellow-300/30" />
          <div className="h-1 w-1/4 rounded-full bg-muted" />
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-1/5 rounded-full bg-yellow-300/30" />
          <div className="h-1 w-1/3 rounded-full bg-muted" />
        </div>
      </div>
      <div className="h-1.5 w-1/6 rounded-full bg-yellow-300/40" />
    </div>
  );
}

function ArchivePreview() {
  return (
    <div className="flex h-full flex-col items-center gap-px">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex w-full gap-0.5">
          <div className={`h-1.5 flex-1 rounded-xs ${i % 2 === 0 ? `bg-amber-300/35` : `bg-muted`}`} />
          <div className={`h-1.5 flex-1 rounded-xs ${i % 2 === 0 ? `bg-muted` : `bg-amber-300/35`}`} />
        </div>
      ))}
    </div>
  );
}

const previews: Record<UploadVariant, () => React.ReactElement> = {
  document: DocumentPreview,
  pdf: PdfPreview,
  image: ImagePreview,
  video: VideoPreview,
  audio: AudioPreview,
  spreadsheet: SpreadsheetPreview,
  code: CodePreview,
  archive: ArchivePreview,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TIMING = {
  initialDelay: 0,
  slideIn: 0.4,
  pauseBeforeSpin: 0,
  badgeSwap: 0,
  progressFill: 3.5,
  colorChange: 0,
  pauseBeforeExit: 0,
  slideOut: 0.25,
  pauseBetweenCycles: 150,
} as const;

export interface UploadProps extends VisualProps {
  variant?: UploadVariant;
  hover?: boolean;
}

export function Upload({
  variant = "document",
  animated = false,
  trigger = "inView",
  hover = false,
  className,
}: UploadProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();
  const inViewOnce = useInView(rootRef, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(rootRef, { once: false, amount: 0.5 });
  const [isHovering, setIsHovering] = useState(false);
  const inView = trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const active = hover ? isHovering : inView;
  const Preview = previews[variant];

  useEffect(() => {
    if (!animated) return;
    if (!inView) {
      animate(".file-card", { y: 60, opacity: 0 }, { duration: 0 });
      return;
    }
    if (!active) {
      animate(".file-card", { y: 0, opacity: 1 }, { duration: 0.3, ease: [0, 0, 0.2, 1] });
      animate(".file-content", { clipPath: "inset(0 0 0% 0)" }, { duration: 0.3 });
      animate(
        ".progress-fill",
        { width: "65%", backgroundColor: "var(--color-primary)" },
        { duration: 0.3 },
      );
      animate(".arrow-badge", { scale: 1, opacity: 1 }, { duration: 0.2 });
      animate(".spinner-badge", { scale: 0, opacity: 0 }, { duration: 0 });
      animate(".check-badge", { scale: 0, opacity: 0 }, { duration: 0 });
      return;
    }
    let cancelled = false;
    async function run() {
      try {
        for (;;) {
          animate(".file-card", { y: 60, opacity: 0 }, { duration: 0 });
          animate(".file-content", { clipPath: "inset(0 0 100% 0)" }, { duration: 0 });
          animate(
            ".progress-fill",
            { width: "0%", backgroundColor: "var(--color-primary)" },
            { duration: 0 },
          );
          animate(".arrow-badge", { scale: 1, opacity: 1 }, { duration: 0 });
          animate(".spinner-badge", { scale: 0, opacity: 0 }, { duration: 0 });
          animate(".check-badge", { scale: 0, opacity: 0 }, { duration: 0 });
          await wait(TIMING.initialDelay);
          if (cancelled) return;
          animate(".file-content", { clipPath: "inset(0 0 100% 0)" }, { duration: 0 });
          animate(
            ".progress-fill",
            { width: "0%", backgroundColor: "var(--color-primary)" },
            { duration: 0 },
          );
          animate(".arrow-badge", { scale: 1, opacity: 1 }, { duration: 0 });
          animate(".spinner-badge", { scale: 0, opacity: 0 }, { duration: 0 });
          animate(".check-badge", { scale: 0, opacity: 0 }, { duration: 0 });
          animate(
            ".file-content",
            { clipPath: "inset(0 0 0% 0)" },
            { duration: 0.4, delay: 0.2, ease: "easeOut" },
          );
          await animate(".file-card", { y: 0, opacity: 1 }, { duration: TIMING.slideIn, ease: [0, 0, 0.2, 1] });
          if (cancelled) return;
          await wait(TIMING.pauseBeforeSpin);
          if (cancelled) return;
          animate(".arrow-badge", { scale: 0, opacity: 0 }, { duration: TIMING.badgeSwap, ease: "linear" });
          await animate(".spinner-badge", { scale: 1, opacity: 1 }, { type: "spring", stiffness: 200, damping: 14 });
          if (cancelled) return;
          await animate(".progress-fill", { width: "100%" }, { duration: TIMING.progressFill, ease: [0.4, 0, 0.2, 1] });
          if (cancelled) return;
          await animate(
            ".progress-fill",
            { backgroundColor: "var(--color-emerald-500)" },
            { duration: TIMING.colorChange, ease: "easeOut" },
          );
          if (cancelled) return;
          animate(".spinner-badge", { scale: 0, opacity: 0 }, { duration: TIMING.badgeSwap, ease: "easeIn" });
          await animate(".check-badge", { scale: 1, opacity: 1 }, { type: "spring", stiffness: 200, damping: 14 });
          if (cancelled) return;
          await wait(TIMING.pauseBeforeExit);
          if (cancelled) return;
          await animate(".file-card", { y: -60, opacity: 0 }, { duration: TIMING.slideOut, ease: [0.4, 0, 1, 1] });
          if (cancelled) return;
          animate(".file-card", { y: 60, opacity: 0 }, { duration: 0 });
          await wait(TIMING.pauseBetweenCycles);
        }
      } catch {
        /* scope unmounted */
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [animated, inView, active, animate]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setIsHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setIsHovering(false) : undefined}
    >
      <div className="absolute inset-y-0 w-4 mask-t-from-75% mask-b-from-75%">
        {[0, 1].map((side) => (
          <motion.div
            key={side}
            className={`absolute inset-y-0 w-px bg-[repeating-linear-gradient(to_bottom,var(--color-border)_0px,var(--color-border)_4px,transparent_4px,transparent_8px)] ${side === 0 ? `left-0` : `right-0`}`}
            animate={animated && active ? { backgroundPositionY: [0, -8] } : undefined}
            transition={animated && active ? { duration: 0.5, repeat: Infinity, ease: "linear" } : undefined}
          />
        ))}
      </div>
      <div ref={scope}>
        <div
          className="file-card relative flex flex-col rounded-lg rounded-tr-2xl border border-muted bg-muted p-0.75 shadow-xs dark:shadow-none"
          style={animated ? { opacity: 0, transform: "translateY(60px)" } : undefined}
        >
          <div className="arrow-badge absolute bottom-5.75 -left-1.75 z-1 flex items-center justify-center rounded-lg border border-primary bg-primary p-1 text-primary-foreground shadow-sm">
            <ArrowUp size={14} strokeWidth={2.5} />
          </div>
          <div
            className="spinner-badge absolute bottom-5.75 -left-1.75 z-1 flex items-center justify-center rounded-lg border border-primary bg-primary p-1 text-primary-foreground shadow-sm"
            style={animated ? { opacity: 0 } : { display: "none" }}
          >
            <LoaderCircle size={14} className="animate-spin" strokeWidth={2.5} />
          </div>
          <div
            className="check-badge absolute bottom-5.75 -left-1.75 z-1 flex items-center justify-center rounded-lg border border-emerald-800/20 bg-emerald-500 p-1 shadow-sm"
            style={animated ? { opacity: 0 } : { display: "none" }}
          >
            <Check size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex h-22 w-16 flex-col gap-1.5 rounded-md rounded-tr-xl bg-card p-3 shadow-sm dark:shadow-none dark:ring-1 dark:ring-border/50">
            <div
              className="file-content h-full"
              style={animated ? { clipPath: "inset(0 0 100% 0)" } : undefined}
            >
              <Preview />
            </div>
          </div>
          <div className="mx-1 mt-1 mb-px h-1 overflow-hidden rounded-full bg-muted-foreground/10">
            <div
              className="progress-fill h-full rounded-full bg-primary"
              style={{ width: animated ? "0%" : "65%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
