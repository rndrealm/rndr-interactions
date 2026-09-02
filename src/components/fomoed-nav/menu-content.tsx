"use client";
import React from "react";
import { motion } from "motion/react";
import { MenuGroup } from "./menu-group";
import { NavState } from "@/app/fomoed-nav/page";

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

export type IMenuData = (typeof offersData)[0];

interface IProps {
  state: NavState;
}

const sizeMap = {
  offer: {
    width: 820,
  },
  prediction: {
    width: 536,
  },
};

export function MenuContent(props: IProps) {
  const { state } = props;

  const stateKey = state || "offer";
  return (
    <motion.div
      className="h-77.5 rounded-[20px] bg-[#101010] shadow-[0px_0px_0px_1px_#1B1B1B] flex gap-2"
      initial={{ width: sizeMap[stateKey].width }}
      animate={{ width: sizeMap[stateKey].width }}
    >
      <MenuGroup title="OFFERS" data={offersData} />

      <MenuGroup title="USE CASES" data={useCasesData} />

      <div className="w-60 h-full py-3 mr-3">
        <div className="w-full h-full bg-[#1D1D1D] rounded-[8px]"></div>
      </div>
    </motion.div>
  );
}
