"use client";

import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import ChatInput, { type ChatInputHandle } from "@/components/ai-input/chat-input";
import MessageList from "@/components/ai-input/message-list";
import { type ModelId } from "@/components/ai-input/model-switcher";
import AppLogo from "@/components/ai-input/app-logo";
import { motion } from "motion/react";

const presetPrompts = [
  "Check my wallet balance",
  "What tokens do I hold?",
  "How much ETH do I have?",
];

const AiInputPage = () => {
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [exhausted, setExhausted] = useState(false);
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");

  const { messages, sendMessage, status } = useChat();

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
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center pt-8 pb-4">
        <MessageList messages={messages} loading={thinking} />
      </div>
      <div className="w-full flex justify-center pb-6 px-4">
        <ChatInput {...inputProps} showPresets={false} />
      </div>
    </main>
  );
};

export default AiInputPage;
