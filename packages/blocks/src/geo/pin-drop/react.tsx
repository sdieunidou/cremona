import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useInView } from "@cremona/react";
import { MapPin } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface PinDropPin {
  x: number;
  y: number;
  label?: string;
  color?: string;
  active?: boolean;
}

export interface PinDropProps extends VisualProps {
  pins?: PinDropPin[];
  hover?: boolean;
  wrapperClassName?: string;
}

const BASE_HEIGHT = 64;

const rippleRings = [
  { scale: 0.2, tint: "bg-muted/25", delay: 0.02 },
  { scale: 0.43, tint: "bg-card/50", delay: 0.07 },
  { scale: 0.62, tint: "bg-muted/25", delay: 0.22 },
  { scale: 0.83, tint: "bg-card/50", delay: 0.4 },
  { scale: 1, tint: "bg-muted/25", delay: 0.58 },
] as const;

const rippleDelays = [0, 0.8, 1.6];

const defaultPins: PinDropPin[] = [
  { x: 24, y: 50, label: "San Francisco" },
  { x: 40, y: 30, label: "London" },
  { x: 63, y: 52, label: "Singapore" },
  { x: 77, y: 35, label: "Tokyo" },
];

const fieldAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const ringAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      scale: { type: "spring", stiffness: 110, damping: 18, delay },
      opacity: { duration: 0.4, ease: "easeOut", delay },
    },
  }),
};

const pinAnim: Variants = {
  hidden: { y: -30, opacity: 0 },
  visible: (index: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      y: {
        type: "spring",
        stiffness: 600,
        damping: 14,
        delay: 0.42 + index * 0.15,
      },
      opacity: { duration: 0.15, delay: 0.42 + index * 0.15 },
    },
  }),
};

const shadowAnim: Variants = {
  hidden: { scaleX: 0.3, opacity: 0 },
  visible: (index: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut", delay: 0.56 + index * 0.15 },
  }),
};

const glowAnim: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.52 + index * 0.15 },
  }),
};

export function PinDrop({
  pins,
  animated = false,
  trigger = "inView",
  hover = false,
  fill = false,
  className,
  wrapperClassName,
}: PinDropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const [hovering, setHovering] = useState(false);
  const triggered =
    trigger === "mount" ? true : trigger === "inViewRepeat" ? inViewRepeat : inViewOnce;
  const pinging = hover ? hovering : triggered;
  const state = animated
    ? { initial: "hidden", animate: triggered ? "visible" : "hidden" }
    : {};
  const resolvedPins = pins ?? defaultPins;
  const yPercent = (y: number) => `${(y / BASE_HEIGHT) * 100}%`;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        frameClasses(fill),
        className,
      )}
      onMouseEnter={animated && hover ? () => setHovering(true) : undefined}
      onMouseLeave={animated && hover ? () => setHovering(false) : undefined}
    >
      <motion.div
        className={cn(
          "relative aspect-100/64 w-full",
          !/(?:^|\s)max-w-\S+/.test(wrapperClassName ?? "") && "max-w-120",
          wrapperClassName,
        )}
        variants={animated ? fieldAnim : undefined}
        {...state}
      >
        <div className="absolute inset-0 -z-1 mask-b-from-80%">
          {rippleRings.map((ring, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-1/2 aspect-square -translate-x-1/2 translate-y-1/2"
              style={{ width: `${ring.scale * 100}%`, zIndex: rippleRings.length - i }}
            >
              <motion.div
                className={cn("size-full rounded-full border border-border/50", ring.tint)}
                custom={ring.delay}
                variants={animated ? ringAnim : undefined}
                {...state}
              />
            </div>
          ))}
        </div>
        {resolvedPins.map((pin, i) => (
          <div
            key={i}
            className={cn("absolute", pin.color ?? "text-primary")}
            style={{ left: `${pin.x}%`, top: yPercent(pin.y) }}
          >
            {pin.active && (
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
                <motion.span
                  className="block size-10 rounded-full bg-current/25 blur-md"
                  custom={i}
                  variants={animated ? glowAnim : undefined}
                  {...state}
                />
              </div>
            )}
            <div className="absolute top-0 left-0 size-7 -translate-x-1/2 -translate-y-1/2">
              {rippleDelays.map((delay, r) => (
                <motion.span
                  key={r}
                  className="absolute inset-0 rounded-full border border-current"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={
                    animated && pinging
                      ? { scale: [0.4, 0.7, 2.4], opacity: [0, 0.35, 0] }
                      : { scale: 0.4, opacity: 0 }
                  }
                  transition={
                    animated && pinging
                      ? {
                          duration: 2.4,
                          ease: "easeOut",
                          repeat: 1 / 0,
                          delay: 0.4 + i * 0.3 + delay,
                          times: [0, 0.1, 1],
                        }
                      : { duration: 0.4, ease: "easeOut" }
                  }
                />
              ))}
            </div>
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                className="block h-1 w-6 rounded-[50%] bg-foreground/35 blur-xs"
                custom={i}
                variants={animated ? shadowAnim : undefined}
                {...state}
              />
            </div>
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-full">
              <motion.div
                className="relative"
                custom={i}
                variants={animated ? pinAnim : undefined}
                {...state}
              >
                <MapPin
                  className={cn(
                    "fill-current stroke-primary-foreground",
                    pin.active ? "size-15" : "size-12",
                  )}
                  strokeWidth={1}
                />
              </motion.div>
            </div>
          </div>
        ))}
        {resolvedPins.map((pin, i) =>
          pin.label ? (
            <div
              key={i}
              className="absolute z-10"
              style={{ left: `${pin.x}%`, top: yPercent(pin.y) }}
            >
              <div
                className={cn(
                  "absolute left-0 -translate-x-1/2",
                  pin.active ? "bottom-15" : "bottom-12",
                )}
              >
                <motion.div custom={i} variants={animated ? pinAnim : undefined} {...state}>
                  <div className="rounded-md border bg-card px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-foreground shadow-xs">
                    {pin.label}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : null,
        )}
      </motion.div>
    </div>
  );
}
