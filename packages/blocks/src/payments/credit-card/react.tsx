import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { Wifi } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

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

const faceAnim = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
} as const;

const back1Anim = {
  hidden: { opacity: 0, rotate: 0 },
  visible: {
    opacity: 1,
    rotate: -3,
    transition: { type: "spring", stiffness: 220, damping: 24, delay: 0.22 },
  },
} as const;

const back2Anim = {
  hidden: { opacity: 0, rotate: 0 },
  visible: {
    opacity: 1,
    rotate: -6,
    transition: { type: "spring", stiffness: 220, damping: 24, delay: 0.3 },
  },
} as const;

const back3Anim = {
  hidden: { opacity: 0, rotate: 0 },
  visible: {
    opacity: 1,
    rotate: -9,
    transition: { type: "spring", stiffness: 220, damping: 24, delay: 0.38 },
  },
} as const;

const chipAnim = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay: 0.12 },
  },
} as const;

const wifiAnim = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 16, delay: 0.18 },
  },
} as const;

const numberRowAnim = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.22 } },
} as const;

const numberAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

const bottomAnim = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: 0.32, ease: "easeOut" },
  },
} as const;

const stripAnim = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.5, delay: 0.12, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] },
  },
} as const;

const cvcBoxAnim = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.3, ease: "easeOut" } },
} as const;

const cvcAnim = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 360, damping: 18, delay: 0.42 },
  },
} as const;

export interface CreditCardProps extends VisualProps {
  name?: string;
  number?: string;
  expiry?: string;
  cvc?: string;
  brand?: string;
  stacked?: boolean;
  flipped?: boolean;
  isometric?: boolean;
}

export function CreditCard({
  name = "JOHN T. DOE",
  number = "•••• •••• •••• 4242",
  expiry = `12/${((new Date().getFullYear() + 3) % 100).toString().padStart(2, "0")}`,
  cvc = "123",
  brand = "PLATINUM",
  stacked = false,
  flipped = false,
  animated = false,
  trigger = "inView",
  isometric = false,
  fill = false,
  className,
}: CreditCardProps) {
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
  const groups = number.split(" ");

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
        className="relative w-72 will-change-transform"
        style={!animated && isometric ? { transform: "rotateX(45deg) rotateZ(-45deg)" } : undefined}
        variants={animated ? (isometric ? cardIso : card) : undefined}
        {...state}
      >
        {stacked && (
          <>
            <motion.div
              className="absolute inset-0 origin-bottom-left rounded-2xl border bg-card"
              style={{ rotate: -9, aspectRatio: "1.586 / 1" }}
              variants={animated ? back3Anim : undefined}
            />
            <motion.div
              className="absolute inset-0 origin-bottom-left rounded-2xl border bg-card"
              style={{ rotate: -6, aspectRatio: "1.586 / 1" }}
              variants={animated ? back2Anim : undefined}
            />
            <motion.div
              className="absolute inset-0 origin-bottom-left rounded-2xl border bg-card"
              style={{ rotate: -3, aspectRatio: "1.586 / 1" }}
              variants={animated ? back1Anim : undefined}
            />
          </>
        )}
        {flipped ? (
          <motion.div
            className="relative flex aspect-[1.586/1] flex-col overflow-hidden rounded-2xl bg-primary text-primary-foreground"
            variants={animated ? faceAnim : undefined}
            {...state}
          >
            <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-primary-foreground/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 size-44 rounded-full bg-primary-foreground/12 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/4 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-size-[12px_12px] opacity-[0.04]" />
            <motion.div
              className="relative mt-6 h-9 origin-left bg-foreground/85"
              variants={animated ? stripAnim : undefined}
            />
            <div className="relative mx-5 mt-4 flex items-center gap-2">
              <motion.div
                className="relative h-7 flex-1 overflow-hidden rounded-sm bg-card"
                variants={animated ? cvcBoxAnim : undefined}
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgba(0,0,0,0.05)_3px_4px)]" />
              </motion.div>
              <motion.div
                className="flex h-7 w-12 items-center justify-center rounded-sm bg-card font-mono text-xs font-bold tracking-widest text-foreground"
                variants={animated ? cvcAnim : undefined}
              >
                {cvc}
              </motion.div>
            </div>
            <motion.div
              className="relative mt-auto flex items-end justify-between px-5 pb-5"
              variants={animated ? bottomAnim : undefined}
            >
              <span className="text-[7px] tracking-[0.15em] opacity-50">
                AUTHORIZED SIGNATURE · NOT VALID UNLESS SIGNED
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] opacity-90">{brand}</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="relative flex aspect-[1.586/1] flex-col justify-between overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground"
            variants={animated ? faceAnim : undefined}
            {...state}
          >
            <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-primary-foreground/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 size-44 rounded-full bg-primary-foreground/12 blur-2xl" />
            <div className="pointer-events-none absolute top-1/2 -right-24 -translate-y-1/2">
              <div className="size-48 rounded-full border border-primary-foreground/8" />
              <div className="absolute inset-4 rounded-full border border-primary-foreground/6" />
              <div className="absolute inset-8 rounded-full border border-primary-foreground/6" />
              <div className="absolute inset-12 rounded-full border border-primary-foreground/6" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-primary-foreground/4 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-size-[12px_12px] opacity-[0.04]" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="relative flex h-6.75 w-8.5 items-center justify-center rounded-md bg-linear-to-br from-amber-200 to-amber-400"
                  variants={animated ? chipAnim : undefined}
                >
                  <div className="absolute inset-1 rounded-sm border border-amber-700/30" />
                  <div className="absolute top-1/2 right-1 left-1 h-px bg-amber-700/25" />
                  <div className="absolute top-1 bottom-1 left-1/2 w-px bg-amber-700/25" />
                </motion.div>
                <motion.div className="opacity-80" variants={animated ? wifiAnim : undefined}>
                  <Wifi className="size-5 rotate-90" strokeWidth={2} />
                </motion.div>
              </div>
              <motion.span
                className="text-[10px] font-semibold tracking-[0.2em] opacity-90"
                variants={animated ? wifiAnim : undefined}
              >
                {brand}
              </motion.span>
            </div>
            <motion.div
              className="relative flex items-center justify-between font-mono text-base font-medium tracking-widest"
              variants={animated ? numberRowAnim : undefined}
              {...state}
            >
              {groups.map((group, i) => (
                <motion.span key={i} variants={animated ? numberAnim : undefined}>
                  {group}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              className="relative flex items-end justify-between"
              variants={animated ? bottomAnim : undefined}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] tracking-[0.15em] opacity-70">CARD HOLDER</span>
                <span className="text-xs font-semibold tracking-wider">{name}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[8px] tracking-[0.15em] opacity-70">EXPIRES</span>
                <span className="font-mono text-xs font-semibold tracking-wider">{expiry}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
