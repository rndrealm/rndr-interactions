"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, ChevronDown } from "lucide-react";
import { ClaudeIcon, GeminiIcon, OpenaiIcon } from "@/lib/assets";
import Image from "next/image";
import { cn } from "@/lib/utils";

const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    icon: OpenaiIcon,
    description:
      "High-intelligence flagship model for complex, multi-step tasks",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    icon: OpenaiIcon,
    description: "Affordable small model for fast, lightweight tasks",
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "Anthropic",
    icon: ClaudeIcon,
    description: "Best combination of performance and speed for most tasks",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    icon: ClaudeIcon,
    description: "Fastest and most compact model for near-instant responses",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    icon: GeminiIcon,
    description: "Advanced reasoning model with built-in thinking capabilities",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    icon: GeminiIcon,
    description: "Fast, efficient model optimized for speed and cost",
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
        <p className="text-xs">{selectedModel?.name ?? "Model"}</p>
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
        <TooltipProvider delay={0} closeDelay={100}>
          {models.map((model) => (
            <Tooltip key={model.id}>
              <TooltipTrigger
                render={
                  <DropdownMenuItem
                    onClick={() => {
                      setSelected(model.id);
                    }}
                    className="flex items-center justify-between cursor-pointer h-9 py-0"
                  />
                }
              >
                <div className="flex items-center gap-2">
                  <div>
                    <Image src={model.icon} alt={model.name} />
                  </div>
                  <span className="text-xs">{model.name}</span>
                </div>
                {selected === model.id && (
                  <div className="bg-[#31c531] size-3.5 rounded-full flex justify-center items-center">
                    <CheckIcon className="size-2.5 stroke-white" />
                  </div>
                )}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={4}
                arrow={false}
                className="animate-none!"
              >
                <p>{model.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
