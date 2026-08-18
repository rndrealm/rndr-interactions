"use client";

import React from "react";

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-[oklch(0.1_0_0)] h-screen w-screen flex items-center justify-center relative">
      {children}
    </main>
  );
};

export default SidebarLayout;
