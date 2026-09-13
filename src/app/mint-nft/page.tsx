import React from "react";
import { Header } from "@/components/mint-nft/header";
import { Footer } from "@/components/mint-nft/footer";
import { Content } from "@/components/mint-nft/content";

export default function Page() {
  return (
    <div className="w-full h-screen flex flex-col border-l border-r border-[oklch(0.75_0.005_240)]">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}
