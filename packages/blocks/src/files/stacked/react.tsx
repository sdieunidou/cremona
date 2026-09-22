import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type StackCategory =
  | "default" | "documents" | "spreadsheets" | "images" | "design" | "code"
  | "fonts" | "media" | "video" | "audio" | "archives" | "mixed";

const badgeStyles: Record<StackCategory, string> = {
  default: "border-primary bg-primary text-primary-foreground",
  documents: "border-blue-800/20 bg-blue-500 text-white",
  spreadsheets: "border-green-800/20 bg-green-600 text-white",
  images: "border-purple-800/20 bg-purple-500 text-white",
  design: "border-cyan-800/20 bg-cyan-600 text-white",
  code: "border-yellow-800/20 bg-yellow-600 text-white",
  fonts: "border-indigo-800/20 bg-indigo-500 text-white",
  media: "border-rose-800/20 bg-rose-500 text-white",
  video: "border-red-800/20 bg-red-500 text-white",
  audio: "border-pink-800/20 bg-pink-500 text-white",
  archives: "border-amber-800/20 bg-amber-600 text-white",
  mixed: "border-zinc-800/20 bg-zinc-500 text-white",
};

function Bar({ width }: { width: number }) {
  return <div className="h-1 rounded-full bg-muted" style={{ width: `${width}%` }} />;
}

function DocumentPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/30" />
      <Bar width={89} />
      <Bar width={70} />
      <Bar width={88} />
      <Bar width={67} />
      <Bar width={87} />
      <Bar width={78} />
    </div>
  );
}

function SpreadsheetPreview() {
  return (
    <div className="flex flex-col gap-0.5">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex gap-0.5">
          {[0, 1, 2].map((col) => (
            <div
              key={col}
              className={`h-2.5 flex-1 rounded-xs ${row === 0 ? `bg-green-300/30` : `bg-muted`}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ImagePreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-8 overflow-hidden rounded-xs bg-linear-to-br from-purple-200/40 to-indigo-300/40">
        <div className="absolute bottom-0.5 left-0.75 size-3 rounded-full bg-purple-300/50" />
        <div className="absolute right-1 bottom-0 h-4 w-5 rounded-t-full bg-purple-400/30" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function DesignPreview() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-0.5">
        <div className="size-2.5 rounded-xs bg-cyan-400/30" />
        <div className="size-2.5 rounded-full bg-cyan-300/40" />
        <div className="size-2.5 rounded-xs bg-cyan-400/30" />
      </div>
      <div className="h-4 w-full rounded-xs border border-dashed border-cyan-300/40" />
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function CodePreview() {
  return (
    <div className="flex flex-col gap-1">
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

function MediaPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex h-8 items-center justify-center overflow-hidden rounded-xs bg-linear-to-br from-rose-200/30 to-rose-400/20">
        <div className="size-0 border-t-4 border-b-4 border-l-[7px] border-t-transparent border-b-transparent border-l-rose-400/60" />
      </div>
      <div className="flex items-center gap-0.5">
        <div className="h-1 flex-1 rounded-full bg-rose-300/30" />
        <div className="size-1.5 rounded-full bg-rose-400/40" />
      </div>
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-xs bg-linear-to-br from-red-200/30 to-red-400/20">
        <div className="size-0 border-t-5 border-b-5 border-l-[9px] border-t-transparent border-b-transparent border-l-red-400/60" />
      </div>
      <div className="flex items-center gap-0.5">
        <div className="h-1 flex-1 rounded-full bg-red-300/30" />
        <div className="size-1.5 rounded-full bg-red-400/40" />
      </div>
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

function FontsPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5">
      <div className="font-serif text-3xl leading-none font-bold text-indigo-500/70">Aa</div>
      <Bar width={70} />
      <Bar width={50} />
    </div>
  );
}

function ArchivePreview() {
  return (
    <div className="flex flex-col items-center gap-px">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex w-full gap-0.5">
          <div className={`h-1.5 flex-1 rounded-xs ${i % 2 === 0 ? `bg-amber-300/35` : `bg-muted`}`} />
          <div className={`h-1.5 flex-1 rounded-xs ${i % 2 === 0 ? `bg-muted` : `bg-amber-300/35`}`} />
        </div>
      ))}
    </div>
  );
}

function MixedPreview() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        <div className="size-3 rounded-xs bg-blue-400/50" />
        <div className="size-3 rounded-xs bg-green-500/50" />
        <div className="size-3 rounded-full bg-purple-400/50" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-2 w-1/3 rounded-xs bg-rose-400/40" />
        <div className="h-2 w-1/3 rounded-xs bg-amber-400/40" />
        <div className="h-2 w-1/3 rounded-xs bg-cyan-400/40" />
      </div>
      <Bar width={90} />
      <Bar width={70} />
    </div>
  );
}

const previews: Record<StackCategory, () => React.ReactElement> = {
  default: DocumentPreview,
  documents: DocumentPreview,
  spreadsheets: SpreadsheetPreview,
  images: ImagePreview,
  design: DesignPreview,
  code: CodePreview,
  fonts: FontsPreview,
  media: MediaPreview,
  video: VideoPreview,
  audio: AudioPreview,
  archives: ArchivePreview,
  mixed: MixedPreview,
};

const SPREAD = { 3: 36, 5: 46, 7: 60, 9: 76 } as Record<number, number>;

function stackLayout(count: number) {
  const spread = SPREAD[count] ?? 46;
  const mid = (count - 1) / 2;
  const step = count > 1 ? spread / (count - 1) : 0;
  const angles = Array.from({ length: count }, (_, i) => (i - mid) * step);
  const front = Math.floor(count / 2);
  const zIndices = angles.map((_, i) => front - Math.abs(i - front) + 1);
  return { angles, zIndices, frontIndex: front };
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
} as const;

const card: Variants = {
  hidden: { rotate: 0, opacity: 0 },
  visible: (angle: number) => ({
    rotate: angle,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  }),
};

const label = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

export interface StackedProps extends VisualProps {
  category?: StackCategory;
  label?: string;
  count?: number;
}

export function Stacked({
  category = "default",
  label: labelText,
  count = 5,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: StackedProps) {
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

  const { angles, zIndices, frontIndex } = stackLayout(count);
  const badgeStyle = badgeStyles[category];
  const Preview = previews[category];
  const text = labelText ?? `${count} files`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
    >
      <motion.div className="relative" variants={animated ? container : undefined} {...state}>
        {angles.map((angle, i) => (
          <motion.div
            key={i}
            className={i > 0 ? `absolute top-0 left-0` : ``}
            style={{
              transformOrigin: "bottom center",
              zIndex: zIndices[i],
              ...(!animated ? { transform: `rotate(${angle}deg)` } : {}),
            }}
            custom={angle}
            variants={animated ? card : undefined}
          >
            <div
              className={`flex flex-col rounded-lg rounded-tr-2xl border p-0.75 shadow-xs dark:shadow-none ${i === frontIndex ? `border-muted bg-muted` : `border-muted/25 bg-muted/25`}`}
            >
              <div
                className={`flex h-22 w-16 flex-col rounded-md rounded-tr-xl p-3 shadow-sm dark:shadow-none dark:ring-1 dark:ring-border/50 ${i === frontIndex ? `bg-card` : `bg-card/75`}`}
              >
                {i === frontIndex && (
                  <div className="h-full">
                    <Preview />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <motion.div
          className={`absolute -bottom-3 left-1/2 z-5 max-w-32 -translate-x-1/2 truncate rounded-lg border px-1.5 py-0.75 text-xs font-medium shadow-sm ${badgeStyle}`}
          variants={animated ? label : undefined}
        >
          {text}
        </motion.div>
      </motion.div>
    </div>
  );
}
