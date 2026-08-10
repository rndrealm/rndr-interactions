import { type Asset } from "@/components/ai-input/upload-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import MdPreview from "./md-preview";
import { getExt } from "@/lib/helper/ai-input";

const extColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  doc: "bg-blue-100 text-blue-600",
  docx: "bg-blue-100 text-blue-600",
  txt: "bg-gray-100 text-gray-600",
  csv: "bg-green-100 text-green-600",
  json: "bg-yellow-100 text-yellow-600",
  xls: "bg-green-100 text-green-600",
  xlsx: "bg-green-100 text-green-600",
  md: "bg-purple-100 text-purple-600",
};

interface IProps {
  assets: Asset[];
  onRemove?: (id: string) => void;
}

const AssetPreview = ({ assets, onRemove }: IProps) => {
  return (
    <TooltipProvider delay={300}>
      <div className="flex gap-2 pb-0 overflow-x-auto">
        <AnimatePresence>
          {assets.map((asset) => {
            const isImage = asset.file.type.startsWith("image/");
            const ext = getExt(asset.file.name);
            const colorClass = extColors[ext] ?? "bg-gray-100 text-gray-600";

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
                className="group relative shrink-0 size-20 rounded-lg overflow-hidden border border-black/5"
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
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default AssetPreview;
