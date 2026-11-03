"use client";
import React, { useState } from "react";
import {
  MenuIllustration,
  type IllustrationId,
} from "@/components/fomoed-nav/illustrations";
import { navTheme, type Theme } from "@/components/fomoed-nav/theme";

const groups: { title: string; items: { id: IllustrationId; title: string }[] }[] = [
  {
    title: "OFFERS",
    items: [
      { id: "terminal", title: "Trading Terminal" },
      { id: "terminalHairline", title: "Trading Terminal (hairline)" },
      { id: "paper", title: "Paper Trading" },
      { id: "paperHairline", title: "Paper Trading (hairline)" },
      { id: "competition", title: "Trading Competition" },
      { id: "competitionPodium", title: "Trading Competition (podium)" },
      { id: "competitionHairline", title: "Trading Competition (hairline)" },
      { id: "execution", title: "Trade Execution" },
      { id: "executionHairline", title: "Trade Execution (hairline)" },
      { id: "kol", title: "KOL" },
      { id: "kolNetwork", title: "KOL (network)" },
      { id: "kolHairline", title: "KOL (hairline)" },
    ],
  },
  {
    title: "USE CASES",
    items: [
      { id: "hedge", title: "Hedge Funds" },
      { id: "bots", title: "Bot Trading" },
      { id: "pvp", title: "PVP Player trading" },
      { id: "funnels", title: "Marketing Funnels" },
      { id: "agents", title: "Real time agents and research" },
    ],
  },
  {
    title: "PREDICTIONS",
    items: [
      { id: "events", title: "Event Markets" },
      { id: "odds", title: "Live Odds" },
      { id: "sports", title: "Sports Markets" },
      { id: "create", title: "Create a Market" },
      { id: "leaderboard", title: "Leaderboard" },
    ],
  },
];

/** Click a scene to replay it; "Replay all" remounts the whole grid. */
export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [replays, setReplays] = useState<Record<string, number>>({});
  const [generation, setGeneration] = useState(0);

  const t = navTheme[theme];

  const replay = (id: IllustrationId) =>
    setReplays((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));

  return (
    <div className={`min-h-screen w-full ${t.pageBg} font-sans`}>
      <div className="max-w-[1376px] mx-auto px-6 md:px-12 py-12 flex flex-col gap-12">
        <header
          className={`sticky top-0 z-10 -my-3 py-3 ${t.pageBg} flex items-center justify-between gap-4`}
        >
          <p className={`${t.itemTitle} text-[13px] font-medium`}>
            Menu illustrations
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGeneration((g) => g + 1)}
              className={`h-7 px-2 rounded-[6px] text-[13px] font-medium cursor-pointer ${t.loginButton}`}
            >
              Replay all
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`h-7 px-2 rounded-[6px] text-[13px] font-medium cursor-pointer ${t.signUpButton}`}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-4">
            <p className={`${t.groupTitle} text-[11px] font-medium`}>
              {group.title}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,240px)] gap-6">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => replay(item.id)}
                  className="flex flex-col gap-2 text-left cursor-pointer"
                >
                  <div className="w-60 h-71.5">
                    <MenuIllustration
                      key={`${generation}-${replays[item.id] ?? 0}`}
                      id={item.id}
                      theme={theme}
                    />
                  </div>
                  <span className={`${t.itemDescription} text-[11px]`}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
