"use client";

import { useEffect, useRef, useState } from "react";
import {
  ConnectedTabs,
  type ConnectedTab,
} from "@/components/connected-tabs/connected-tabs";

const DOT_COLORS = ["#e0762d", "#2ea365", "#7048c8", "#2563ab"];

const STRIP_TOP = 28;
const TAB_HEIGHT = 52;
const BODY_SHOW = 72;

function DotIcon({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        flexShrink: 0,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 0 3px ${color}33`,
      }}
    />
  );
}

function DotsGrid({ spacing = 30 }: { spacing?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(spacing);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const cols = Math.max(1, Math.round(w / spacing));
      setStep(w / cols);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [spacing]);
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: "radial-gradient(#dcdcdc 1.7px, transparent 1.7px)",
        backgroundSize: `${step}px ${step}px`,
        backgroundPosition: "0 0",
      }}
    />
  );
}

let nextId = 3;

const makeTab = (id: number, label: string): ConnectedTab => ({
  id,
  label,
  icon: <DotIcon color={DOT_COLORS[(id - 1) % DOT_COLORS.length]} />,
});

export default function ConnectedTabsPage() {
  const [tabs, setTabs] = useState<ConnectedTab[]>([
    makeTab(1, "Tab 1"),
    makeTab(2, "Tab 2"),
  ]);

  const frameH = STRIP_TOP + TAB_HEIGHT + BODY_SHOW;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#0d0d0d",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "min(560px, calc(100vw - 40px))",
          height: frameH,
          overflow: "hidden",
          borderRadius: 22,
          background: "#1c1c1c",
        }}
      >
        <ConnectedTabs
          tabs={tabs}
          tabHeight={TAB_HEIGHT}
          stripTop={STRIP_TOP}
          onClose={(id) => setTabs((t) => t.filter((x) => x.id !== id))}
          onAdd={() => {
            const id = nextId++;
            setTabs((t) => [...t, makeTab(id, `Tab ${id}`)]);
          }}
        >
          <DotsGrid />
        </ConnectedTabs>
      </div>
    </div>
  );
}
