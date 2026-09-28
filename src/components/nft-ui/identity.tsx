import React from "react";
import { CHIP_SHADOW, INK } from "./ui";

/**
 * A deterministic pixel avatar, so every handle on the page gets a stable face
 * without shipping an image. FNV-1a over the seed picks the tint; the same hash
 * re-run per cell fills a 5x5 grid that's mirrored down the middle — symmetry is
 * what makes 25 random squares read as a portrait rather than noise.
 */
const AVATAR_TINTS = [
  "oklch(0.58 0.19 27)",
  "oklch(0.55 0.14 255)",
  "oklch(0.55 0.12 155)",
  "oklch(0.65 0.15 65)",
];

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function Avatar({
  seed,
  size = 32,
  square = false,
}: {
  seed: string;
  size?: number;
  square?: boolean;
}) {
  const tint = AVATAR_TINTS[hash(seed) % AVATAR_TINTS.length];

  const cells: [number, number][] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      // Bit 3 rather than bit 0: the low bit of FNV-1a alternates with the last
      // character, which would stripe the grid.
      if (((hash(seed + ":" + x + ":" + y) >>> 3) & 1) === 0) continue;
      cells.push([x, y]);
      if (x !== 2) cells.push([4 - x, y]);
    }
  }

  return (
    <svg
      viewBox="0 0 5 5"
      width={size}
      height={size}
      aria-hidden="true"
      // A collection reads as a square mark, an account as a circle. The square
      // radius is 25% of the box, so it stays concentric inside the pill.
      className={"shrink-0 " + (square ? "rounded-lg" : "rounded-full")}
      style={{ background: "oklch(0.94 0 0)" }}
      shapeRendering="crispEdges"
    >
      {cells.map(([x, y]) => (
        <rect key={x + "-" + y} x={x} y={y} width={1} height={1} fill={tint} />
      ))}
    </svg>
  );
}

/**
 * The white pill that carries a handle. Padding is 4px around a 32px avatar, so
 * the fully-rounded outer edge stays concentric with the circle inside it.
 */
export function HandleChip({
  handle,
  name,
  square = false,
}: {
  handle: string;
  /** Defaults to the @handle; a collection passes its own name instead. */
  name?: string;
  square?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 ${CHIP_SHADOW}`}
    >
      <Avatar seed={handle} size={32} square={square} />
      <span
        className={`text-[15px] leading-5 font-semibold tracking-[-0.01em] whitespace-nowrap ${INK}`}
      >
        {name ?? "@" + handle}
      </span>
    </span>
  );
}

/** Label above a chip — "Created by", "Collection". */
export function ChipField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-5 text-[oklch(0.556_0_0)]">{label}</p>
      {children}
    </div>
  );
}
