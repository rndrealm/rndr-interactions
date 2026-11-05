import { useRef } from "react";

const LONG_PRESS = 500;
const MOVE_TOLERANCE = 10;

type IState = {
  pointerId: number | null;
  startX: number;
  startY: number;
};

export const useLongPress = (
  longPressDuration = LONG_PRESS,
  moveTolerance = MOVE_TOLERANCE,
) => {
  const state = useRef<IState>({
    pointerId: null,
    startX: 0,
    startY: 0,
  });
  const isLongPress = useRef(false);
  const pressTimer = useRef<number | null>(null);

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  return {
    onPointerDown: (e: React.PointerEvent<Element>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      isLongPress.current = false;
      state.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      };

      pressTimer.current = window.setTimeout(() => {
        isLongPress.current = true;
      }, longPressDuration);
    },
    onPointerMove: (e: React.PointerEvent<Element>) => {
      if (e.pointerId !== state.current.pointerId) return;

      const dx = e.clientX - state.current.startX;
      const dy = e.clientY - state.current.startY;

      if (Math.hypot(dx, dy) > moveTolerance) cancelPress();
    },
    onPointerUp: cancelPress,
    onPointerCancel: cancelPress,
    onPointerLeave: cancelPress,
    onContextMenu: (e: React.MouseEvent<Element>) => e.preventDefault(),
    isLongPress,
  };
};
