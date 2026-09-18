"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";

export type TabId = string | number;

export interface ConnectedTab {
  id: TabId;
  label: ReactNode;
  icon?: ReactNode;
}

export interface ConnectedTabsProps {
  tabs: ConnectedTab[];
  activeId?: TabId;
  defaultActiveId?: TabId;
  onActiveChange?: (id: TabId) => void;
  onClose?: (id: TabId) => void;
  onAdd?: () => void;
  onReorder?: (ids: TabId[]) => void;
  children?: ReactNode;

  tabWidth?: number;
  tabHeight?: number;
  radius?: number;
  gap?: number;
  surfaceInset?: number;
  stripTop?: number;
  curveX?: number;
  curveY?: number;
  easing?: (k: number) => number;

  surfaceColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

type Pt = [number, number];

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));
const lerp = (a: Pt, b: Pt, t: number): Pt => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const fmt = (n: number) => Math.round(n * 100) / 100;
const smoothstep = (k: number) => k * k * (3 - 2 * k);

function cubic(p1: Pt, c1: Pt, c2: Pt, p2: Pt) {
  return `C ${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`;
}

function corner(p1: Pt, c: Pt, p2: Pt, h1: number, h2: number) {
  const extent =
    Math.hypot(c[0] - p1[0], c[1] - p1[1]) +
    Math.hypot(p2[0] - c[0], p2[1] - c[1]);
  if (extent < 0.1) return `L ${fmt(p2[0])} ${fmt(p2[1])}`;
  return cubic(p1, lerp(p1, c, h1), lerp(p2, c, h2), p2);
}

export interface ConnectedPathGeometry {
  x0: number;
  tabWidth: number;
  tabHeight: number;
  surfaceTop: number;
  left: number;
  right: number;
  bottom: number;
  radius: number;
  curveX: number;
  curveY: number;
  easing: (k: number) => number;
}

export function buildConnectedPath(g: ConnectedPathGeometry) {
  const {
    x0,
    tabWidth,
    tabHeight,
    surfaceTop: T,
    left: BL,
    right: BR,
    bottom,
    radius: r,
    curveX: hx,
    curveY: hy,
    easing,
  } = g;
  const x1 = x0 + tabWidth;
  const yTop = T - tabHeight;
  const sL = Math.max(0, x0 - BL);
  const sR = Math.max(0, BR - x1);
  const kL = clamp(sL / Math.max(2 * r, 1e-3), 0, 1);
  const kR = clamp(sR / Math.max(2 * r, 1e-3), 0, 1);

  const rT = clamp(r, 0, Math.min(tabWidth / 2, tabHeight / 2));
  const fV = clamp(r, 0, tabHeight - rT);

  const sParams = (s: number, k: number) => {
    const fullH = r + fV;
    const v = (hy * fullH) / 2;
    const phiSig = Math.atan2(s, fullH - v);
    const w = easing(k);
    const phi = phiSig + (Math.PI / 2 - phiSig) * w;
    const endLen = 0.5 + 0.5 * w;
    const mSig = Math.hypot(s / 4, (fullH - v) / 4);
    const mLen = mSig + (hx * r - mSig) * w;
    return { phi, endLen, mLen };
  };

  const capM = (mLen: number, phi: number, halfW: number, halfH: number) =>
    Math.min(
      mLen,
      halfW / Math.max(Math.sin(phi), 1e-3),
      halfH / Math.max(Math.cos(phi), 1e-3),
    );

  const leftSegs: string[] = [];
  if (r > 0.05 && sL < 2 * r - 0.01) {
    const { phi, endLen, mLen } = sParams(sL, kL);
    const d: Pt = [Math.sin(phi), -Math.cos(phi)];
    const mBody = capM(mLen, phi, sL / 2, r);
    const mTab = capM(mLen, phi, sL / 2, fV);
    const m: Pt = [BL + sL / 2, T];
    leftSegs.push(
      cubic(
        [BL, T + r],
        [BL, T + r - hy * r * endLen],
        [m[0] - d[0] * mBody, m[1] - d[1] * mBody],
        m,
      ),
      cubic(
        m,
        [m[0] + d[0] * mTab, m[1] + d[1] * mTab],
        [x0, T - fV + hy * fV * endLen],
        [x0, T - fV],
      ),
    );
  } else {
    const w = Math.min(r, sL);
    leftSegs.push(
      corner([BL, T + r], [BL, T], [BL + w, T], hy, hx),
      `L ${fmt(x0 - w)} ${fmt(T)}`,
      corner([x0 - w, T], [x0, T], [x0, T - fV], hx, hy),
    );
  }

  const rightSegs: string[] = [];
  if (r > 0.05 && sR < 2 * r - 0.01) {
    const { phi, endLen, mLen } = sParams(sR, kR);
    const d: Pt = [Math.sin(phi), Math.cos(phi)];
    const mBody = capM(mLen, phi, sR / 2, r);
    const mTab = capM(mLen, phi, sR / 2, fV);
    const m: Pt = [x1 + sR / 2, T];
    rightSegs.push(
      cubic(
        [x1, T - fV],
        [x1, T - fV + hy * fV * endLen],
        [m[0] - d[0] * mTab, m[1] - d[1] * mTab],
        m,
      ),
      cubic(
        m,
        [m[0] + d[0] * mBody, m[1] + d[1] * mBody],
        [BR, T + r - hy * r * endLen],
        [BR, T + r],
      ),
    );
  } else {
    const w = Math.min(r, sR);
    rightSegs.push(
      corner([x1, T - fV], [x1, T], [x1 + w, T], hy, hx),
      `L ${fmt(BR - w)} ${fmt(T)}`,
      corner([BR - w, T], [BR, T], [BR, T + r], hx, hy),
    );
  }

  const d = [
    `M ${fmt(BL)} ${fmt(bottom)}`,
    `L ${fmt(BL)} ${fmt(T + r)}`,
    ...leftSegs,
    `L ${fmt(x0)} ${fmt(yTop + rT)}`,
    corner([x0, yTop + rT], [x0, yTop], [x0 + rT, yTop], hy, hx),
    `L ${fmt(x1 - rT)} ${fmt(yTop)}`,
    corner([x1 - rT, yTop], [x1, yTop], [x1, yTop + rT], hx, hy),
    `L ${fmt(x1)} ${fmt(T - fV)}`,
    ...rightSegs,
    `L ${fmt(BR)} ${fmt(bottom)}`,
    "Z",
  ].join(" ");

  return d;
}

function animate(
  target: { x: number },
  to: number,
  ms: number,
  onUpdate: () => void,
) {
  const from = target.x;
  const t0 = performance.now();
  let raf = requestAnimationFrame(function tick(now: number) {
    const p = clamp((now - t0) / ms, 0, 1);
    target.x = from + (to - from) * (1 - Math.pow(1 - p, 5));
    onUpdate();
    if (p < 1) raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}

const prefersReducedMotion = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ConnectedTabs({
  tabs,
  activeId: controlledActiveId,
  defaultActiveId,
  onActiveChange,
  onClose,
  onAdd,
  onReorder,
  children,
  tabWidth = 190,
  tabHeight = 52,
  radius = 20,
  gap = 4,
  surfaceInset = 28,
  stripTop = 28,
  curveX = 0.82,
  curveY = 0.82,
  easing = smoothstep,
  surfaceColor = "#fbfbfb",
  activeTextColor = "#1c1c1c",
  inactiveTextColor = "#9a9a9a",
}: ConnectedTabsProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  // console.log("uid:", uid);

  const [order, setOrder] = useState<TabId[]>(() => tabs.map((t) => t.id));
  const [prevTabs, setPrevTabs] = useState(tabs);
  if (tabs !== prevTabs) {
    setPrevTabs(tabs);
    const ids = new Set(tabs.map((t) => t.id));
    const kept = order.filter((id) => ids.has(id));
    const keptSet = new Set(kept);
    const next = [...kept];
    for (const t of tabs) if (!keptSet.has(t.id)) next.push(t.id);
    if (next.length !== order.length || next.some((id, i) => id !== order[i]))
      setOrder(next);
  }
  const ordered = useMemo(
    () =>
      order
        .map((id) => tabs.find((t) => t.id === id))
        .filter((t): t is ConnectedTab => !!t),
    [order, tabs],
  );

  const [internalActiveId, setInternalActiveId] = useState<TabId | undefined>(
    defaultActiveId ?? tabs[0]?.id,
  );
  const activeId = controlledActiveId ?? internalActiveId;
  const setActive = (id: TabId) => {
    setInternalActiveId(id);
    onActiveChange?.(id);
  };

  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const T = stripTop + tabHeight;
  const BL = surfaceInset;
  const BR = size.w - surfaceInset;
  const yTop = stripTop;
  const slotX = useCallback(
    (i: number) => BL + i * (tabWidth + gap),
    [BL, tabWidth, gap],
  );

  const posRef = useRef(new Map<TabId, { x: number }>());
  const cancelRef = useRef(new Map<TabId, () => void>());
  const dragRef = useRef<{
    id: TabId;
    pointerStart: number;
    xStart: number;
    moved: boolean;
  } | null>(null);
  const pos = (id: TabId, slot: number) => {
    let p = posRef.current.get(id);
    if (!p) {
      p = { x: slotX(slot) };
      posRef.current.set(id, p);
    }
    return p;
  };
  const stopTween = (id: TabId) => {
    cancelRef.current.get(id)?.();
    cancelRef.current.delete(id);
  };
  const tweenTo = (id: TabId, p: { x: number }, x: number, ms: number) => {
    stopTween(id);
    if (prefersReducedMotion()) {
      p.x = x;
      rerender();
      return;
    }
    cancelRef.current.set(id, animate(p, x, ms, rerender));
  };

  useEffect(() => {
    ordered.forEach((t, i) => {
      if (dragRef.current?.id === t.id) return;
      const p = pos(t.id, i);
      const target = slotX(i);
      if (Math.abs(p.x - target) >= 0.5) tweenTo(t.id, p, target, 220);
    });
    rerender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered, tabWidth, gap, size.w, slotX]);

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  });

  const endDragRef = useRef<(() => void) | null>(null);
  useEffect(() => () => endDragRef.current?.(), []);

  const onPointerDown = (e: ReactPointerEvent, id: TabId) => {
    if (dragRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is an optimisation, not a requirement */
    }
    const p = pos(id, order.indexOf(id));
    stopTween(id);
    dragRef.current = {
      id,
      pointerStart: e.clientX,
      xStart: p.x,
      moved: false,
    };
    if (id !== activeId) setActive(id);

    const pointerId = e.pointerId;
    const minX = BL;
    const maxX = BR - tabWidth;
    const step = tabWidth + gap;

    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== pointerId) return;
      const dx = ev.clientX - d.pointerStart;
      if (!d.moved && Math.abs(dx) < 3) return;
      d.moved = true;
      const pd = posRef.current.get(d.id);
      if (!pd) return;
      pd.x = clamp(d.xStart + dx, minX, maxX);
      const i = orderRef.current.indexOf(d.id);
      const targetIdx = clamp(
        Math.round((pd.x - minX) / step),
        0,
        orderRef.current.length - 1,
      );
      if (targetIdx !== i) {
        const next = [...orderRef.current];
        const [moved] = next.splice(i, 1);
        next.splice(targetIdx, 0, moved);
        orderRef.current = next;
        setOrder(next);
        onReorder?.(next);
      }
      rerender();
    };

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      teardown();
      const d = dragRef.current;
      dragRef.current = null;
      if (!d) return;
      if (!d.moved) {
        rerender();
        return;
      }
      const i = orderRef.current.indexOf(d.id);
      const pd = posRef.current.get(d.id);
      if (!pd) return;
      const target = minX + i * step;
      const ms = clamp(160 + Math.abs(pd.x - target) * 0.5, 180, 420);
      tweenTo(d.id, pd, target, ms);
    };

    const teardown = () => {
      endDragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    endDragRef.current = teardown;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const activeIdx = Math.max(
    ordered.findIndex((t) => t.id === activeId),
    0,
  );
  const active = ordered[activeIdx];
  const geo =
    active && size.w > 0
      ? buildConnectedPath({
          x0: pos(active.id, activeIdx).x,
          tabWidth,
          tabHeight,
          surfaceTop: T,
          left: BL,
          right: BR,
          bottom: size.h,
          radius,
          curveX,
          curveY,
          easing,
        })
      : null;

  const draggingId = dragRef.current?.moved ? dragRef.current.id : null;

  return (
    <div
      ref={containerRef}
      role="tablist"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        .ct-tab-${uid} { transition: background-color .15s, box-shadow .15s; }
        .ct-wrap-${uid}:hover .ct-tab-${uid}[data-state="idle"] { background: rgba(255,255,255,.05); }
        .ct-close-${uid} { opacity: 0; transition: opacity .15s, background-color .15s; }
        .ct-wrap-${uid}:hover .ct-close-${uid}, .ct-close-${uid}[data-active="true"] { opacity: 1; }
        .ct-close-${uid}[data-active="true"]:hover { background: rgba(0,0,0,.1); }
        .ct-close-${uid}[data-active="false"]:hover { background: rgba(255,255,255,.1); }
      `}</style>

      {geo && (
        <svg
          width={size.w}
          height={size.h}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 25,
            pointerEvents: "none",
          }}
        >
          <path d={geo} fill={surfaceColor} />
        </svg>
      )}

      {geo && children != null && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 26,
            clipPath: `path("${geo}")`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: BL,
              right: size.w - BR,
              top: T,
              bottom: 0,
            }}
          >
            {children}
          </div>
        </div>
      )}

      {ordered.map((t, i) => {
        const p = pos(t.id, i);
        const isActive = t.id === activeId;
        const isDragging = t.id === draggingId;
        const pillH = tabHeight - gap;
        const pillTopR = Math.min(radius, pillH / 2);
        const pillBottomR = clamp(radius - gap, 2, pillH / 2);
        return (
          <div
            key={t.id}
            className={`ct-wrap-${uid}`}
            style={{
              position: "absolute",
              left: p.x,
              top: yTop,
              width: tabWidth,
              height: tabHeight,
              zIndex: isActive ? 30 : isDragging ? 20 : 10,
            }}
          >
            <div
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActive(t.id);
              }}
              className={`ct-tab-${uid}`}
              data-state={
                isActive ? "active" : isDragging ? "dragging" : "idle"
              }
              style={{
                position: "absolute",
                inset: isActive ? 0 : `0 0 ${gap}px 0`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: onClose
                  ? `0 40px ${isActive ? gap : 0}px 16px`
                  : `0 16px ${isActive ? gap : 0}px 16px`,
                boxSizing: "border-box",
                borderRadius: isActive
                  ? 0
                  : `${pillTopR}px ${pillTopR}px ${pillBottomR}px ${pillBottomR}px`,
                ...({ cornerShape: "squircle" } as CSSProperties),
                color: isActive ? activeTextColor : inactiveTextColor,
                background:
                  isDragging && !isActive ? "rgba(255,255,255,.09)" : undefined,
                boxShadow:
                  isDragging && !isActive
                    ? "0 12px 32px rgba(0,0,0,.4)"
                    : undefined,
                cursor: isDragging ? "grabbing" : "pointer",
                touchAction: "none",
              }}
              onPointerDown={(e) => onPointerDown(e, t.id)}
            >
              {t.icon}
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {t.label}
              </span>
            </div>
            {onClose && (
              <button
                type="button"
                aria-label="Close tab"
                className={`ct-close-${uid}`}
                data-active={isActive}
                style={{
                  position: "absolute",
                  right: 8,
                  top: `calc(50% - ${gap / 2}px)`,
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  border: 0,
                  borderRadius: 6,
                  background: "transparent",
                  color: isActive ? activeTextColor : inactiveTextColor,
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => onClose(t.id)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        );
      })}

      {onAdd && (
        <button
          type="button"
          aria-label="New tab"
          style={{
            position: "absolute",
            left: slotX(ordered.length) + 6,
            top: yTop + tabHeight / 2 - 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            border: 0,
            borderRadius: "50%",
            background: "transparent",
            color: inactiveTextColor,
            cursor: "pointer",
          }}
          onClick={onAdd}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
