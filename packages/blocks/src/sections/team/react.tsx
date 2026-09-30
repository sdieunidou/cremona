import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface TeamMember {
  /** Drawn in place of the name bar; its initials fill the avatar. */
  name: string;
  /** Drawn in place of the role bar. */
  role?: string;
}

export const teamDefaultCopy = {
  title: "Our team",
};

/** Six unnamed members. */
const defaultMembers: readonly (string | TeamMember)[] = ["", "", "", "", "", ""];

/** A count instead of a list means that many blank entries (at most 12). */
function blanks<T>(count: number, blank: T): T[] {
  return Array.from({ length: Math.min(Math.max(Math.floor(count) || 0, 0), 12) }, () => blank);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0]!.toUpperCase())
    .join("");
}

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

const frame = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const gridAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, delay: 0.3, ease: "easeOut" } },
} as const;

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: { opacity: 0.6, scaleX: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.5, ease: "easeOut" } },
} as const;

export interface TeamProps extends VisualProps {
  title?: string;
  /** One avatar per member (a name, or a name with a role), or a count. */
  members?: readonly (string | TeamMember)[] | number;
  /** Index of the highlighted avatar (default 0). */
  highlight?: number;
  gradient?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
}

export function Team({
  title = teamDefaultCopy.title,
  members = defaultMembers,
  highlight = 0,
  animated = false,
  trigger = "inView",
  gradient = true,
  fadeOut = false,
  isometric = false,
  fill = false,
  className,
}: TeamProps) {
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
    <div ref={ref} aria-hidden="true" className={cn(frameClasses(fill), className)}>
      <motion.div
        className={cn("w-full", !fill && "max-w-72", "p-8.5", fadeOut && "mask-b-from-60%")}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative p-1.5">
          <motion.div variants={animated ? frame : undefined} {...state}>
            <div className="absolute -inset-8.5 bg-[linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] bg-size-[24px_24px] dark:opacity-50" />
            <div className="absolute inset-0 border border-border/75" />
            <div className="absolute -top-6 left-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute -top-6 right-0 h-6 w-px bg-linear-to-b from-transparent to-border/75" />
            <div className="absolute top-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute top-0 -right-6 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
            <div className="absolute -bottom-6 left-0 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute right-0 -bottom-6 h-6 w-px bg-linear-to-t from-transparent to-border/75" />
            <div className="absolute bottom-0 -left-6 h-px w-6 bg-linear-to-r from-transparent to-border/75" />
            <div className="absolute -right-6 bottom-0 h-px w-6 bg-linear-to-l from-transparent to-border/75" />
          </motion.div>
          {gradient && !fadeOut && (
            <>
              <motion.div
                className="absolute inset-x-2.5 bottom-1.5 h-6 origin-center rounded-full bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? glowAnim : undefined}
                {...state}
              />
              <motion.div
                className="absolute inset-x-1 bottom-1 h-12 rounded-b-xl bg-background/95 mask-t-from-50% shadow-xs"
                variants={animated ? veilAnim : undefined}
                {...state}
              />
            </>
          )}
          <div className="relative rounded-xl border bg-card px-8 py-5 shadow-xs">
            <motion.div
              className="flex flex-col items-center"
              variants={animated ? content : undefined}
              {...state}
            >
              <motion.p
                className="text-center text-[10px] leading-[1.2] font-semibold text-foreground"
                variants={animated ? item : undefined}
              >
                {title}
              </motion.p>
              <motion.div
                className="mt-1 flex w-full flex-col items-center gap-1"
                variants={animated ? item : undefined}
              >
                <div className="h-0.75 w-1/2 rounded-full bg-muted-foreground/20" />
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-3 grid grid-cols-3 gap-3 will-change-transform"
              variants={animated ? gridAnim : undefined}
              {...state}
            >
              {(typeof members === "number" ? blanks(members, "") : members).map((raw, i) => {
                const member =
                  typeof raw === "object" && raw !== null ? raw : { name: String(raw ?? "") };
                return (
                  <div
                    key={i}
                    className={cn("flex flex-col items-center gap-1", member.name && "min-w-0")}
                  >
                    <div
                      className={cn(
                        "size-6 rounded-full border",
                        i === highlight
                          ? "ring-1.5 border-primary/10 bg-primary/15 ring-primary/20 dark:border-primary dark:bg-primary/50"
                          : "bg-muted",
                        member.name &&
                          "flex items-center justify-center text-[7px] font-semibold text-muted-foreground",
                      )}
                    >
                      {member.name ? initials(member.name) : null}
                    </div>
                    {member.name ? (
                      <span className="max-w-full truncate text-[7px] leading-none font-medium text-foreground/80">
                        {member.name}
                      </span>
                    ) : (
                      <div className="h-0.75 w-6 rounded-full bg-foreground/10" />
                    )}
                    {member.role ? (
                      <span className="max-w-full truncate text-[6px] leading-none text-muted-foreground">
                        {member.role}
                      </span>
                    ) : (
                      <div className="h-0.5 w-4 rounded-full bg-muted-foreground/12" />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
