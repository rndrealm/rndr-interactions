"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, ChevronDown } from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenaiIcon } from "@/lib/assets";
import Image from "next/image";
import { cn } from "@/lib/utils";

const models = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", icon: OpenaiIcon },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    icon: OpenaiIcon,
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "Anthropic",
    icon: ClaudeIcon,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    icon: ClaudeIcon,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    icon: GeminiIcon,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    icon: GeminiIcon,
  },
];

export function ModelSwitcher() {
  const [selected, setSelected] = useState(models[0].id);
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((m) => m.id === selected);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="rounded-full hover:bg-[#f9f9f9] cursor-pointer focus-visible:outline-none focus-visible:ring-0"
          />
        }
      >
          {selectedModel ? (
            <div>
              <Image src={selectedModel.icon} alt={selectedModel.name} />
            </div>
          ) : null}
          <p className="text-sm">{selectedModel?.name ?? "Model"}</p>
          <div>
            <ChevronDown
              className={cn("transition-transform", { "rotate-180": open })}
            />
          </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="start"
        style={{
          boxShadow:
            "0px 0px 0px 1px #F1F1F140, 0px 1px 2.5px 0px #DCDCDC40, 2px 10px 24px 0px #DCDCDC40",
        }}
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => setSelected(model.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div>
                <Image src={model.icon} alt={model.name} />
              </div>
              <span className="text-sm">{model.name}</span>
            </div>
            {selected === model.id && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
