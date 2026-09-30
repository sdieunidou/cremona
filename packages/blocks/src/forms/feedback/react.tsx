import { useId, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "@cremona/react";
import { CheckCircle2 } from "lucide-react";
import { cn, frameClasses, type VisualProps } from "@cremona/core";

export interface FeedbackLabels {
  question: string;
  description: string;
  low: string;
  high: string;
  /** `{score}` is replaced by the chip's value. */
  scoreLabel: string;
  comment: string;
  commentPlaceholder: string;
  submit: string;
  thanks: string;
  thanksDescription: string;
  back: string;
}

export interface FeedbackProps extends VisualProps {
  /** Selected score, 0 to 10. */
  score?: number;
  /** Show the free-text comment field. */
  comment?: boolean;
  /** Show the thank-you state instead of the form. */
  submitted?: boolean;
  /** UI copy; every key is optional and falls back to the English default. */
  labels?: Partial<FeedbackLabels>;
}

const defaultLabels: FeedbackLabels = {
  question: "How likely are you to recommend us?",
  description: "Your feedback helps us improve.",
  low: "Not likely",
  high: "Very likely",
  scoreLabel: "Score {score}",
  comment: "Anything to add?",
  commentPlaceholder: "Tell us what went well…",
  submit: "Send feedback",
  thanks: "Thanks for the feedback!",
  thanksDescription: "We read every note you send.",
  back: "Back to app",
};

/** Preview only: keeps a control out of the tab order and unfocused on click. Drop it when deriving. */
const noFocus = { tabIndex: -1, onMouseDown: prevent } as const;
function prevent(e: { preventDefault(): void }) {
  e.preventDefault();
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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Feedback({
  score = 9,
  comment = false,
  submitted = false,
  labels,
  animated = false,
  trigger = "inView",
  fill = false,
  className,
}: FeedbackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewOnce = useInView(ref, { once: true, amount: 0.5 });
  const inViewRepeat = useInView(ref, { once: false, amount: 0.5 });
  const id = useId();
  const t = { ...defaultLabels, ...labels };
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
        className={cn(
          "w-full",
          !fill && "max-w-80",
          "rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
        )}
        variants={animated ? entrance : undefined}
        {...state}
      >
        {submitted ? (
          <motion.div
            role="status"
            className="flex flex-col items-center gap-1.5 py-5 text-center"
            variants={animated ? item : undefined}
            {...state}
          >
            <CheckCircle2 className="size-8 text-success" strokeWidth={2} />
            <p className="mt-1 text-sm font-semibold text-foreground">{t.thanks}</p>
            <p className="text-xs text-muted-foreground">{t.thanksDescription}</p>
            <button
              type="button"
              className={cn(
                "mt-2 flex h-8 items-center rounded-md px-3 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10",
                focusRing,
              )}
              {...noFocus}
            >
              {t.back}
            </button>
          </motion.div>
        ) : (
          <motion.form
            noValidate
            onSubmit={prevent}
            className="flex flex-col gap-3"
            variants={animated ? content : undefined}
            {...state}
          >
            <motion.div className="flex flex-col gap-0.5" variants={animated ? item : undefined}>
              <p id={`${id}-question`} className="text-sm font-semibold text-foreground">
                {t.question}
              </p>
              <p id={`${id}-description`} className="text-xs text-muted-foreground">
                {t.description}
              </p>
            </motion.div>
            <motion.div className="flex flex-col gap-1.5" variants={animated ? item : undefined}>
              <div
                role="radiogroup"
                aria-labelledby={`${id}-question`}
                aria-describedby={`${id}-description`}
                className="flex gap-0.5"
              >
                {scores.map((n) => (
                  <label key={n} className="flex min-w-0 flex-1">
                    <input
                      type="radio"
                      name="score"
                      value={n}
                      defaultChecked={n === score}
                      aria-label={t.scoreLabel.replace("{score}", String(n))}
                      className="peer sr-only"
                      {...noFocus}
                    />
                    <span className="flex h-6 flex-1 items-center justify-center rounded-md border border-input bg-background text-[10px] text-muted-foreground tabular-nums transition-all duration-200 hover:border-ring/60 peer-checked:border-transparent peer-checked:bg-primary peer-checked:font-semibold peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                      {n}
                    </span>
                  </label>
                ))}
              </div>
              <div
                className="flex items-center justify-between text-[10px] text-muted-foreground"
                aria-hidden="true"
              >
                <span>{t.low}</span>
                <span>{t.high}</span>
              </div>
            </motion.div>
            {comment && (
              <motion.div className="flex flex-col gap-1.5" variants={animated ? item : undefined}>
                <label htmlFor={`${id}-comment`} className="text-xs font-medium text-foreground">
                  {t.comment}
                </label>
                <textarea
                  id={`${id}-comment`}
                  name="comment"
                  placeholder={t.commentPlaceholder}
                  className="h-16 w-full resize-none rounded-md border border-input bg-transparent p-2 text-xs text-foreground shadow-xs transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  {...noFocus}
                />
              </motion.div>
            )}
            <motion.button
              type="submit"
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99]",
                focusRing,
              )}
              variants={animated ? item : undefined}
              {...noFocus}
            >
              {t.submit}
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
