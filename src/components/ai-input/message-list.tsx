"use client";

import { type ComponentProps, useEffect, useRef } from "react";
import { type UIMessage } from "ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Loader from "@/components/ai-input/loader";
import BalanceCard from "@/components/ai-input/tools/balance-card";

type BalanceResult = ComponentProps<typeof BalanceCard>["result"];

interface MessageListProps {
  messages: UIMessage[];
  loading?: boolean;
}


export default function MessageList({ messages, loading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl px-2">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn("flex flex-col gap-2", {
              "items-end": message.role === "user",
              "items-start": message.role !== "user",
            })}
          >
            {message.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  if (!part.text) return null;
                  if (message.role === "user") {
                    return (
                      <div
                        key={`${message.id}-text-${i}`}
                        className="rounded-2xl font-medium px-4 py-2.5 text-sm max-w-md bg-[rgba(249,249,249,0.06)] text-[#f9f9f9]"
                      >
                        <p className="whitespace-pre-wrap">{part.text}</p>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`${message.id}-text-${i}`}
                      className="chat-markdown max-w-full text-sm text-[rgba(249,249,249,0.8)]"
                    >
                      <Markdown remarkPlugins={[remarkGfm]}>{part.text}</Markdown>
                    </div>
                  );

                case "tool-checkBalance":
                  if (part.state === "output-available" && part.output) {
                    return (
                      <BalanceCard
                        key={`${message.id}-balance-${i}`}
                        result={part.output as BalanceResult}
                      />
                    );
                  }
                  if (
                    part.state === "input-streaming" ||
                    part.state === "input-available"
                  ) {
                    return (
                      <div
                        key={`${message.id}-balance-pending-${i}`}
                        className="text-xs text-[rgba(249,249,249,0.4)] animate-pulse"
                      >
                        Checking balance...
                      </div>
                    );
                  }
                  return null;

                default:
                  return null;
              }
            })}
          </motion.div>
        ))}

        {loading && (
          <div key="thinking" className="flex items-start px-4 py-2.5">
            <Loader />
          </div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
