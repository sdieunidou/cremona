import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, type VisualProps } from "@cremona/core";

export type FileType =
  | "docx" | "psd" | "pdf" | "xlsx" | "png" | "jpg" | "webp" | "fig" | "csv"
  | "txt" | "md" | "zip" | "mp4" | "mp3" | "json" | "sql" | "svg" | "pptx"
  | "php" | "js" | "py" | "html" | "css" | "ts" | "jsx" | "tsx";

const badgeStyles: Record<FileType, string> = {
  docx: "border-blue-800/20 bg-blue-500",
  psd: "border-cyan-800/20 bg-cyan-600",
  pdf: "border-red-800/20 bg-red-500",
  xlsx: "border-green-800/20 bg-green-600",
  png: "border-purple-800/20 bg-purple-500",
  jpg: "border-fuchsia-800/20 bg-fuchsia-500",
  webp: "border-lime-800/20 bg-lime-600",
  fig: "border-orange-800/20 bg-orange-500",
  csv: "border-emerald-800/20 bg-emerald-500",
  txt: "border-zinc-800/20 bg-zinc-500",
  md: "border-slate-800/20 bg-slate-600",
  zip: "border-amber-800/20 bg-amber-600",
  mp4: "border-rose-800/20 bg-rose-500",
  mp3: "border-pink-800/20 bg-pink-500",
  json: "border-yellow-800/20 bg-yellow-600",
  sql: "border-cyan-800/20 bg-cyan-700",
  svg: "border-teal-800/20 bg-teal-500",
  pptx: "border-orange-800/20 bg-orange-600",
  php: "border-violet-800/20 bg-violet-600",
  js: "border-yellow-800/20 bg-yellow-500",
  py: "border-blue-800/20 bg-blue-600",
  html: "border-orange-800/20 bg-orange-700",
  css: "border-sky-800/20 bg-sky-500",
  ts: "border-blue-800/20 bg-blue-700",
  jsx: "border-cyan-800/20 bg-cyan-500",
  tsx: "border-indigo-800/20 bg-indigo-600",
};

function Bar({ width }: { width: number }) {
  return <div className="h-1 rounded-full bg-muted" style={{ width: `${width}%` }} />;
}

function DocxPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 w-2/3 rounded-full bg-muted-foreground/30" />
      <Bar width={70} />
      <Bar width={88} />
      <Bar width={67} />
      <Bar width={87} />
      <Bar width={78} />
      <Bar width={86} />
      <Bar width={95} />
    </div>
  );
}

function PsdPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-6 rounded-xs bg-linear-to-br from-cyan-300/40 to-blue-400/40" />
      <div className="flex gap-1">
        <div className="h-3 w-1/2 rounded-xs bg-purple-300/30" />
        <div className="h-3 w-1/2 rounded-xs bg-pink-300/30" />
      </div>
      <div className="h-4 rounded-xs bg-cyan-200/25" />
    </div>
  );
}

function PdfPreview() {
  return (
    <div className="flex flex-col gap-1.75">
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

function XlsxPreview() {
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

function PngPreview() {
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

function JpgPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-8 overflow-hidden rounded-xs bg-linear-to-b from-fuchsia-200/40 to-fuchsia-400/30">
        <div className="absolute top-1 right-1 size-2.5 rounded-full bg-fuchsia-300/70" />
        <div className="absolute bottom-0 h-3 w-full bg-fuchsia-500/20" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function WebpPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-8 overflow-hidden rounded-xs bg-linear-to-br from-lime-200/40 to-green-300/40">
        <div className="absolute top-1 left-1 size-3 rounded-xs bg-lime-400/40" />
        <div className="absolute right-1 bottom-1 size-2 rounded-full bg-lime-500/50" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function FigPreview() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-0.5">
        <div className="size-2.5 rounded-xs bg-orange-400/30" />
        <div className="size-2.5 rounded-full bg-orange-300/40" />
        <div className="size-2.5 rounded-xs bg-orange-400/30" />
      </div>
      <div className="h-4 w-full rounded-xs border border-dashed border-orange-300/40" />
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function CsvPreview() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex items-center gap-0.5">
          <div className={`h-1 rounded-full ${row === 0 ? `w-2/5 bg-emerald-300/40` : `w-2/5 bg-muted`}`} />
          <div className={`h-1 rounded-full ${row === 0 ? `w-2/5 bg-emerald-300/40` : `w-2/5 bg-muted`}`} />
          <div className={`h-1 rounded-full ${row === 0 ? `w-4/5 bg-emerald-300/40` : `w-4/5 bg-muted`}`} />
        </div>
      ))}
    </div>
  );
}

function TxtPreview() {
  return (
    <div className="flex flex-col gap-1.75">
      <Bar width={75} />
      <Bar width={92} />
      <Bar width={60} />
      <Bar width={85} />
      <Bar width={60} />
      <Bar width={85} />
    </div>
  );
}

function MdPreview() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-xs bg-slate-400/50" />
        <div className="h-1.5 w-1/2 rounded-full bg-slate-400/40" />
      </div>
      <Bar width={90} />
      <Bar width={70} />
      <div className="flex items-center gap-1">
        <div className="size-1 rounded-xs bg-slate-400/50" />
        <div className="h-1 w-2/5 rounded-full bg-slate-400/30" />
      </div>
      <Bar width={85} />
      <Bar width={65} />
    </div>
  );
}

function ZipPreview() {
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

function Mp4Preview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex h-8 items-center justify-center overflow-hidden rounded-xs bg-linear-to-br from-rose-200/30 to-rose-400/20">
        <div className="h-0 w-0 border-t-4 border-b-4 border-l-[7px] border-t-transparent border-b-transparent border-l-rose-400/60" />
      </div>
      <div className="flex items-center gap-0.5">
        <div className="h-1 flex-1 rounded-full bg-rose-300/30" />
        <div className="size-1.5 rounded-full bg-rose-400/40" />
      </div>
    </div>
  );
}

function Mp3Preview() {
  return (
    <div className="flex h-full items-end justify-center gap-0.5 py-1">
      {[40, 70, 55, 85, 45, 75, 50].map((height, i) => (
        <div key={i} className="w-1 rounded-full bg-pink-300/40" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function JsonPreview() {
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

function SqlPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-cyan-400/50" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/5 rounded-full bg-cyan-400/40" />
        <div className="h-1 w-1/3 rounded-full bg-muted" />
      </div>
      <div className="h-px bg-muted" />
      <div className="flex flex-col gap-0.5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-0.5">
            <div className="h-1 flex-1 rounded-xs bg-muted" />
            <div className="h-1 flex-1 rounded-xs bg-muted" />
            <div className="h-1 flex-1 rounded-xs bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SvgPreview() {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="relative h-8 w-full rounded-xs bg-teal-200/15">
        <div className="absolute top-1 left-1 size-2.5 rounded-full border border-teal-400/50" />
        <div className="absolute right-2 bottom-1 size-0 border-r-8 border-b-8 border-l-8 border-r-transparent border-b-teal-400/40 border-l-transparent" />
        <div className="absolute top-2 right-1 size-1 rounded-full bg-teal-300/60" />
      </div>
      <Bar width={100} />
      <Bar width={75} />
    </div>
  );
}

function PptxPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-5 flex-col justify-center rounded-xs bg-orange-200/20 px-1.5">
        <div className="h-1 w-3/4 rounded-full bg-orange-300/40" />
      </div>
      <div className="flex gap-0.75">
        <div className="h-4 flex-1 rounded-xs bg-orange-300/20" />
        <div className="flex h-4 flex-2 flex-col justify-center gap-0.75 rounded-xs bg-muted/60 px-1">
          <div className="h-0.75 w-full rounded-full bg-muted" />
          <div className="h-0.75 w-2/3 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

function PhpPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1 w-2/5 rounded-full bg-violet-300/40" />
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-violet-300/30" />
        <div className="h-1 w-2/5 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/3 rounded-full bg-violet-300/30" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/5 rounded-full bg-violet-300/30" />
        <div className="h-1 w-2/5 rounded-full bg-muted" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-violet-300/40" />
    </div>
  );
}

function JsPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-yellow-300/40" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-yellow-300/30" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-yellow-300/30" />
        <div className="h-1 w-2/5 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/3 rounded-full bg-yellow-300/30" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-yellow-300/40" />
    </div>
  );
}

function PyPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
        <div className="h-1 w-1/3 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-yellow-400/40" />
        <div className="h-1 w-1/3 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/5 rounded-full bg-blue-400/40" />
        <div className="h-1 w-2/5 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-yellow-400/40" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
    </div>
  );
}

function HtmlPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1 w-1/3 rounded-full bg-orange-400/50" />
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-2/5 rounded-full bg-orange-400/40" />
      </div>
      <div className="flex gap-1 pl-4">
        <div className="h-1 w-1/3 rounded-full bg-muted" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/3 rounded-full bg-orange-400/40" />
      </div>
      <div className="h-1 w-1/3 rounded-full bg-orange-400/50" />
    </div>
  );
}

function CssPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/4 rounded-full bg-sky-300/40" />
        <div className="h-1 w-1/6 rounded-full bg-sky-300/40" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-sky-300/30" />
        <div className="h-1 w-1/3 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/5 rounded-full bg-sky-300/30" />
        <div className="h-1 w-2/5 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/3 rounded-full bg-sky-300/30" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="h-1 w-1/12 rounded-full bg-sky-300/40" />
    </div>
  );
}

function TsPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-blue-400/40" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/4 rounded-full bg-blue-400/40" />
        <div className="h-1 w-1/5 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-blue-400/40" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-1/3 rounded-full bg-blue-400/40" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
    </div>
  );
}

function JsxPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-yellow-300/40" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-2/5 rounded-full bg-cyan-300/40" />
      </div>
      <div className="flex gap-1 pl-4">
        <div className="h-1 w-1/3 rounded-full bg-muted" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-2/5 rounded-full bg-cyan-300/40" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-yellow-300/40" />
    </div>
  );
}

function TsxPreview() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
        <div className="h-1 w-1/6 rounded-full bg-blue-400/40" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-2/5 rounded-full bg-indigo-300/40" />
      </div>
      <div className="flex gap-1 pl-4">
        <div className="h-1 w-1/3 rounded-full bg-muted" />
        <div className="h-1 w-1/4 rounded-full bg-muted" />
      </div>
      <div className="flex gap-1 pl-2">
        <div className="h-1 w-2/5 rounded-full bg-indigo-300/40" />
      </div>
      <div className="h-1 w-1/5 rounded-full bg-blue-400/50" />
    </div>
  );
}

const previews: Record<FileType, () => React.ReactElement> = {
  docx: DocxPreview,
  psd: PsdPreview,
  pdf: PdfPreview,
  xlsx: XlsxPreview,
  png: PngPreview,
  jpg: JpgPreview,
  webp: WebpPreview,
  fig: FigPreview,
  csv: CsvPreview,
  txt: TxtPreview,
  md: MdPreview,
  zip: ZipPreview,
  mp4: Mp4Preview,
  mp3: Mp3Preview,
  json: JsonPreview,
  sql: SqlPreview,
  svg: SvgPreview,
  pptx: PptxPreview,
  php: PhpPreview,
  js: JsPreview,
  py: PyPreview,
  html: HtmlPreview,
  css: CssPreview,
  ts: TsPreview,
  jsx: JsxPreview,
  tsx: TsxPreview,
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const page = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.4, delay: 0.2, ease: "easeOut" },
  },
} as const;

const badge = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14, delay: 0.5 },
  },
} as const;

export interface SimpleFileProps extends VisualProps {
  extension?: FileType;
}

export function SimpleFile({
  extension = "docx",
  animated = false,
  trigger = "inView",
  className,
}: SimpleFileProps) {
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

  const badgeStyle = badgeStyles[extension];
  const Preview = previews[extension];

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
        className="relative flex flex-col rounded-lg rounded-tr-2xl border border-muted bg-muted p-0.75 shadow-xs dark:shadow-none"
        variants={animated ? container : undefined}
        {...state}
      >
        <motion.div
          className={`absolute bottom-3.5 -left-1.75 z-1 rounded-lg border px-1.5 py-0.75 text-xs font-medium text-white shadow-sm ${badgeStyle}`}
          variants={animated ? badge : undefined}
          {...state}
        >
          .{extension}
        </motion.div>
        <div className="flex h-22 w-16 flex-col gap-1.5 rounded-md rounded-tr-xl bg-card p-3 shadow-sm dark:shadow-none dark:ring-1 dark:ring-border/50">
          <motion.div className="h-full" variants={animated ? page : undefined} {...state}>
            <Preview />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
