"use client";

import { useCallback, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import ChatInput, { type ChatInputHandle } from "@/components/ai-input/chat-input";
import MessageList from "@/components/ai-input/message-list";
import { type ModelId } from "@/components/ai-input/model-switcher";
import AppLogo from "@/components/ai-input/app-logo";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon } from "@/components/icons/ai-input";

const presetPrompts = [
  "Check my wallet balance",
  "What tokens do I hold?",
  "How much ETH do I have?",
];

const AiInputPage = () => {
  const chatInputRef = useRef<ChatInputHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [exhausted, setExhausted] = useState(false);
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
  const [showScrollDown, setShowScrollDown] = useState(false);

  const { messages, sendMessage, status } = useChat();

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceFromBottom > 100);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const isActive = status === "streaming" || status === "submitted";
  const lastMessage = messages[messages.length - 1];
  const assistantHasText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((p) => p.type === "text" && p.text);
  const thinking = isActive && !assistantHasText;
  const hasMessages = messages.length > 0 || thinking;

  const handleSubmit = (text: string) => {
    sendMessage({ parts: [{ type: "text", text }] }, { body: { model } });
  };

  const inputProps = {
    onSubmit: handleSubmit,
    loading: isActive,
    presetPrompts,
    model,
    onModelChange: setModel,
    exhausted,
    onExhaustedDismiss: () => setExhausted(false),
  } as const;

  if (!hasMessages) {
    return (
      <main className="w-screen h-screen flex flex-col items-center justify-center px-4 bg-[#1A1A1A]">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <AppLogo className="mb-4" />
          <p className="text-[rgba(249,249,249,0.5)]  text-lg mb-6">
            How can I help you Rndr?
          </p>
          <ChatInput ref={chatInputRef} {...inputProps} showPresets={false} />
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {presetPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                whileTap={{ scale: 0.95 }}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer bg-[#262626] text-[rgba(249,249,249,0.5)] hover:text-[#f9f9f9] transition-colors"
                style={{ boxShadow: "0px 0px 0px 1px #333333" }}
                onClick={() => chatInputRef.current?.insertText(prompt)}
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen flex flex-col items-center bg-[#1A1A1A]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto w-full flex flex-col items-center pt-8 pb-4 chat-scroll-mask scroll-pt-10 scroll-pb-10"
      >
        <MessageList messages={messages} loading={thinking} />
      </div>
      <div className="w-full flex justify-center relative pb-6 px-4">
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToBottom}
              className="absolute -top-12 left-1/2 -translate-x-1/2 size-8 rounded-full bg-[#333333] hover:bg-[#404040] cursor-pointer flex items-center justify-center transition-colors"
              style={{ boxShadow: "0px 0px 0px 1px #444444" }}
            >
              <ChevronDownIcon className="size-5 text-[rgba(249,249,249,0.6)]" />
            </motion.button>
          )}
        </AnimatePresence>
        <ChatInput {...inputProps} showPresets={false} compact />
      </div>
    </main>
  );
};

export default AiInputPage;
