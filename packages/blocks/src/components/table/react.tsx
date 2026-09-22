import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Check, Minus } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface TableProps extends VisualProps {
  checkboxes?: boolean;
  loading?: boolean;
}

interface RowDef {
  name: string;
  email: string;
  status: string;
  statusClasses: string;
  amount: string;
  checked: boolean;
}

const rows: RowDef[] = [
  {
    name: "Olivia Martin",
    email: "olivia@acme.co",
    status: "Active",
    statusClasses:
      "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/15 dark:text-emerald-400",
    amount: "$1,999.00",
    checked: true,
  },
  {
    name: "Isabella Nguyen",
    email: "isabella@acme.co",
    status: "Active",
    statusClasses:
      "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/15 dark:text-emerald-400",
    amount: "$3,240.00",
    checked: true,
  },
  {
    name: "Liam Chen",
    email: "liam@acme.co",
    status: "Pending",
    statusClasses:
      "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/15 dark:text-amber-400",
    amount: "$820.00",
    checked: false,
  },
  {
    name: "Noah Williams",
    email: "noah@acme.co",
    status: "Inactive",
    statusClasses:
      "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/15 dark:text-red-400",
    amount: "$2,150.00",
    checked: false,
  },
];

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const rowsIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

function HeaderCheckbox() {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-primary bg-primary text-primary-foreground">
      <Minus className="size-3" aria-hidden="true" />
    </span>
  );
}

function RowCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background dark:bg-input/30",
      )}
    >
      {checked && <Check className="size-3" aria-hidden="true" />}
    </span>
  );
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      className={cn("h-2.5 animate-pulse rounded-full bg-muted-foreground/10", width)}
    />
  );
}

export function Table({
  checkboxes = false,
  loading = false,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: TableProps) {
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

  const cellPad = "px-3 py-2.5";
  const headPad = "px-3 py-2";

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
        className={cn("w-full", !fill && "max-w-sm", "overflow-hidden rounded-lg border bg-card shadow-xs")}
        variants={animated ? entrance : undefined}
        {...state}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground">
              {checkboxes && (
                <th scope="col" className={cn(headPad, "w-9 pl-3 pr-0")}>
                  <HeaderCheckbox />
                </th>
              )}
              <th scope="col" className={cn(headPad, "text-left font-medium")}>
                Member
              </th>
              <th scope="col" className={cn(headPad, "text-left font-medium")}>
                Status
              </th>
              <th scope="col" className={cn(headPad, "text-right font-medium")}>
                Amount
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={animated ? rowsIn : undefined}
            {...state}
          >
            {loading
              ? [0, 1, 2].map((i) => (
                  <tr key={i} className="border-b border-border/50 last:border-b-0">
                    {checkboxes && (
                      <td className="pl-3 pr-0 py-2.5">
                        <RowCheckbox checked={i === 0} />
                      </td>
                    )}
                    <td className={cellPad}>
                      <SkeletonBar width={i % 2 === 0 ? "w-24" : "w-20"} />
                    </td>
                    <td className={cellPad}>
                      <SkeletonBar width="w-12" />
                    </td>
                    <td className={cn(cellPad, "flex justify-end")}>
                      <SkeletonBar width="w-14" />
                    </td>
                  </tr>
                ))
                : rows.map((row) => (
                    <tr
                      key={row.email}
                      className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      {checkboxes && (
                        <td className="pl-3 pr-0 py-2.5">
                          <RowCheckbox checked={row.checked} />
                        </td>
                      )}
                     <td className={cellPad}>
                       <div className="flex flex-col gap-0.5">
                         <span className="font-medium text-foreground">{row.name}</span>
                         <span className="text-xs text-muted-foreground">{row.email}</span>
                       </div>
                     </td>
                     <td className={cellPad}>
                       <span
                         className={cn(
                           "inline-flex h-4.5 items-center whitespace-nowrap rounded-full px-2 text-[10px] font-semibold",
                           row.statusClasses,
                         )}
                       >
                         {row.status}
                       </span>
                     </td>
                     <td className={cn(cellPad, "text-right font-medium tabular-nums text-foreground")}>
                       {row.amount}
                     </td>
                   </tr>
                ))}
          </motion.tbody>
        </table>
      </motion.div>
    </div>
  );
}
