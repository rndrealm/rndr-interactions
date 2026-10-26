import React from "react";
import { Nav } from "@/components/yonda/nav";
import { Hero } from "@/components/yonda/hero";
import { Infrastructure } from "@/components/yonda/infrastructure";
import { BookDemo } from "@/components/yonda/book-demo";
import { TravelIdentity } from "@/components/yonda/travel-identity";
import { Privacy } from "@/components/yonda/privacy";
import { Ecosystem } from "@/components/yonda/ecosystem";
import { Stats } from "@/components/yonda/stats";
import { Footer } from "@/components/yonda/footer";

export default function Page() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white pb-29">
      <div className="flex flex-col px-4">
        <Nav />
        <Hero />
        <Infrastructure />
        <BookDemo />
        <TravelIdentity />
        <Privacy />
      </div>
      <Ecosystem />

      <div className="px-4">
        <Stats />
        <div className="app_landing_con">
          <div className="w-full h-95 bg-[#FAFAFA] rounded-[40px] shadow-[0_0_0_1px_#0000001C] mt-30"></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
