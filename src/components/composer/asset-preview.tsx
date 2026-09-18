"use client";

import { type Asset } from "./upload-button";
import type { PendingContext } from "@/providers/composer-store-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import MdPreview from "./md-preview";
import { cn } from "@/lib/utils";

const getExt = (name: string) =>
  name.split(".").pop()?.toLowerCase() ?? "";

const extColors: Record<string, string> = {
  pdf: "bg-red-900/30 text-red-400",
  doc: "bg-blue-900/30 text-blue-400",
  docx: "bg-blue-900/30 text-blue-400",
  txt: "bg-accent text-muted-foreground",
  csv: "bg-green-900/30 text-green-400",
  json: "bg-yellow-900/30 text-yellow-400",
  xls: "bg-green-900/30 text-green-400",
  xlsx: "bg-green-900/30 text-green-400",
  md: "bg-purple-900/30 text-purple-400",
};

interface IProps {
  assets: Asset[];
  onRemove?: (id: string) => void;
  ghostAsset?: PendingContext | null;
}

const AssetPreview = ({ assets, onRemove, ghostAsset }: IProps) => {
  return (
    <TooltipProvider delay={300}>
      <div className="flex gap-2 pb-0 overflow-x-auto">
        <AnimatePresence>
          {assets.map((asset) => {
            const isImage = asset.file.type.startsWith("image/");
            const ext = getExt(asset.file.name);
            const colorClass = extColors[ext] ?? "bg-accent text-muted-foreground";

            if (ext === "md") {
              return (
                <MdPreview asset={asset} onRemove={onRemove} key={asset.id} />
              );
            }
            return (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.15 },
                }}
                className="group relative shrink-0 size-20 rounded-lg overflow-hidden border border-accent"
              >
                {isImage ? (
                  <img
                    src={asset.preview}
                    alt={asset.file.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div
                          className={`size-full flex items-center justify-center ${colorClass}`}
                        />
                      }
                    >
                      <p className="text-xs font-semibold uppercase">{ext}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{asset.file.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(asset.id)}
                    className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-2.5 text-white" strokeWidth={3} />
                  </button>
                )}
              </motion.div>
            );
          })}

          {ghostAsset && (
            <motion.div
              key="ghost"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              className={cn(
                "relative shrink-0 rounded-md overflow-hidden border border-dashed border-purple-400/40 cursor-pointer",
                ghostAsset.imageUrl ? "size-20" : "w-50 h-20",
              )}
              style={{
                boxShadow:
                  "0px 0px 0px 1px oklch(from var(--foreground) l c h / 4%), 0px 1px 2.5px 0px oklch(0 0 0 / 30%)",
              }}
            >
              {ghostAsset.imageUrl ? (
                <img
                  src={ghostAsset.imageUrl}
                  alt={ghostAsset.fileName}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className="whitespace-pre-wrap p-2"
                  style={{
                    maskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
                  }}
                >
                  <h3 className="text-xs pb-1 font-medium text-foreground">
                    {ghostAsset.fileName}
                  </h3>
                  <p className="text-[10px] text-foreground/40">
                    {ghostAsset.content.slice(0, 100)}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default AssetPreview;
