import React, { useId } from "react";
import { UserIcon } from "@/components/icons/fomoed-nav";

/** Every scene is drawn on this canvas: the promo slot is 240 × 286. */
export const VIEW_BOX = "0 0 240 286";

/** Colours come from CSS variables set per theme in `theme.ts`. */
export const C = {
  plate: "var(--illo-plate)",
  surface: "var(--illo-surface)",
  line: "var(--illo-line)",
  muted: "var(--illo-muted)",
  ink: "var(--illo-ink)",
  accent: "var(--illo-accent)",
  onAccent: "var(--illo-on-accent)",
};

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Gentler than EASE, so short shapes are seen growing rather than popping. */
export const GROW = [0.45, 0, 0.2, 1] as const;

export function appear(delay = 0) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: EASE },
  };
}

export function pop(delay = 0) {
  return {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.35, delay, ease: EASE },
  };
}

/**
 * Draws a stroke in. Opacity snaps on as drawing starts: at pathLength 0 a
 * round linecap still renders as a dot.
 */
export function draw(delay = 0, duration = 0.9) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration, delay, ease: EASE },
      opacity: { duration: 0.01, delay },
    },
  };
}

/** SVG ids must be valid in `url(#…)`; React's useId output isn't always. */
export function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

interface IAvatar {
  cx: number;
  cy: number;
  r: number;
  ring?: boolean;
}

export function Avatar({ cx, cy, r, ring = false }: IAvatar) {
  const size = r * 1.3;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={C.surface}
        stroke={ring ? C.accent : C.line}
        strokeWidth={ring ? 1.5 : 1}
      />
      <UserIcon
        x={cx - size / 2}
        y={cy - size / 2}
        size={size}
        color={C.muted}
      />
    </g>
  );
}
