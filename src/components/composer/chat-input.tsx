"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ModelSwitcher,
  type ModelId,
} from "@/components/composer/model-switcher";
import { Tiptap, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { documentSuggestion } from "@/components/composer/document-suggestion";
import { ArrowUp, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import AudioButton from "@/components/composer/audio-button";
import UploadButton, { type Asset } from "@/components/composer/upload-button";
import AssetPreview from "@/components/composer/asset-preview";
import { useComposerStore } from "@/providers/composer-store-provider";

export interface MentionedDoc {
  id: string;
  label: string;
}

interface ChatInputProps {
  onSubmit: (text: string, assets: Asset[], mentions: MentionedDoc[]) => void;
  loading?: boolean;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  exhausted?: boolean;
  onExhaustedDismiss?: () => void;
  compact?: boolean;
}

export interface ChatInputHandle {
  insertText: (text: string) => void;
}

const STORE_KEY = "composer-default";

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      onSubmit,
      loading = false,
      model,
      onModelChange,
      exhausted = false,
      onExhaustedDismiss,
      compact = false,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef<() => void>(() => {});
    const [hovering, setHovering] = useState(false);
    const [animatingText, setAnimatingText] = useState<string | null>(null);

    const { save, load, pendingContext, consumePendingContext } =
      useComposerStore();
    const initialHtml = useRef(load(STORE_KEY)?.html || "");
    const [assets, setAssets] = useState<Asset[]>(
      () => load(STORE_KEY)?.assets || [],
    );

    const assetsRef = useRef(assets);
    assetsRef.current = assets;

    const editor = useEditor({
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: { class: "mention" },
          suggestion: documentSuggestion,
        }),
      ],
      content: initialHtml.current,
      editorProps: {
        attributes: {
          class: "text-sm",
        },
        handleKeyDown: (view, event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            if (view.dom.querySelector(".suggestion")) return false;
            event.preventDefault();
            submitRef.current();
            return true;
          }
          return false;
        },
      },
    });

    useEffect(() => {
      return () => {
        try {
          if (editor && !editor.isDestroyed) {
            save(STORE_KEY, {
              html: editor.getHTML(),
              assets: assetsRef.current,
            });
          }
        } catch {
          // Editor may already be destroyed by Tiptap's own cleanup
        }
      };
    }, [editor, save]);

    const handleSubmit = () => {
      if (!editor || loading) return;
      const text = editor.getText().trim();
      if (!text) return;

      const mentions: MentionedDoc[] = [];
      const walk = (node: Record<string, unknown>) => {
        if (node.type === "mention" && node.attrs) {
          const attrs = node.attrs as { id: string; label: string };
          mentions.push({ id: attrs.id, label: attrs.label });
        }
        (node.content as Record<string, unknown>[] | undefined)?.forEach(walk);
      };
      (
        editor.getJSON().content as Record<string, unknown>[] | undefined
      )?.forEach(walk);

      editor.commands.clearContent();
      onSubmit(text, assets, mentions);
      setAssets([]);
    };

    submitRef.current = handleSubmit;

    const showGhost = hovering && !!pendingContext;

    const handleDrop = () => {
      const ctx = consumePendingContext();
      if (!ctx) return;
      if (ctx.imageUrl) {
        const file = new File([], ctx.fileName, { type: "image/png" });
        setAssets((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            file,
            preview: ctx.imageUrl!,
            content: ctx.content,
          },
        ]);
      } else {
        const file = new File([ctx.content], ctx.fileName, {
          type: "text/markdown",
        });
        setAssets((prev) => [
          ...prev,
          { id: crypto.randomUUID(), file, preview: "", content: ctx.content },
        ]);
      }
    };

    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        setAnimatingText(text);
      },
    }));

    if (!editor) {
      return (
        <div
          className="w-full max-w-2xl rounded-[16px] relative"
          style={{ boxShadow: "0px 0px 0px 1px var(--surface-elevated)" }}
        >
          <div
            className={cn(
              "bg-card relative rounded-[16px]",
              compact ? "px-3 py-2" : "p-3",
            )}
          >
            <div className={cn("relative", compact ? "pt-1" : "pt-2")}>
              <div className={cn("p-1", compact ? "min-h-8" : "min-h-11")} />
            </div>
            <div
              className={cn(
                "flex items-center justify-between relative",
                compact ? "mt-1.5" : "mt-4",
              )}
            >
              <div className="size-8" />
              <div className="flex items-center gap-2.5">
                <div className="size-8" />
                <div className="size-8" />
                <div className="bg-primary rounded-full size-8" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const expanded = exhausted;

    return (
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-[16px] relative"
        style={{
          boxShadow: "0px 0px 0px 1px var(--surface-elevated)",
        }}
        data-composer
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={showGhost ? handleDrop : undefined}
      >
        {loading ? (
          <div
            className={`nabu-gradient absolute inset-0 rounded-2xl ${loading ? "active" : ""}`}
          ></div>
        ) : null}

        {exhausted ? (
          <motion.div
            className="absolute bottom-0 left-0 rounded-2xl w-full bg-background"
            animate={{ height: exhausted ? "calc(100% + 30px)" : "100%" }}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2.5 px-2.5">
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
          className={cn("bg-card relative", compact ? "px-3 py-2" : "p-3")}
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
              animate={{ height: assets.length > 0 || showGhost ? "auto" : 0 }}
              transition={
                assets.length > 0 || showGhost
                  ? { duration: 0 }
                  : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
              }
              style={{ overflow: "hidden" }}
            >
              <AssetPreview
                assets={assets}
                ghostAsset={showGhost ? pendingContext : null}
                onRemove={(id) =>
                  setAssets((prev) => prev.filter((a) => a.id !== id))
                }
              />
            </motion.div>
            <div className={cn("relative", compact ? "pt-1" : "pt-2")}>
              <Tiptap editor={editor}>
                <Tiptap.Content
                  className={cn(
                    "prose prose-invert outline-none [&_.tiptap]:outline-none [&_.tiptap]:text-foreground p-1",
                    compact ? "[&_.tiptap]:min-h-8" : "[&_.tiptap]:min-h-11",
                    animatingText && "invisible",
                  )}
                />
              </Tiptap>
              <AnimatePresence>
                {animatingText && (
                  <motion.p
                    className="absolute inset-0 p-1 pt-3 text-sm text-foreground"
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

          <div
            className={cn(
              "flex items-center justify-between relative",
              compact ? "mt-1.5" : "mt-4",
            )}
          >
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
                className="bg-primary rounded-full cursor-pointer size-8 flex items-center justify-center"
              >
                <ArrowUp className="size-4 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

export default ChatInput;
