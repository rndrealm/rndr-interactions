"use client";

import { useState } from "react";
import * as motion from "motion/react-client";
import Code from "@/components/code-illustrations/code";

const actions = ["Swap", "Bridge", "Stake", "Lend"] as const;
type Action = (typeof actions)[number];

const requests: Record<Action, string> = {
  Swap: `POST /v1/swap

{
  "from": "ETH",
  "to": "USDC",
  "amount": 2.5,
  "slippage": 0.5,
  "chain": "ethereum"
}`,
  Bridge: `POST /v1/bridge

{
  "from": "USDC",
  "to": "USDC",
  "amount": 1000,
  "sourceChain": "ethereum",
  "destChain": "arbitrum"
}`,
  Stake: `POST /v1/stake

{
  "token": "ETH",
  "amount": 32,
  "validator": "0x1a2b...9f0e",
  "chain": "ethereum"
}`,
  Lend: `POST /v1/lend

{
  "token": "USDC",
  "amount": 5000,
  "protocol": "aave-v3",
  "chain": "ethereum"
}`,
};

export default function CodeIllustrationsPage() {
  const [action, setAction] = useState<Action>("Swap");

  return (
    <main className="min-h-screen bg-black flex justify-center items-center">
      <div className="mx-auto w-2xl p-8">
        <div className="flex gap-2 mb-4">
          {actions.map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                action === a ? "text-white" : "text-[#666] hover:text-[#888]"
              }`}
            >
              {action === a && (
                <motion.div
                  layoutId="active-action"
                  className="absolute inset-0 rounded-md bg-[#1a1a1a]"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">{a}</span>
            </button>
          ))}
        </div>
        <Code codeString={requests[action]} title="Executor" />
      </div>
    </main>
  );
}
