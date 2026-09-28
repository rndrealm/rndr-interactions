import React from "react";
import { HAIRLINE, INK } from "./ui";

/** Section heading with the hairline under it, used by every block below the fold. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={`text-[26px] leading-8 font-semibold tracking-[-0.025em] text-balance ${INK}`}
      >
        {title}
      </h2>
      <div className={`mt-4 h-px w-full ${HAIRLINE}`} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** The 12px box-arrow that ends a row linking out to a block explorer. */
export function ExternalIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 3.25H3.25v9.5h9.5V9.5" />
      <path d="M9.5 3.25h3.25V6.5M12.75 3.25 7.5 8.5" />
    </svg>
  );
}
