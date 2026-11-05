"use client";
import React from "react";
import { useReducedMotion } from "motion/react";

interface ITableOfContents {
  sections: { id: string; label: string }[];
}

// Section links that glide to their heading instead of jumping. Reduced
// motion jumps as before: a long page-wide scroll is exactly the kind of
// motion it asks to avoid.
export function TableOfContents(props: ITableOfContents) {
  const { sections } = props;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <nav aria-label="On this page" className="hidden pt-7.5 min-[1080px]:block">
      <ul className="flex max-w-40 flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                const target = document.getElementById(section.id);
                if (!target) return;
                e.preventDefault();
                // Respects the heading's scroll-margin, so it lands clear of
                // the top edge
                target.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                });
                // Keep the URL shareable without the browser's own jump
                history.replaceState(null, "", `#${section.id}`);
              }}
              className="font-geist text-[13px] leading-[1.2] text-[oklch(0.649_0_0)] transition-colors hover:text-[oklch(0.375_0_0)]"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
