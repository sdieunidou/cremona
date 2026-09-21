import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { ArrowDown, Funnel } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface TableColumn {
  label: string;
  key: string;
  avatar?: boolean;
  badge?: boolean;
  sort?: boolean;
}

export interface TableRowItem {
  [key: string]: string | undefined;
  name: string;
  initials?: string;
  subtitle?: string;
  status?: string;
}

export const tableDefaultColumns: TableColumn[] = [
  { label: "Name", key: "name", avatar: true },
  { label: "Status", key: "status", badge: true },
  { label: "Role", key: "role" },
  { label: "Joined", key: "joined", sort: true },
];

export const tableDefaultItems: TableRowItem[] = [
  { name: "Sarah Chen", initials: "SC", subtitle: "sarah@acme.io", status: "active", role: "Admin", joined: "Jan 12" },
  { name: "Alex Park", initials: "AP", subtitle: "alex@acme.io", status: "active", role: "Developer", joined: "Mar 4" },
  { name: "Mia Lee", initials: "ML", subtitle: "mia@acme.io", status: "pending", role: "Designer", joined: "Apr 19" },
  { name: "Ben Novak", initials: "BN", subtitle: "ben@acme.io", status: "active", role: "Developer", joined: "Jun 1" },
];

const badgeStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
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

const headAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.15, ease: "easeOut" } },
} as const;

const rowsAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
} as const;

const rowAnim = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const badgeAnim = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 14 },
  },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

/** Auto-links email addresses inside a string (POC build renders them as mailto anchors). */
function EmailText({ text }: { text: string }) {
  const match = EMAIL_RE.exec(text);
  if (!match) return <>{text}</>;
  const email = match[1]!;
  const parts = text.split(email);
  return (
    <>
      {parts[0]}
      <a href={`mailto:${email}`}>{email}</a>
      {parts[1]}
    </>
  );
}

export interface TableProps extends VisualProps {
  title?: string;
  columns?: readonly TableColumn[];
  items?: readonly TableRowItem[];
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

export function Table({
  title = "Members",
  columns = tableDefaultColumns,
  items = tableDefaultItems,
  animated = false,
  trigger = "inView",
  fadeOut = false,
  isometric = false,
  gradient = true,
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
        className={`relative w-full max-w-96 rounded-3xl border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {gradient && !fadeOut && (
          <>
            <motion.div
              className="absolute inset-x-1.25 bottom-0 h-20 origin-center rounded-t-full rounded-b-3xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
              variants={animated ? glowAnim : undefined}
              {...state}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-background/75 mask-t-from-50%"
              variants={animated ? veilAnim : undefined}
              {...state}
            />
          </>
        )}
        <div className="relative rounded-2xl border bg-card shadow-xs">
          <div className="flex items-center justify-between border-b px-3 py-2.75">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{title}</span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0">
                {items.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-1.75 py-0.5">
              <Funnel className="size-2.5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Filter</span>
            </div>
          </div>
          <table className="w-full">
            <motion.thead variants={animated ? headAnim : undefined} {...state}>
              <tr className="border-b bg-muted/25">
                {columns.map((column, i) => (
                  <th
                    key={column.key}
                    className={`py-2 text-left text-[10px] font-medium text-muted-foreground ${column.avatar ? "w-full" : "whitespace-nowrap"} ${i === 0 ? "pr-1.5 pl-3" : i === columns.length - 1 ? "pr-3 pl-1.5" : "px-1.5"}`}
                  >
                    <div className="flex items-center gap-0.5">
                      {column.label}
                      {column.sort && (
                        <ArrowDown className="size-2.5 text-muted-foreground/70" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </motion.thead>
            <motion.tbody variants={animated ? rowsAnim : undefined} {...state}>
              {items.map((item, row) => (
                <motion.tr
                  key={row}
                  className={row === items.length - 1 ? "" : "border-b border-border/50"}
                  variants={animated ? rowAnim : undefined}
                >
                  {columns.map((column, i) => {
                    const pad =
                      i === 0 ? "pl-3 pr-1.5" : i === columns.length - 1 ? "pl-1.5 pr-3" : "px-1.5";
                    if (column.avatar) {
                      return (
                        <td key={column.key} className={`py-2 ${pad}`}>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                              {item.initials}
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-[11px] font-medium text-foreground">
                                {item[column.key]}
                              </span>
                              {item.subtitle && (
                                <span className="truncate text-[9px] text-muted-foreground">
                                  <EmailText text={item.subtitle} />
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    }
                    if (column.badge) {
                      return (
                        <td key={column.key} className={`py-2 ${pad}`}>
                          <motion.span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${badgeStyles[String(item[column.key])] ?? "bg-muted text-muted-foreground"}`}
                            variants={animated ? badgeAnim : undefined}
                          >
                            {item[column.key]}
                          </motion.span>
                        </td>
                      );
                    }
                    return (
                      <td key={column.key} className={`py-2 ${pad} text-[10px] text-muted-foreground`}>
                        {item[column.key]}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
