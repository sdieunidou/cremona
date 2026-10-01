"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useInView, useLoopActive } from "@cremona/react";
import { Check, Minus } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export type TableTone = "success" | "warning" | "destructive" | "info" | "neutral";

export interface TableColumn {
  key: string;
  label: string;
  /** "right" also sets tabular figures, for amounts. */
  align?: "left" | "right";
}

/** A text cell, or a two-line cell (`secondary`), or a status pill (`tone`). */
export type TableCell = string | { text: string; secondary?: string; tone?: TableTone };

export interface TableRow {
  cells: Record<string, TableCell>;
  /** Selected on first render. */
  checked?: boolean;
}

export interface TableProps extends VisualProps {
  /** Selection column. */
  checkboxes?: boolean;
  /** Placeholder rows instead of the data. */
  loading?: boolean;
  /** Columns (default: member, status, amount). */
  columns?: TableColumn[];
  /** Rows, keyed by column (default: four members). */
  rows?: TableRow[];
  /** Number of placeholder rows while loading. */
  loadingRows?: number;
  /** Visually hidden table caption. */
  caption?: string;
  /** Full width and height of the box. */
  fill?: boolean;
}

const NO_REF = { current: null };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const demoColumns: TableColumn[] = [
  { key: "member", label: "Member" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount", align: "right" },
];

const demoRows: TableRow[] = [
  {
    cells: {
      member: { text: "Olivia Martin", secondary: "olivia@acme.co" },
      status: { text: "Active", tone: "success" },
      amount: "$1,999.00",
    },
    checked: true,
  },
  {
    cells: {
      member: { text: "Isabella Nguyen", secondary: "isabella@acme.co" },
      status: { text: "Active", tone: "success" },
      amount: "$3,240.00",
    },
    checked: true,
  },
  {
    cells: {
      member: { text: "Liam Chen", secondary: "liam@acme.co" },
      status: { text: "Pending", tone: "warning" },
      amount: "$820.00",
    },
  },
  {
    cells: {
      member: { text: "Noah Williams", secondary: "noah@acme.co" },
      status: { text: "Inactive", tone: "neutral" },
      amount: "$2,150.00",
    },
  },
];

const toneClasses: Record<TableTone, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  info: "bg-info/10 text-info ring-info/20",
  neutral: "bg-muted text-muted-foreground ring-border",
};

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const rowsIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

function CheckboxBox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean | "indeterminate";
  label: string;
  onToggle: () => void;
}) {
  const on = checked !== false;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === "indeterminate" ? "mixed" : checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200",
        focusRing,
        on
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/80 bg-background dark:bg-input/30",
      )}
    >
      {checked === "indeterminate" ? (
        <Minus className="size-3" />
      ) : (
        checked && <Check className="size-3" />
      )}
    </button>
  );
}

function cellText(cell: TableCell | undefined): string {
  return cell === undefined ? "" : typeof cell === "string" ? cell : cell.text;
}

export function Table({
  checkboxes = false,
  loading = false,
  columns = demoColumns,
  rows = demoRows,
  loadingRows = 3,
  caption,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: TableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(() => rows.map((row) => !!row.checked));
  const inViewOnce = useInView(animated && trigger === "inView" ? ref : NO_REF, {
    once: true,
    amount: 0.5,
  });
  const inViewRepeat = useInView(animated && trigger === "inViewRepeat" ? ref : NO_REF, {
    once: false,
    amount: 0.5,
  });
  const pulse = useLoopActive(ref, animated && loading);
  const state = animated
    ? {
        initial: "hidden",
        animate:
          trigger === "mount" || (trigger === "inViewRepeat" ? inViewRepeat : inViewOnce)
            ? "visible"
            : "hidden",
      }
    : {};

  const cellPad = "px-3 py-2.5";
  const headPad = "px-3 py-2";
  const count = rows.length;
  const picked = selected.slice(0, count).filter(Boolean).length;
  const all: boolean | "indeterminate" =
    count > 0 && picked === count ? true : picked > 0 ? "indeterminate" : false;
  // Placeholder cells take the shape of the first row, so loading rows keep the data rows' height.
  const shape = rows[0]?.cells ?? {};
  const bar = cn("rounded-full bg-muted-foreground/10", pulse && "animate-pulse");

  return (
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn(
          "w-full",
          !fill && "max-w-sm",
          "overflow-hidden rounded-lg border bg-card shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <table className="w-full text-sm" aria-busy={loading || undefined}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground">
              {checkboxes && (
                <th scope="col" className="w-9 py-2 pr-0 pl-3">
                  <CheckboxBox
                    checked={all}
                    label="Select all rows"
                    onToggle={() => setSelected(rows.map(() => all !== true))}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    headPad,
                    "font-medium",
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={animated ? rowsIn : undefined} {...state}>
            {loading
              ? Array.from({ length: loadingRows }, (_, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-b-0">
                    {checkboxes && (
                      <td className="py-2.5 pr-0 pl-3">
                        <div className="size-4 rounded-[4px] bg-muted-foreground/10" />
                      </td>
                    )}
                    {columns.map((column) => {
                      const sample = shape[column.key];
                      const stacked = typeof sample === "object" && !!sample.secondary;
                      const pill = typeof sample === "object" && !!sample.tone;
                      const width =
                        column.align === "right"
                          ? "ml-auto w-14"
                          : pill
                            ? "w-12"
                            : i % 2
                              ? "w-20"
                              : "w-24";
                      return (
                        <td key={column.key} className={cellPad}>
                          <div className="flex h-5 items-center">
                            <div className={cn("h-2.5", width, bar)} />
                          </div>
                          {stacked && (
                            <div className="mt-0.5 flex h-4 items-center">
                              <div className={cn("h-2 w-28", bar)} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              : rows.map((row, r) => (
                  <tr
                    key={r}
                    className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    {checkboxes && (
                      <td className="py-2.5 pr-0 pl-3">
                        <CheckboxBox
                          checked={selected[r] ?? false}
                          label={`Select ${cellText(row.cells[columns[0]?.key ?? ""]) || `row ${r + 1}`}`}
                          onToggle={() =>
                            setSelected((prev) =>
                              rows.map((_, j) => (j === r ? !prev[j] : !!prev[j])),
                            )
                          }
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const cell = row.cells[column.key];
                      const right = column.align === "right";
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            cellPad,
                            right && "text-right font-medium tabular-nums text-foreground",
                          )}
                        >
                          {typeof cell === "object" && cell.tone ? (
                            <span
                              className={cn(
                                "inline-flex h-4.5 items-center whitespace-nowrap rounded-full px-2 text-[10px] font-semibold ring-1 ring-inset",
                                toneClasses[cell.tone],
                              )}
                            >
                              {cell.text}
                            </span>
                          ) : typeof cell === "object" && cell.secondary ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-foreground">{cell.text}</span>
                              <span className="text-xs text-muted-foreground">
                                {cell.secondary}
                              </span>
                            </div>
                          ) : (
                            <span className={right ? undefined : "text-foreground"}>
                              {cellText(cell)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
          </motion.tbody>
        </table>
      </motion.div>
    </div>
  );
}
