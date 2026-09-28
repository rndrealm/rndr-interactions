import React from "react";
import { ChipField, HandleChip } from "@/components/nft-ui/identity";
import { Section } from "@/components/nft-ui/section";
import { INK, MUTED } from "@/components/nft-ui/ui";
import { Artwork } from "./artwork";
import { Details } from "./details";
import { ListingCard } from "./listing-card";
import { ListingProvider } from "./listing-state";
import { Provenance } from "./provenance";

export function Content() {
  return (
    <ListingProvider>
      <main className="mx-auto w-full max-w-[1440px] px-6 pb-28 md:px-10">
        <div className="pt-8">
          <Artwork />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-2">
          <div>
            <h1
              className={`text-[clamp(48px,5.5vw,76px)] leading-[0.95] font-semibold tracking-[-0.04em] text-balance ${INK}`}
            >
              Entry Point
            </h1>

            <div className="mt-9 flex flex-wrap gap-x-12 gap-y-6">
              <ChipField label="Created by">
                <HandleChip handle="rndrealm" />
              </ChipField>
              <ChipField label="Collection">
                <HandleChip handle="rndr-layers" name="RNDR LAYERS" square />
              </ChipField>
            </div>
          </div>

          <ListingCard />
        </div>

        <div className="mt-24 grid grid-cols-1 gap-x-16 gap-y-20 lg:grid-cols-2">
          <div className="flex flex-col gap-20">
            <Section title="Description">
              <p className={`text-[16px] leading-7 font-semibold ${INK}`}>
                Entry Point
              </p>
              <p
                className={`mt-4 max-w-[52ch] text-[16px] leading-7 text-pretty text-[oklch(0.35_0_0)]`}
              >
                A single frame from the rndr layers set, pulled before the
                interface was drawn over it. The way in is also the way back out.
              </p>
              <p className={`mt-6 text-[16px] leading-7 ${MUTED}`}>
                1/1
                <br />
                Resolution: 2880&times;1920px
              </p>
            </Section>

            <Details />
          </div>

          <Provenance />
        </div>
      </main>
    </ListingProvider>
  );
}
