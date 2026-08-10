import { Asset } from "./upload-button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";

interface IProps {
  asset: Asset;
  onRemove?: (id: string) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MdPreview = ({ asset, onRemove }: IProps) => {
  const [open, setOpen] = useState(false);
  const lineCount = asset.content?.split("\n").length ?? 0;

  return (
    <>
      <div
        className="w-50 h-20 border group rounded-md overflow-hidden relative cursor-pointer"
        style={{
          boxShadow:
            "0px 0px 0px 1px #F1F1F140, 0px 1px 2.5px 0px #DCDCDC40, 2px 10px 24px 0px #DCDCDC40",
        }}
        onClick={() => setOpen(true)}
      >
        <div
          className="whitespace-pre-wrap p-2"
          style={{
            maskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 30%, transparent 90%)",
          }}
        >
          <h3 className="text-xs pb-1 font-medium">{asset.file.name}</h3>
          <p className="text-[10px]">{asset.content?.slice(0, 100)}</p>
        </div>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(asset.id);
            }}
            className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-2.5 text-white" strokeWidth={3} />
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-4 data-[state=closed]:duration-200"
        >
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-base font-semibold">{asset.file.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(asset.file.size)}
                {" • "}
                {lineCount} lines
                {" • "}
                Formatting may be inconsistent from source
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="px-5 pb-5 flex-1 min-h-0">
            <div className="bg-[#F5F5F5] rounded-lg p-4 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono text-[#333]">
                {asset.content}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MdPreview;
