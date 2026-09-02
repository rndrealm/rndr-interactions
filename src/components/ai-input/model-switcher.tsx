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
import { ClaudeIcon } from "@/lib/assets";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const models = [
  {
    id: "claude-sonnet-4-6",
    name: "Sonnet 4.6",
    description: "Great balance of speed and intelligence for most tasks",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5",
    description: "Fastest and most compact for near-instant responses",
  },
  {
    id: "claude-sonnet-5",
    name: "Sonnet 5",
    description: "Most capable Sonnet — strongest reasoning and coding",
  },
  {
    id: "claude-opus-5",
    name: "Opus 5",
    description: "Most powerful model for complex, multi-step tasks",
  },
] as const;

export type ModelId = (typeof models)[number]["id"];

interface ModelSwitcherProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
}

export function ModelSwitcher({ value, onChange }: ModelSwitcherProps) {
  const [open, setOpen] = useState(false);

  const selectedModel = models.find((m) => m.id === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="rounded-full hover:bg-[rgba(249,249,249,0.06)] aria-expanded:bg-[rgba(249,249,249,0.06)] aria-expanded:text-inherit cursor-pointer focus-visible:outline-none focus-visible:ring-0"
          />
        }
      >
        <div>
          <Image src={ClaudeIcon} alt="Claude" />
        </div>
        <p className="text-xs text-[rgba(249,249,249,0.5)]">{selectedModel?.name ?? "Model"}</p>
        <div>
          <ChevronDown
            className={cn("transition-transform text-[rgba(249,249,249,0.4)]", { "rotate-180": open })}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#262626]! text-[rgba(249,249,249,0.7)]! border-0! ring-0!"
        align="start"
        style={{
          boxShadow: "0px 0px 0px 1px #333333",
        }}
      >
        <TooltipProvider delay={0} closeDelay={100}>
          {models.map((model) => (
            <Tooltip key={model.id}>
              <TooltipTrigger
                render={
                  <DropdownMenuItem
                    onClick={() => onChange(model.id)}
                    className="flex items-center justify-between cursor-pointer h-9 py-0 hover:bg-[rgba(249,249,249,0.06)] focus:bg-[rgba(249,249,249,0.06)] focus:text-inherit"
                  />
                }
              >
                <div className="flex items-center gap-2">
                  <div>
                    <Image src={ClaudeIcon} alt="Claude" />
                  </div>
                  <span className="text-xs text-[rgba(249,249,249,0.7)]!">{model.name}</span>
                </div>
                {value === model.id && (
                  <CheckIcon className="size-3.5 text-white" />
                )}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={4}
                arrow={false}
                className="animate-none! hidden!"
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
