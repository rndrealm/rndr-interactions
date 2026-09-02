"use client";

import React, { useState } from "react";
import { GridButton } from "@/components/photoyoshi/grid-button";
import { RowButton } from "@/components/photoyoshi/row-button";

type View = "grid" | "row";

export default function Page() {
  const [view, setView] = useState<View>("grid");

  return (
    <div className="h-screen w-full flex items-center justify-center gap-2">
      <GridButton isActive={false} onClick={() => setView("grid")} />
      <RowButton isActive={false} onClick={() => setView("row")} />
    </div>
  );
}
