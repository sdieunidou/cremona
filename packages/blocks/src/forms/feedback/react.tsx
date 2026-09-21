import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2 } from "lucide-react";
import { cn, type VisualProps } from "@cremona/core";

export interface FeedbackProps extends VisualProps {
  score?: number;
  comment?: boolean;
  submitted?: boolean;
}

const entrance = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const content = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
} as const;

const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Feedback({
  score = 9,
  comment = false,
  submitted = false,
  animated = false,
  trigger = "inView",
  className,
}: FeedbackProps) {
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
        className="w-full max-w-72 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
        variants={animated ? entrance : undefined}
        {...state}
      >
        {submitted ? (
          <motion.div
            className="flex flex-col items-center gap-1.5 py-5 text-center"
            variants={animated ? item : undefined}
            {...state}
          >
            <CheckCircle2 className="size-8 text-emerald-500" strokeWidth={2} />
            <p className="mt-1 text-sm font-semibold text-foreground">Thanks for the feedback!</p>
            <p className="text-xs text-muted-foreground">We read every note you send.</p>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="mt-2 flex h-8 items-center rounded-md px-3 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10"
            >
              Back to app
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={animated ? content : undefined}
            {...state}
          >
            <motion.div
              className="flex flex-col gap-0.5"
              variants={animated ? item : undefined}
            >
              <p className="text-sm font-semibold text-foreground">
                How likely do you recommend us?
              </p>
              <p className="text-xs text-muted-foreground">
                Your feedback helps us improve Cremona.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-1.5"
              variants={animated ? item : undefined}
            >
              <div className="flex gap-0.5" role="radiogroup" aria-label="Score from 0 to 10">
                {scores.map((n) => (
                  <button
                    key={n}
                    type="button"
                    tabIndex={-1}
                    aria-label={`Score ${n}`}
                    aria-pressed={n === score}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      "flex h-6 flex-1 items-center justify-center rounded-md border text-[10px] tabular-nums transition-all duration-200",
                      n === score
                        ? "border-transparent bg-primary font-semibold text-primary-foreground"
                        : "border-input bg-background text-muted-foreground hover:border-ring/60",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </motion.div>
            {comment && (
              <motion.div
                className="flex flex-col gap-1.5"
                variants={animated ? item : undefined}
              >
                <label
                  htmlFor="cremona-feedback-comment"
                  className="text-xs font-medium text-foreground"
                >
                  Anything to add?
                </label>
                <textarea
                  id="cremona-feedback-comment"
                  placeholder="Tell us what went well…"
                  className="h-16 w-full resize-none rounded-md border border-input bg-transparent p-2 text-xs text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </motion.div>
            )}
            <motion.button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              variants={animated ? item : undefined}
            >
              Send feedback
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}