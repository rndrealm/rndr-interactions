"use client";
import React, { useState } from "react";
import { MenuGroup } from "./menu-group";
import { NavState } from "@/app/fomoed-nav/page";
import { navTheme, type Theme } from "./theme";
import { MenuIllustration, type IllustrationId } from "./illustrations";

export interface IMenuData {
  id: number;
  title: string;
  description: string;
  /** The scene shown in the promo slot while this row is hovered. */
  illustration?: IllustrationId;
}

const offersData: IMenuData[] = [
  {
    id: 1,
    title: "Trading Terminal",
    description: "Powerful, Agile trading",
    illustration: "terminalHairline",
  },
  {
    id: 2,
    title: "Paper Trading",
    description: "Practice risk-free trading",
    illustration: "paperHairline",
  },
  {
    id: 3,
    title: "Trading Competition",
    description: "PVP Trading",
    illustration: "competitionHairline",
  },
  {
    id: 4,
    title: "Trade Execution",
    description: "Make money Online",
    illustration: "executionHairline",
  },
  {
    id: 5,
    title: "KOL",
    description: "Key Opinion leaders",
    illustration: "kolHairline",
  },
];

const useCasesData: IMenuData[] = [
  { id: 1, title: "Hedge Funds", description: "Trade on our platform in bulk" },
  {
    id: 2,
    title: "Bot Trading",
    description: "Get custom made bots for trading..",
  },
  { id: 3, title: "PVP Player trading", description: "PVP Trading" },
  { id: 4, title: "Marketing Funnels", description: "Make money Online" },
  {
    id: 5,
    title: "Real time agents and research",
    description: "Key Opinion leaders",
  },
];

const predictionsData: IMenuData[] = [
  { id: 1, title: "Event Markets", description: "Trade on real outcomes" },
  { id: 2, title: "Live Odds", description: "Prices that move with the news" },
  { id: 3, title: "Sports Markets", description: "Call it before full time" },
  { id: 4, title: "Create a Market", description: "Ask your own question" },
  { id: 5, title: "Leaderboard", description: "See who called it right" },
];

interface IProps {
  state: NavState;
  theme?: Theme;
}

export function MenuContent(props: IProps) {
  const { state, theme = "dark" } = props;

  const stateKey = state || "offer";
  const t = navTheme[theme];

  /**
   * The last row with a scene that was hovered. It sticks when the pointer
   * leaves, so crossing the gap between rows doesn't flash back to the default.
   */
  const [hovered, setHovered] = useState<IllustrationId | null>(null);

  const primaryData = stateKey === "prediction" ? predictionsData : offersData;
  const scenes = primaryData.flatMap((item) => item.illustration ?? []);
  // Only a scene from the visible menu counts; otherwise fall back to its first.
  const illustration =
    hovered && scenes.includes(hovered) ? hovered : (scenes[0] ?? null);

  const onItemHover = (item: IMenuData) => {
    if (item.illustration) setHovered(item.illustration);
  };

  return (
    <div
      className={`relative h-77.5 overflow-hidden rounded-[20px] ${t.panel} flex gap-0`}
    >
      <MenuGroup
        title={stateKey === "prediction" ? "PREDICTIONS" : "OFFERS"}
        data={primaryData}
        onItemHover={onItemHover}
        theme={theme}
      />

      <MenuGroup
        title="USE CASES"
        data={useCasesData}
        isVisible={stateKey === "offer"}
        onItemHover={onItemHover}
        theme={theme}
      />

      <div className="w-60 h-full py-3 mr-3">
        {illustration ? (
          <MenuIllustration id={illustration} theme={theme} />
        ) : (
          <div className={`w-full h-full ${t.promo} rounded-[8px]`}></div>
        )}
      </div>
    </div>
  );
}
