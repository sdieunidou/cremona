import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import {
  CornerDownLeft,
  FileText,
  Plus,
  Rocket,
  Search,
  Settings,
  UserPlus,
} from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface CommandItem {
  icon?: ReactNode;
  label: string;
  shortcut?: string[];
}

export interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps extends VisualProps {
  query?: string;
  groups?: CommandGroup[];
  caret?: boolean;
  hover?: boolean;
  fadeOut?: boolean;
  isometric?: boolean;
  gradient?: boolean;
}

const defaultQuery = "new";
const defaultGroups: CommandGroup[] = [
  {
    label: "Actions",
    items: [
      { icon: <Plus className="size-3" strokeWidth={2.5} />, label: "New project", shortcut: ["⌘", "N"] },
      { icon: <FileText className="size-3" strokeWidth={2.5} />, label: "New document", shortcut: ["⌘", "D"] },
      { icon: <UserPlus className="size-3" strokeWidth={2.5} />, label: "Invite teammate", shortcut: ["⌘", "I"] },
    ],
  },
  {
    label: "Recent",
    items: [
      { icon: <Rocket className="size-3" strokeWidth={2.5} />, label: "Launch checklist" },
      { icon: <Settings className="size-3" strokeWidth={2.5} />, label: "Workspace settings" },
    ],
  },
];

const BASE_DELAY = 0.3;
const CHAR_STAGGER = 0.045;
const CHAR_FADE = 0.18;
const ITEM_STAGGER = 0.06;
const LIST_DELAY = 0.25;
const WALK_INTERVAL = 900;
const FOOTER_PAD = 0.6;

const typeDone = (len: number) => BASE_DELAY + Math.max(len - 1, 0) * CHAR_STAGGER + CHAR_FADE;
const footerDelay = (len: number, items: number) => typeDone(len) + LIST_DELAY + items * ITEM_STAGGER;

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

const glowAnim = {
  hidden: { opacity: 0, scaleX: 0.6 },
  visible: {
    opacity: 0.6,
    scaleX: 1,
    transition: { duration: 0.5, delay: 0.5, ease: "easeOut" },
  },
} as const;

const veilAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.5, ease: "easeOut" },
  },
} as const;

const charAnim: Variants = {
  hidden: { opacity: 0 },
  visible: (index: number) => ({
    opacity: 1,
    transition: { duration: CHAR_FADE, delay: BASE_DELAY + index * CHAR_STAGGER, ease: "easeOut" },
  }),
};

const caretAnim = (len: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 1, 0],
    transition: { duration: 1, repeat: 1 / 0, delay: typeDone(len) + 0.05, ease: "easeInOut" },
  },
});

const badgeAnim = (len: number): Variants => ({
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 420, damping: 14, delay: typeDone(len) + 0.1 },
    },
  });

const revealAnim = (len: number): Variants => ({
    hidden: { opacity: 0, y: 6 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: typeDone(len) + 0.15 + index * ITEM_STAGGER,
        ease: "easeOut",
      },
    }),
  });

const footerAnim = (len: number, items: number): Variants => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, delay: footerDelay(len, items), ease: "easeOut" },
    },
  });

function Key({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-[5px] border bg-muted px-1 text-[9px]/none font-medium text-muted-foreground shadow-xs">
      {children}
    </span>
  );
}

export function CommandPalette({
  query = defaultQuery,
  groups = defaultGroups,
  caret = true,
  animated = false,
  trigger = "inView",
  hover = false,
  fadeOut = false,
  isometric = false,
  gradient = true,
  className,
}: CommandPaletteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState(0);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const cycling = animated && (hover ? hovering : triggered);
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const resolvedGroups = groups.length ? groups : defaultGroups;
  const indexed = resolvedGroups.map((group, i) => ({
    group,
    start: resolvedGroups.slice(0, i).reduce((acc, g) => acc + g.items.length, 0),
  }));
  const itemCount = resolvedGroups.reduce((acc, g) => acc + g.items.length, 0);
  const chars = [...query];
  const caretVariants = caretAnim(chars.length);
  const badgeVariants = badgeAnim(chars.length);
  const revealVariants = revealAnim(chars.length);
  const footerVariants = footerAnim(chars.length, itemCount);
  const cursorItem = cycling ? cursor % Math.max(itemCount, 1) : 0;
  const walkStartMs = (footerDelay(chars.length, itemCount) + FOOTER_PAD) * 1000;
  useEffect(() => {
    if (!cycling || itemCount < 2) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        interval = setInterval(() => {
          setCursor((c) => (c + 1) % itemCount);
        }, WALK_INTERVAL);
      },
      hover ? 0 : walkStartMs,
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      setCursor(0);
    };
  }, [cycling, hover, itemCount, walkStartMs]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative isolate flex size-full items-center justify-center overflow-hidden px-2",
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={
        animated && hover
          ? () => {
              setHovering(false);
              setCursor(0);
            }
          : undefined
      }
    >
      <motion.div
        className={`relative flex w-full max-w-84 flex-col gap-1.5 rounded-[22px] border border-border/50 bg-muted/75 p-1.5 ${fadeOut ? "mask-b-from-60%" : ""}`}
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        <div className="relative flex items-center gap-2 rounded-[18px] border bg-card px-3 py-2.75 shadow-xs">
          <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          <span className="flex min-w-0 flex-1 items-center">
            <span className="min-w-0 truncate text-xs font-medium text-foreground">
              {animated
                ? chars.map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block whitespace-pre"
                      variants={charAnim}
                      custom={i}
                      {...state}
                    >
                      {char}
                    </motion.span>
                  ))
                : query}
            </span>
            {caret && (
              <motion.span
                className="ml-0.5 h-3 w-0.5 shrink-0 rounded-full bg-primary"
                variants={animated ? caretVariants : undefined}
                {...state}
              />
            )}
          </span>
          <motion.span
            className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1.25 text-[9px] font-semibold text-primary ring-1 ring-primary/15 ring-inset dark:bg-primary dark:text-primary-foreground dark:ring-0"
            variants={animated ? badgeVariants : undefined}
            {...state}
          >
            {itemCount}
          </motion.span>
        </div>
        <div className="relative">
          {gradient && !fadeOut && (
            <>
              <motion.div
                className="absolute -inset-x-px -bottom-1.5 h-20 origin-center rounded-t-full rounded-b-xl bg-[linear-gradient(to_right,var(--color-red-500),var(--color-orange-500),var(--color-yellow-500),var(--color-green-500),var(--color-blue-500),var(--color-indigo-500),var(--color-violet-500))] opacity-60 blur-sm"
                variants={animated ? glowAnim : undefined}
                {...state}
              />
              <motion.div
                className="absolute -inset-x-1.5 -bottom-1.5 h-16 rounded-b-[22px] bg-background/75 mask-t-from-50% shadow-xs"
                variants={animated ? veilAnim : undefined}
                {...state}
              />
            </>
          )}
          <div className="relative rounded-[18px] border bg-card shadow-xs">
            <div className="flex flex-col py-1.5">
              {indexed.map(({ group, start }, i) => (
                <div key={i} className="flex flex-col">
                  <motion.span
                    className="px-3 pt-1.5 pb-1 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase"
                    variants={animated ? revealVariants : undefined}
                    custom={start}
                    {...state}
                  >
                    {group.label}
                  </motion.span>
                  {group.items.map((item, j) => {
                    const index = start + j;
                    const active = index === cursorItem;
                    return (
                      <motion.button
                        key={j}
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        className="relative mx-1.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left"
                        variants={animated ? revealVariants : undefined}
                        custom={index}
                        {...state}
                      >
                        <motion.span
                          className="pointer-events-none absolute inset-0 rounded-lg bg-accent ring-1 ring-border"
                          initial={false}
                          animate={{ opacity: +!!active }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                        {item.icon && (
                          <span className="relative flex size-5.5 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-xs">
                            {item.icon}
                          </span>
                        )}
                        <span className="relative min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="relative flex shrink-0 items-center gap-1">
                            {item.shortcut.map((key, k) => (
                              <Key key={k}>{key}</Key>
                            ))}
                          </span>
                        )}
                        <motion.span
                          className="relative flex w-3 shrink-0 items-center justify-center text-primary"
                          initial={false}
                          animate={{ opacity: +!!active }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          <CornerDownLeft className="size-3" strokeWidth={2.5} />
                        </motion.span>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
            <motion.div
              className="flex items-center justify-between border-t px-3 py-2"
              variants={animated ? footerVariants : undefined}
              {...state}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <Key>↑</Key>
                  <Key>↓</Key>
                  <span className="text-[9px] text-muted-foreground">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <Key>↵</Key>
                  <span className="text-[9px] text-muted-foreground">Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Key>esc</Key>
                <span className="text-[9px] text-muted-foreground">Close</span>
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
