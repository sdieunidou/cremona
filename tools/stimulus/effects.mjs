/**
 * Which React effects a static template cannot reproduce, from a scan of the
 * block's source. Templates replay the entrance only: anything that loops, runs
 * on timers or frames, draws on a canvas, or reacts to the pointer or to input
 * stays React-only.
 */
const RULES = [
  ["loops", /\brepeat:\s*(Infinity|1\s*\/\s*0|Number\.POSITIVE_INFINITY)/],
  ["sequences", /\bset(Interval|Timeout)\s*\(|\brequestAnimationFrame\s*\(|\bAnimatePresence\b/],
  ["canvas", /<canvas\b/],
  [
    "pointer",
    /\bon(Mouse|Pointer)(Enter|Leave|Move|Over|Out)\b|\bwhile(Hover|Tap|Drag)\b|\buse(MotionValue|Spring)\b/,
  ],
  ["interaction", /\bon(Click|Change|Input|KeyDown|KeyUp|Submit)=/],
];

/** CSS and SMIL loops only run in a template when the final render keeps them. */
const MARKUP_LOOP = /\banimate-(spin|ping|pulse|bounce|\[)|<animate(Motion|Transform)?\b/;

/**
 * @param {string} source react.tsx
 * @param {string[]} templates the block's final renders
 * @returns {string[]} effect kinds the templates do not reproduce
 */
export function reactOnlyEffects(source, templates) {
  const kinds = RULES.filter(([, re]) => re.test(source)).map(([kind]) => kind);
  if (
    !kinds.includes("loops") &&
    MARKUP_LOOP.test(source) &&
    !templates.some((t) => MARKUP_LOOP.test(t))
  )
    kinds.unshift("loops");
  return kinds;
}
