"use client";

import { useRef, useState } from "react";
import { ModelSwitcher } from "@/components/ai-input/model-switcher";
import { Tiptap, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import AudioButton from "@/components/ai-input/audio-button";
import UploadButton, { type Asset } from "@/components/ai-input/upload-button";
import AssetPreview from "@/components/ai-input/asset-preview";

const presetPrompts = [
  "Write a poem about the ocean",
  "Explain quantum computing simply",
  "Plan a weekend trip to Tokyo",
];

const AiInput = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [more, setMore] = useState(false);
  const [animatingText, setAnimatingText] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleSubmit = () => {
    if (!editor || loading) return;
    const text = editor.getText().trim();
    if (!text) return;
    if (text.toLocaleLowerCase() === "limit") {
      setMore(false);
      setExhausted(true);
    } else {
      editor.commands.clearContent();
      setLoading(true);
    }
  };

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
          handleSubmit();
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <main className="w-screen h-screen flex items-center justify-center ">
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-2xl relative"
        style={{
          boxShadow: "0px 0px 0px 1px #DBD1D140",
        }}
      >
        {loading ? (
          <div
            className={`nabu-gradient absolute inset-0 rounded-2xl ${loading ? "active" : ""}`}
          ></div>
        ) : null}

        <AnimatePresence>
          {more && assets.length === 0 ? (
            <motion.div
              className="absolute bottom-0 left-0 rounded-2xl  w-full bg-[#82A7F1] "
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
                      className={cn("cursor-pointer text-left px-2 py-1.5 ", {
                        "border-b border-b-white/10": !isLast,
                      })}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setAnimatingText(prompt);
                        setMore(false);
                      }}
                    >
                      <p className="text-white">{prompt}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {exhausted ? (
          <motion.div
            className="absolute bottom-0 left-0 rounded-2xl  w-full bg-[#82A7F1] "
            animate={{ height: exhausted ? "calc(100% + 30px)" : "100%" }}
          >
            <div className="flex items-center justify-between text-xs text-white pt-2.5 px-2.5">
              <p className="">10 Credits remaining</p>
              <div className="flex items-center gap-1.5">
                <button className="cursor-pointer hover:underline">
                  <p>Upgrade</p>
                </button>
                <button
                  className="mt-0.5 cursor-pointer"
                  onClick={() => setExhausted(false)}
                >
                  <X className="size-3" strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          className="bg-white relative p-3"
          animate={{
            margin:
              exhausted || (more && assets.length === 0) ? 3 : loading ? 1 : 0,
            borderRadius:
              exhausted || (more && assets.length === 0)
                ? 13
                : loading
                  ? 15
                  : 16,
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="relative">
            <AssetPreview
              assets={assets}
              onRemove={(id) =>
                setAssets((prev) => prev.filter((a) => a.id !== id))
              }
            />
            <div className="pt-2">
              <Tiptap editor={editor}>
                <Tiptap.Content
                  className={cn(
                    "prose prose-invert outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-11 p-1",
                    animatingText && "invisible",
                  )}
                />
              </Tiptap>
            </div>
            <AnimatePresence>
              {animatingText && (
                <motion.p
                  className="absolute inset-0 p-1 pt-3 text-sm"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.02 },
                    },
                  }}
                  onAnimationComplete={() => {
                    editor?.commands.setContent(`<p>${animatingText}</p>`);
                    setAnimatingText(null);
                  }}
                >
                  {animatingText.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-4 relative">
            <UploadButton
              onUpload={(newAssets) =>
                setAssets((prev) => [...prev, ...newAssets])
              }
            />
            <div className="flex items-center gap-2.5">
              <div>
                <ModelSwitcher />
              </div>
              <AudioButton />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmit}
                className="bg-[#F9F9F9] rounded-full cursor-pointer size-8 flex items-center justify-center"
                style={{ boxShadow: "0px 0px 0px 1px #DBD1D140" }}
              >
                <ArrowUp className="size-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AiInput;
