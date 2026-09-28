/**
 * The handful of surface values this page repeats. Everything else stays as an
 * inline arbitrary value next to the element it styles — these are here only
 * because a drifting hairline or a mismatched card shadow is what makes a page
 * like this read as two designs stitched together.
 *
 * Full class strings, never interpolated, so Tailwind's scanner still sees them.
 */

/** Divider between rows and under section headings. */
export const HAIRLINE = "bg-[oklch(0.922_0_0)]";

/** Layered rather than bordered: the 1px ring is the last shadow in the stack,
 *  so it sits on any background instead of fighting one. */
export const CARD_SHADOW =
  "shadow-[0_1px_2px_oklch(0.15_0_0/0.04),0_10px_30px_-12px_oklch(0.15_0_0/0.10),0_0_0_1px_oklch(0.15_0_0/0.05)]";

/** Same idea, tuned for something the size of a pill. */
export const CHIP_SHADOW =
  "shadow-[0_1px_2px_oklch(0.15_0_0/0.05),0_6px_16px_-8px_oklch(0.15_0_0/0.14),0_0_0_1px_oklch(0.15_0_0/0.04)]";

export const INK = "text-[oklch(0.15_0_0)]";
export const MUTED = "text-[oklch(0.556_0_0)]";
