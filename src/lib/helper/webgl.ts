type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Size = {
  width: number;
  height: number;
};

/**
 * Converts an HTML rect into a center-origin position for a WebGL scene.
 *
 * The DOM measures from the top-left with y growing downwards; WebGL measures
 * from the center with y growing upwards. So the rect's top-left corner is
 * moved to its center, the origin is shifted to the middle of `size`, and y is
 * flipped.
 *
 * `size` is whatever box the rect is measured inside: the canvas (r3f's
 * `useThree().size`) for a `getBoundingClientRect`, or the tile for coordinates
 * authored in design space.
 *
 * With r3f's default orthographic camera at zoom 1 one unit is one pixel, so
 * the result can be passed straight to a mesh.
 */
export const rectToWebgl = (rect: Rect, size: Size) => ({
  x: rect.left + rect.width * 0.5 - size.width * 0.5,
  y: size.height * 0.5 - rect.top - rect.height * 0.5,
  width: rect.width,
  height: rect.height,
});
