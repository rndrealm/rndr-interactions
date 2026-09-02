"use client";

import { useRef } from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { Highlight } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { codeTheme } from "./theme";

interface IProps {
  codeString: string;
  title: string;
}

type TokenSnapshot = { content: string }[];

function getLineKey(line: string, occurrences: Map<string, number>): string {
  const trimmed = line.trim();
  let base: string;

  if (trimmed === "") base = "__empty__";
  else if (trimmed === "{" || trimmed === "}") base = trimmed;
  else if (/^(GET|POST|PUT|DELETE|PATCH)\s/.test(trimmed)) base = "__method__";
  else {
    const match = trimmed.match(/^"([^"]+)"/);
    base = match ? `prop:${match[1]}` : trimmed;
  }

  const count = occurrences.get(base) ?? 0;
  occurrences.set(base, count + 1);
  return `${base}::${count}`;
}

const Code = (props: IProps) => {
  const { codeString, title } = props;
  const prevByKeyRef = useRef<Map<string, TokenSnapshot>>(new Map());

  const lines = codeString.split("\n");
  const occurrences = new Map<string, number>();
  const lineKeys = lines.map((line) => getLineKey(line, occurrences));

  return (
    <div className="rounded-[12px] bg-[#0a0a0a] border border-[#1a1a1a] font-sans mb-4">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-1.5">
        <p className="text-sm text-[#888]">{title}</p>
        <CopyButton codeString={codeString} />
      </div>
      <div className="py-5.5">
        <Highlight theme={codeTheme} code={codeString} language="json">
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            const prevByKey = prevByKeyRef.current;
            const nextByKey = new Map<string, TokenSnapshot>();

            const renderedLines = tokens.map((line, i) => {
              const key = lineKeys[i];
              const prevLine = prevByKey.get(key);
              const isNewLine = !prevLine;

              const snapshot: TokenSnapshot = line.map((t) => ({
                content: t.content,
              }));
              nextByKey.set(key, snapshot);

              const { className: lineClassName } = getLineProps({
                className: "",
                key: i,
                line,
              });

              return (
                <motion.div
                  key={key}
                  layout
                  className={cn("table w-full", lineClassName)}
                  initial={isNewLine ? { opacity: 0, y: -6 } : false}
                  animate={{ opacity: 1, y: 0, backgroundColor: "#0a0a0a" }}
                  exit={{ opacity: 0, y: 6 }}
                  whileHover={{ backgroundColor: "#111" }}
                  transition={{
                    layout: {
                      type: "spring",
                      duration: 0.35,
                      bounce: 0.1,
                    },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 },
                    backgroundColor: { duration: 0.2 },
                  }}
                >
                  <div className="leading-5.25 pl-3 pr-6 text-[#484f58] text-mid">
                    {i + 1}
                  </div>
                  <div className="leading-5.25 table-cell w-full">
                    {line.map((token, j) => {
                      const tokenProps = getTokenProps({ key: j, token });
                      const prevToken = prevLine?.[j];
                      const changed =
                        prevToken !== undefined &&
                        prevToken.content !== token.content;

                      if (changed) {
                        return (
                          <span
                            key={j}
                            className="inline-flex overflow-hidden align-baseline"
                          >
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={token.content}
                                {...tokenProps}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{
                                  duration: 0.25,
                                  ease: "easeOut",
                                }}
                                className={cn(
                                  tokenProps.className,
                                  "py-0.5 text-mid inline-block",
                                )}
                              />
                            </AnimatePresence>
                          </span>
                        );
                      }

                      return (
                        <span
                          {...tokenProps}
                          key={j}
                          className={cn(
                            tokenProps.className,
                            "py-0.5 text-mid",
                          )}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            });

            prevByKeyRef.current = nextByKey;

            return (
              <pre
                className={cn("overflow-auto text-[13px]", className)}
                style={style}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {renderedLines}
                </AnimatePresence>
              </pre>
            );
          }}
        </Highlight>
      </div>
    </div>
  );
};

export default Code;
