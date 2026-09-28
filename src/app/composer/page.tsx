"use client";

import { useRef, useState } from "react";
import ChatInput, { type ChatInputHandle } from "@/components/composer/chat-input";
import { type ModelId } from "@/components/composer/model-switcher";
import { ComposerStoreProvider } from "@/providers/composer-store-provider";
import { MotionConfig, motion } from "motion/react";

const presetPrompts = [
  "Check my wallet balance",
  "What tokens do I hold?",
  "How much ETH do I have?",
];

function ComposerDemo() {
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [model, setModel] = useState<ModelId>("claude-sonnet-4-6");
  const [exhausted, setExhausted] = useState(false);

  const handleSubmit = (text: string) => {
    console.log("submit:", text);
  };

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <p className="text-muted-foreground text-lg mb-6 text-balance">
          How can I help you?
        </p>
        <ChatInput
          ref={chatInputRef}
          onSubmit={handleSubmit}
          presetPrompts={presetPrompts}
          model={model}
          onModelChange={setModel}
          exhausted={exhausted}
          onExhaustedDismiss={() => setExhausted(false)}
        />
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {presetPrompts.map((prompt) => (
            <motion.button
              key={prompt}
              whileTap={{ scale: 0.95 }}
              className="text-[13px] leading-4 font-medium px-3 py-2 rounded-full cursor-pointer bg-grey-component hover:bg-grey-component-hover text-grey-body-text hover:text-foreground transition-colors"
              style={{ boxShadow: "0px 0px 0px 1px var(--grey-border)" }}
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

export default function ComposerPage() {
  return (
    <ComposerStoreProvider>
      <MotionConfig reducedMotion="user">
        <ComposerDemo />
      </MotionConfig>
    </ComposerStoreProvider>
  );
}
