import React from "react";
import { INK } from "./ui";

/**
 * The white counterpart to the black primary button — "Place bid", "Make offer",
 * "View contract". Renders an anchor when given an href and a button otherwise,
 * because these are the same object visually and it is the destination, not the
 * styling, that differs.
 *
 * `lg` matches the 56px primary button so the two sit level in a split card;
 * `md` is the 44px secondary used in a footer row.
 */
export function OutlinePill({
  children,
  href,
  size = "md",
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  size?: "md" | "lg";
  onClick?: () => void;
  className?: string;
}) {
  const shape =
    size === "lg" ? "h-14 w-full text-[16px]" : "h-11 px-5 text-[15px]";

  const style = `grid cursor-pointer place-items-center rounded-full bg-white leading-6 font-semibold tracking-[-0.01em] whitespace-nowrap shadow-[0_0_0_1px_oklch(0.15_0_0/0.10)] transition-[box-shadow,scale] duration-150 hover:shadow-[0_0_0_1px_oklch(0.15_0_0/0.24)] active:scale-[0.96] ${INK} ${shape} ${className}`;

  if (href) {
    return (
      <a href={href} className={style}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={style}>
      {children}
    </button>
  );
}
