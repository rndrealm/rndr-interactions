"use client";

import { forwardRef, useImperativeHandle, useState, useCallback } from "react";
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

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) command(item);
    },
    [items, command],
  );

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg z-50">
        <p className="text-xs text-muted-foreground">No documents found</p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => b.label.length - a.label.length);

  return (
    <div className="flex flex-col items-start gap-1">
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
            className={cn("flex w-fit items-center cursor-pointer")}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div
              className={cn(
                "whitespace-nowrap transition-colors rounded-[8px] h-8.5 w-11 flex justify-center items-center backdrop-blur-xl",
                index === selectedIndex
                  ? "bg-surface-elevated/70 text-foreground shadow-sm"
                  : "bg-background-recessed/70 text-foreground/70",
              )}
            >
              <p className="text-xs font-medium">
                {capitalizeFirst(item.type.slice(0, 3))}
              </p>
            </div>
            <div
              className={cn(
                "size-9 shrink-0 flex items-center justify-center rounded-[8px] bg-background backdrop-blur-xl",
              )}
            >
              <DocIcon type={item.type} className="size-3.5" />
            </div>
            <div
              className={cn(
                "flex flex-col h-8.5 whitespace-nowrap transition-colors rounded-[8px] justify-center items-center px-2.5 backdrop-blur-xl",
                index === selectedIndex
                  ? "bg-surface-elevated/70 text-foreground shadow-sm"
                  : "bg-background-recessed/70 text-foreground/70",
              )}
            >
              <span className="text-xs font-medium text-foreground leading-3.5">
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
