"use client";
import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface ICopyCode {
  code: string;
}

// A single-line shell command with a copy button in the corner
export function CopyCode(props: ICopyCode) {
  const { code } = props;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); the
      // command is still selectable by hand
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <pre className="no-scrollbar overflow-x-auto rounded-lg bg-[oklch(0.982_0_0)] py-3.5 pl-4 pr-12 font-mono text-[13px] leading-[1.55]">
        <code>
          {code.split(" ").map((word, index) => (
            <React.Fragment key={index}>
              {index > 0 && " "}
              {/* The command itself reads darker than its arguments */}
              <span
                className={
                  index === 0
                    ? "text-[oklch(0.503_0_0)]"
                    : "text-[rgb(3_47_98)]"
                }
              >
                {word}
              </span>
            </React.Fragment>
          ))}
        </code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="absolute top-1.5 right-1.5 flex size-8 cursor-pointer items-center justify-center rounded-md text-[oklch(0.649_0_0)] outline-none transition-colors hover:text-[oklch(0.503_0_0)] focus-visible:ring-2 focus-visible:ring-[oklch(0.708_0_0)]"
      >
        {copied ? (
          <Check size={16} aria-hidden />
        ) : (
          <Copy size={16} aria-hidden />
        )}
      </button>
    </div>
  );
}
