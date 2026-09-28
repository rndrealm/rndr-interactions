"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { PdfIcon, FileIcon, MarkdownIcon } from "@/components/icons/composer";

export type DocumentType =
  | "pdf"
  | "doc"
  | "spreadsheet"
  | "presentation"
  | "text"
  | "md";

export interface DocumentItem {
  id: string;
  label: string;
  type: DocumentType;
  size: string;
}

interface DocumentSuggestionListProps {
  items: DocumentItem[];
  command: (item: DocumentItem) => void;
}

export interface DocumentSuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// Chrome accepts url() alongside other filter functions here, but the CSS
// pipeline drops it, so it is set inline and falls back to the .glass blur.
const GLASS_REFRACTION = {
  backdropFilter: "url(#glass-refraction) blur(4px) saturate(180%)",
} as const;

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function DocIcon({
  type,
  className,
}: {
  type: DocumentType;
  className?: string;
}) {
  if (type === "pdf") return <PdfIcon className={className} />;
  if (type === "md") return <MarkdownIcon className={className} />;
  return <FileIcon className={className} />;
}

const DocumentSuggestionList = forwardRef<
  DocumentSuggestionListHandle,
  DocumentSuggestionListProps
>(function DocumentSuggestionList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // The list is rendered in this order, so selection must index into it too.
  // Indexing into the unsorted `items` picks a different document than the
  // one the person is looking at.
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.label.length - a.label.length),
    [items],
  );

  // Narrowing the query can leave the highlight past the end of the new list,
  // which drops the highlight and makes Enter do nothing until an arrow key.
  // Adjusted during render rather than in an effect, so there is no second pass.
  const resultKey = sorted.map((item) => item.id).join(",");
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  if (resultKey !== lastResultKey) {
    setLastResultKey(resultKey);
    setSelectedIndex(0);
  }

  const activeIndex = Math.min(selectedIndex, Math.max(sorted.length - 1, 0));

  const selectItem = useCallback(
    (index: number) => {
      const item = sorted[index];
      if (item) command(item);
    },
    [sorted, command],
  );

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + sorted.length - 1) % sorted.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % sorted.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(activeIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-card p-3 shadow-overlay z-50">
        <p className="text-xs text-muted-foreground">No documents found</p>
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Documents to mention"
      className="flex flex-col items-start gap-1"
    >
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
        <filter
          id="glass-refraction"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.022"
            numOctaves="2"
            seed="11"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      {sorted.map((item, index) => {
        const reverseIndex = sorted.length - 1 - index;
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.15,
              delay: reverseIndex * 0.01,
              ease: "easeOut",
            }}
            role="option"
            aria-selected={index === activeIndex}
            type="button"
            className={cn("flex w-fit items-center cursor-pointer")}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div
              className={cn(
                "glass whitespace-nowrap rounded-[8px] h-8.5 w-11 flex justify-center items-center",
                index === activeIndex
                  ? "glass-active text-foreground"
                  : "text-foreground/70",
              )}
              style={GLASS_REFRACTION}
            >
              <p className="text-xs font-semibold">
                {capitalizeFirst(item.type.slice(0, 3))}
              </p>
            </div>
            <div
              className={cn(
                "glass size-9 shrink-0 flex items-center justify-center rounded-[8px]",
                index === activeIndex && "glass-active",
              )}
              style={GLASS_REFRACTION}
            >
              <DocIcon type={item.type} className="size-3.5" />
            </div>
            <div
              className={cn(
                "glass flex flex-col h-8.5 whitespace-nowrap rounded-[8px] justify-center items-center px-2.5",
                index === activeIndex
                  ? "glass-active text-foreground"
                  : "text-foreground/70",
              )}
              style={GLASS_REFRACTION}
            >
              <span className="text-xs font-semibold text-foreground leading-3.5">
                {item.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
});

export default DocumentSuggestionList;
