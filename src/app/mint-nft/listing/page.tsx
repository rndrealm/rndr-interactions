import React from "react";
import { Header } from "@/components/nft-ui/header";
import { Footer } from "@/components/nft-ui/footer";
import { Content } from "@/components/nft-listing/content";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <Header />
      <Content />
      <Footer />
    </div>
  );
}
