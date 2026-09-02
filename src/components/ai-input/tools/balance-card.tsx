"use client";

import { motion } from "motion/react";

interface BalanceResult {
  address: string;
  balances: Record<string, number>;
}

export default function BalanceCard({ result }: { result: BalanceResult }) {
  const entries = Object.entries(result.balances);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#262626] p-4 w-full max-w-sm"
      style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.16), 0px 1px 1px -0.5px rgba(0,0,0,0.18)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[rgba(249,249,249,0.4)] uppercase tracking-wide">
          Wallet Balance
        </span>
      </div>

      <div className="text-xs text-[rgba(249,249,249,0.3)] font-mono truncate mb-3">
        {result.address}
      </div>

      <div className="space-y-2">
        {entries.map(([token, balance]) => (
          <div
            key={token}
            className="flex items-center justify-between bg-[rgba(249,249,249,0.04)] rounded-lg px-3 py-2.5"
          >
            <span className="text-sm font-medium text-[#f9f9f9]">{token}</span>
            <span className="text-sm tabular-nums text-[#f9f9f9]">{balance}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
