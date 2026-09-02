"use client";

import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import {
  ModelSwitcher,
  type ModelId,
} from "@/components/ai-input/model-switcher";
import { Tiptap, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import AudioButton from "@/components/ai-input/audio-button";
import UploadButton, { type Asset } from "@/components/ai-input/upload-button";
import AssetPreview from "@/components/ai-input/asset-preview";

interface ChatInputProps {
  onSubmit: (text: string, assets: Asset[]) => void;
  loading?: boolean;
  presetPrompts?: string[];
  showPresets?: boolean;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  exhausted?: boolean;
  onExhaustedDismiss?: () => void;
}

export interface ChatInputHandle {
  insertText: (text: string) => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({
  onSubmit,
  loading = false,
  presetPrompts = [],
  showPresets: showPresetsProp = true,
  model,
  onModelChange,
  exhausted = false,
  onExhaustedDismiss,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<() => void>(() => {});
  const [more, setMore] = useState(false);
  const [animatingText, setAnimatingText] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onFocus: (editor) => {
      const _text = editor.editor.getText();
      if (_text) return;
      setMore(true);
    },
    onBlur: () => {
      setMore(false);
    },
    editorProps: {
      attributes: {
        class: "text-sm",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitRef.current();
          return true;
        }
        return false;
      },
    },
  });

  const handleSubmit = () => {
    if (!editor || loading) return;
    const text = editor.getText().trim();
    if (!text) return;
    editor.commands.clearContent();
    onSubmit(text, assets);
    setAssets([]);
  };

  submitRef.current = handleSubmit;

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      setAnimatingText(text);
    },
  }));

  if (!editor) return null;

  const showPresets =
    showPresetsProp && more && assets.length === 0 && presetPrompts.length > 0;
  const expanded = exhausted || showPresets;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl rounded-[16px] relative "
      style={{
        boxShadow: "0px 0px 0px 1px #333333",
      }}
    >
      {loading ? (
        <div
          className={`nabu-gradient absolute inset-0 rounded-2xl ${loading ? "active" : ""}`}
        ></div>
      ) : null}

      <AnimatePresence>
        {showPresets ? (
          <motion.div
            className="absolute bottom-0 left-0 rounded-2xl w-full bg-[#1a1a1a]"
            initial={{ height: "100%" }}
            animate={{ height: "calc(100% + 100px)" }}
            exit={{ height: "100%" }}
          >
            <div className="flex flex-col text-xs pt-2.5 px-2.5">
              {presetPrompts.map((prompt, i) => {
                const isLast = i === presetPrompts.length - 1;
                return (
                  <button
                    key={prompt}
                    className={cn("cursor-pointer text-left px-2 py-1.5", {
                      "border-b border-b-white/5": !isLast,
                    })}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setAnimatingText(prompt);
                      setMore(false);
                    }}
                  >
                    <p className="text-[rgba(249,249,249,0.5)] hover:text-[#f9f9f9] transition-colors">
                      {prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {exhausted ? (
        <motion.div
          className="absolute bottom-0 left-0 rounded-2xl w-full bg-[#1a1a1a]"
          animate={{ height: exhausted ? "calc(100% + 30px)" : "100%" }}
        >
          <div className="flex items-center justify-between text-xs text-[rgba(249,249,249,0.5)] pt-2.5 px-2.5">
            <p>10 Credits remaining</p>
            <div className="flex items-center gap-1.5">
              <button className="cursor-pointer hover:underline">
                <p>Upgrade</p>
              </button>
              <button
                className="mt-0.5 cursor-pointer"
                onClick={onExhaustedDismiss}
              >
                <X className="size-3" strokeWidth={3} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <motion.div
        className="bg-[#262626] relative p-3"
        animate={{
          margin: expanded ? 3 : loading ? 1 : 0,
          borderRadius: expanded ? 13 : loading ? 15 : 16,
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="relative">
          <motion.div
            animate={{ height: assets.length > 0 ? "auto" : 0 }}
            transition={
              assets.length > 0
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            <AssetPreview
              assets={assets}
              onRemove={(id) =>
                setAssets((prev) => prev.filter((a) => a.id !== id))
              }
            />
          </motion.div>
          <div className="pt-2 relative">
            <Tiptap editor={editor}>
              <Tiptap.Content
                className={cn(
                  "prose prose-invert outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-11 [&_.tiptap]:text-[#f9f9f9] p-1",
                  animatingText && "invisible",
                )}
              />
            </Tiptap>
          <AnimatePresence>
            {animatingText && (
              <motion.p
                className="absolute inset-0 p-1 pt-3 text-sm text-[#f9f9f9]"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.01 },
                  },
                }}
                onAnimationComplete={() => {
                  editor?.commands.setContent(`<p>${animatingText}</p>`);
                  setAnimatingText(null);
                  editor?.commands.focus("end");
                }}
              >
                {animatingText.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.p>
            )}
          </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 relative">
          <UploadButton
            onUpload={(newAssets) =>
              setAssets((prev) => [...prev, ...newAssets])
            }
          />
          <div className="flex items-center gap-2.5">
            <div>
              <ModelSwitcher value={model} onChange={onModelChange} />
            </div>
            <AudioButton />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSubmit}
              className="bg-[#5A7FD4] rounded-full cursor-pointer size-8 flex items-center justify-center"
            >
              <ArrowUp className="size-4 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default ChatInput;
