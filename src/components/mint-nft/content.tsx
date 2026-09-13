import React from "react";
import { AmountSelector } from "./amount-selector";
import { MintButton } from "./mint-button";
import { NftCanvas } from "./nft-canvas";
import { MintProgressProvider } from "./mint-progress";

export function Content() {
  return (
    <MintProgressProvider>
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col gap-6 p-6">
          <div className="">
            <h1 className="text-[64px] leading-16">
              rndr <br /> layers
            </h1>
          </div>

          <div className="flex-1 w-full h-full">
            <div className="h-full max-w-100">
              <NftCanvas />
            </div>
          </div>

          <div className="max-w-100 w-full">
            <p className="text-xs leading-4 text-[oklch(0.54_0.006_240)] tracking-0">
              At rndr realm we build in layers: identity, interface, then code
              that ships. A thousand of them, no two alike, three per wallet.
            </p>
          </div>
        </div>
        <div className="max-w-100 w-full flex-1 flex flex-col border-l border-[oklch(0.75_0.005_240)]">
          <div className="p-6 flex flex-col gap-5 border-b border-[oklch(0.75_0.005_240)]">
            <p className="uppercase text-[oklch(0.54_0.006_240)] text-[11px] leading-4 tracking-wider">
              Project details
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[oklch(0.4_0.005_240)] text-sm leading-5 tracking-0">
                  Total Supply
                </p>

                <p className="text-[oklch(0.2_0.003_240)] text-sm leading-5 tracking-0 font-semibold">
                  1,000
                </p>
              </div>
              <div className="w-full h-px bg-[oklch(0.98_0.001_240)]"></div>
              <div className="flex items-center justify-between">
                <p className="text-[oklch(0.4_0.005_240)] text-sm leading-5 tracking-0">
                  Current Price
                </p>

                <p className="text-[oklch(0.2_0.003_240)] text-sm leading-5 tracking-0 font-semibold">
                  0.08 ETH
                </p>
              </div>
              <div className="w-full h-px bg-[oklch(0.98_0.001_240)]"></div>
              <div className="flex items-center justify-between">
                <p className="text-[oklch(0.4_0.005_240)] text-sm leading-5 tracking-0">
                  Mint Limit
                </p>

                <p className="text-[oklch(0.2_0.003_240)] text-sm leading-5 tracking-0 font-semibold">
                  3 per wallet
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 border-b border-[oklch(0.75_0.005_240)] flex flex-col gap-4">
            <p className="uppercase text-[oklch(0.54_0.006_240)] text-[11px] leading-4 tracking-wider">
              Select Amount
            </p>

            <AmountSelector />
          </div>

          <div className="p-6 border-b border-[oklch(0.75_0.005_240)] flex flex-col gap-4">
            <p className="uppercase text-[oklch(0.54_0.006_240)] text-[11px] leading-4 tracking-wider">
              Network Status
            </p>

            <div className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 bg-[oklch(0.823_0.125_145)] rounded-full"></div>
              <p className="text-[oklch(0.4_0.005_240)] text-sm leading-5 tracking-0">
                Mainnet Connected
              </p>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-end">
            <MintButton />
          </div>
        </div>
      </div>
    </MintProgressProvider>
  );
}
