"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";

const BOOK_WIDTH = 149;
const BOOK_HEIGHT = 201;
const LINE_LENGTH = 365;
const OPEN_ANGLE = -160;
const DRAG_SENSITIVITY = 0.4;

export default function PageCircle() {
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
    setRotation((prev) => ({
      x: prev.x - dy * DRAG_SENSITIVITY,
      y: prev.y + dx * DRAG_SENSITIVITY,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleClick = useCallback(() => {
    if (!didDrag.current) setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div
        style={{ perspective: 1200 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handleClick}
      >
        <div
          className="relative cursor-grab active:cursor-grabbing"
          style={{
            width: LINE_LENGTH,
            height: LINE_LENGTH,
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {/* Top dotted line */}
          <svg
            className="absolute top-1/2 left-0"
            style={{ marginTop: -(BOOK_HEIGHT / 2) }}
            xmlns="http://www.w3.org/2000/svg"
            width={LINE_LENGTH}
            height="2"
            fill="none"
            viewBox={`0 0 ${LINE_LENGTH} 2`}
          >
            <path
              stroke="#CFCBE1"
              strokeDasharray="9 9"
              strokeWidth="2"
              d={`M0 1h${LINE_LENGTH}`}
            />
          </svg>

          {/* Bottom dotted line */}
          <svg
            className="absolute top-1/2 left-0"
            style={{ marginTop: BOOK_HEIGHT / 2 }}
            xmlns="http://www.w3.org/2000/svg"
            width={LINE_LENGTH}
            height="2"
            fill="none"
            viewBox={`0 0 ${LINE_LENGTH} 2`}
          >
            <path
              stroke="#CFCBE1"
              strokeDasharray="9 9"
              strokeWidth="2"
              d={`M0 1h${LINE_LENGTH}`}
            />
          </svg>

          {/* Left dotted line */}
          <svg
            className="absolute left-1/2 top-0"
            style={{ marginLeft: -(BOOK_WIDTH / 2) }}
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height={LINE_LENGTH}
            fill="none"
            viewBox={`0 0 2 ${LINE_LENGTH}`}
          >
            <path
              stroke="#CFCBE1"
              strokeDasharray="9 9"
              strokeWidth="2"
              d={`M1 ${LINE_LENGTH}V0`}
            />
          </svg>

          {/* Right dotted line */}
          <svg
            className="absolute left-1/2 top-0"
            style={{ marginLeft: BOOK_WIDTH / 2 }}
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height={LINE_LENGTH}
            fill="none"
            viewBox={`0 0 2 ${LINE_LENGTH}`}
          >
            <path
              stroke="#CFCBE1"
              strokeDasharray="9 9"
              strokeWidth="2"
              d={`M1 ${LINE_LENGTH}V0`}
            />
          </svg>

          {/* Book */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: BOOK_WIDTH,
              height: BOOK_HEIGHT,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Back page (revealed when cover opens) */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#E7E3F2",
                borderRadius: "3px 17px 17px 3px",
                border: "3px solid #CFCBE1",
              }}
            />

            {/* Front cover — hinged on the left */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundColor: "#E7E3F2",
                borderRadius: "3px 17px 17px 3px",
                border: "3px solid #CFCBE1",
                transformOrigin: "left center",
              }}
              animate={{ rotateY: isOpen ? OPEN_ANGLE : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
