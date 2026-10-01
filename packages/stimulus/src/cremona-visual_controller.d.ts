import { Controller } from "@hotwired/stimulus";

/**
 * `data-controller="cremona-visual"`: plays a template's entrance with Web Animations, from the
 * start state its elements carry in `data-anim-from` to the markup (the block's final render).
 */
export default class CremonaVisualController extends Controller<HTMLElement> {
  static values: {
    trigger: { type: StringConstructor; default: string };
    duration: { type: NumberConstructor; default: number };
    stagger: { type: NumberConstructor; default: number };
    delay: { type: NumberConstructor; default: number };
    easing: { type: StringConstructor; default: string };
    amount: { type: NumberConstructor; default: number };
    timeout: { type: NumberConstructor; default: number };
    played: { type: BooleanConstructor; default: boolean };
  };
  /** `inView` (default), `inViewRepeat` or `mount`. */
  triggerValue: "inView" | "inViewRepeat" | "mount";
  /** ms per element (450). */
  durationValue: number;
  /** ms between two elements (70); long cascades are squeezed into 1.2 s. */
  staggerValue: number;
  /** ms before the first element (60). */
  delayValue: number;
  /** CSS easing. */
  easingValue: string;
  /** Share of the visual that must be in view (0.5). */
  amountValue: number;
  /** ms after which a visual that stays partly in view plays anyway (2000). */
  timeoutValue: number;
  /** `true` shows the final state without an entrance. */
  playedValue: boolean;
}
