import { useRef } from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { getExt } from "@/lib/helper/ai-input";

export interface Asset {
  id: string;
  file: File;
  preview: string;
  content?: string;
}

interface UploadButtonProps {
  onUpload: (assets: Asset[]) => void;
}

const UploadButton = ({ onUpload }: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newAssets: Asset[] = await Promise.all(
      Array.from(files).map(async (file) => {
        const ext = getExt(file.name);
        const content = ext === "md" ? await file.text() : undefined;
        return {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          content,
        };
      }),
    );

    onUpload(newAssets);
    e.target.value = "";
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => inputRef.current?.click()}
        className="bg-[#F9F9F9] rounded-full cursor-pointer size-8 flex items-center justify-center"
        style={{ boxShadow: "0px 0px 0px 1px #DBD1D140" }}
      >
        <Plus className="size-4" />
      </motion.button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.xls,.xlsx,.md"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
};

export default UploadButton;
