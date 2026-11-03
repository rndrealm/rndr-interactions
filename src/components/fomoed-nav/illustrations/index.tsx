"use client";
import React from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { navTheme, type Theme } from "../theme";
import { VIEW_BOX } from "./shared";
import { Terminal } from "./terminal";
import { TerminalHairline } from "./terminal-hairline";
import { Paper } from "./paper";
import { PaperHairline } from "./paper-hairline";
import { Competition } from "./competition";
import { CompetitionPodium } from "./competition-podium";
import { CompetitionHairline } from "./competition-hairline";
import { Execution } from "./execution";
import { ExecutionHairline } from "./execution-hairline";
import { Kol } from "./kol";
import { KolNetwork } from "./kol-network";
import { KolHairline } from "./kol-hairline";
import { Hedge } from "./hedge";
import { Bots } from "./bots";
import { Pvp } from "./pvp";
import { Funnels } from "./funnels";
import { Agents } from "./agents";
import { Events } from "./events";
import { Odds } from "./odds";
import { Sports } from "./sports";
import { Create } from "./create";
import { Leaderboard } from "./leaderboard";

export type IllustrationId =
  | "terminal"
  | "terminalHairline"
  | "paper"
  | "paperHairline"
  | "competition"
  | "competitionPodium"
  | "competitionHairline"
  | "execution"
  | "executionHairline"
  | "kol"
  | "kolNetwork"
  | "kolHairline"
  | "hedge"
  | "bots"
  | "pvp"
  | "funnels"
  | "agents"
  | "events"
  | "odds"
  | "sports"
  | "create"
  | "leaderboard";

const ILLUSTRATIONS: Record<IllustrationId, () => React.JSX.Element> = {
  terminal: Terminal,
  terminalHairline: TerminalHairline,
  paper: Paper,
  paperHairline: PaperHairline,
  competition: Competition,
  competitionPodium: CompetitionPodium,
  competitionHairline: CompetitionHairline,
  execution: Execution,
  executionHairline: ExecutionHairline,
  kol: Kol,
  kolNetwork: KolNetwork,
  kolHairline: KolHairline,
  hedge: Hedge,
  bots: Bots,
  pvp: Pvp,
  funnels: Funnels,
  agents: Agents,
  events: Events,
  odds: Odds,
  sports: Sports,
  create: Create,
  leaderboard: Leaderboard,
};

interface IProps {
  id: IllustrationId;
  theme?: Theme;
}

/**
 * The promo slot. Scenes crossfade through a blur, and each one replays its
 * entrance on mount — keying by `id` is what remounts it on every hover.
 */
export function MenuIllustration(props: IProps) {
  const { id, theme = "dark" } = props;

  const t = navTheme[theme];
  const Illustration = ILLUSTRATIONS[id];

  return (
    // TODO: back to "user" before shipping — off while iterating on motion.
    <MotionConfig reducedMotion="never">
      <div
        className={`relative w-full h-full overflow-hidden rounded-[8px] font-sans ${t.promo} ${t.illustration}`}
      >
        <AnimatePresence>
          <motion.div
            key={id}
            className="absolute inset-0"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <svg viewBox={VIEW_BOX} aria-hidden="true" className="size-full">
              <Illustration />
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
