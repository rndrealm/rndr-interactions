import React from "react";
import { Footer } from "@/components/yonda/footer";
import { Nav } from "@/components/yonda/nav";
import { Hero } from "@/components/yonda/about/hero";
import { About } from "@/components/yonda/about/about";
import { Exists } from "@/components/yonda/about/exists";
import { Investors } from "@/components/yonda/about/investors";
import { Team } from "@/components/yonda/about/team";

export default function Page() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-29">
      <div className="flex flex-col px-4">
        <Nav />
        <Hero />
        <About />
        <Exists />
        <Investors />
        <Team />
      </div>
      <Footer />
    </div>
  );
}
