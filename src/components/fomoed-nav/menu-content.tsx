"use client";
import React from "react";
import { MenuGroup } from "./menu-group";
import { NavState } from "@/app/fomoed-nav/page";
import { navTheme, type Theme } from "./theme";

const offersData = [
  { id: 1, title: "Trading Terminal", description: "Powerful, Agile trading" },
  { id: 2, title: "Paper Trading", description: "Practice risk-free trading" },
  { id: 3, title: "Trading Competition", description: "PVP Trading" },
  { id: 4, title: "Trade Execution", description: "Make money Online" },
  { id: 5, title: "KOL", description: "Key Opinion leaders" },
];

const useCasesData = [
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

const predictionsData = [
  { id: 1, title: "Event Markets", description: "Trade on real outcomes" },
  { id: 2, title: "Live Odds", description: "Prices that move with the news" },
  { id: 3, title: "Sports Markets", description: "Call it before full time" },
  { id: 4, title: "Create a Market", description: "Ask your own question" },
  { id: 5, title: "Leaderboard", description: "See who called it right" },
];

export type IMenuData = (typeof offersData)[0];

interface IProps {
  state: NavState;
  theme?: Theme;
}

export function MenuContent(props: IProps) {
  const { state, theme = "dark" } = props;

  const stateKey = state || "offer";
  const t = navTheme[theme];

  return (
    <div
      className={`relative h-77.5 overflow-hidden rounded-[20px] ${t.panel} flex gap-0`}
    >
      <MenuGroup
        title={stateKey === "prediction" ? "PREDICTIONS" : "OFFERS"}
        data={stateKey === "prediction" ? predictionsData : offersData}
        theme={theme}
      />

      <MenuGroup
        title="USE CASES"
        data={useCasesData}
        isVisible={stateKey === "offer"}
        theme={theme}
      />

      <div className="w-60 h-full py-3 mr-3">
        <div className={`w-full h-full ${t.promo} rounded-[8px]`}></div>
      </div>
    </div>
  );
}
